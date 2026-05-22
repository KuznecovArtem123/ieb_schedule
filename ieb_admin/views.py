import os
from uuid import uuid4

from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.cache import cache
from django.core.files import File
from django.core.files.storage import default_storage
from django.utils import timezone
from .models import Schedule
from .schedule_rollover import maybe_rollover_schedules
from schedule.models import *
from .utils.ScheduleReader import ScheduleReader
from .upload_cleanup import cancel_pending_schedule, complete_pending_upload
from .forms import (
    AdminLoginForm,
    GroupForm,
    LessonAdminForm,
    LessonErrorFormSet,
    ScheduleDeleteForm,
    ScheduleUploadForm,
    TeacherForm,
    initial_from_schedule_error,
)


# auth
def loginView(request):
    if request.user.is_authenticated:
        if request.user.is_staff or request.user.is_superuser:
            return redirect('panel')
        
    form = AdminLoginForm(request, data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            login(request, form.get_user())
            return redirect('panel')
        messages.error(request, 'Неверное имя или пароль')

    return render(request, 'login.html', {'form': form})

@login_required(login_url='/admin/login/')
def logoutView(request):
    cancel_pending_schedule(request, notify=False)
    logout(request)
    return redirect('login')
# schedule
def _notify_weekly_rollover(request):
    rollover_results = maybe_rollover_schedules()
    if not rollover_results:
        return

    notify_key = f'schedule_rollover_notify_{timezone.localdate().isoformat()}'
    if cache.get(notify_key):
        return

    for message in rollover_results:
        messages.success(request, message)
    cache.set(notify_key, True, 60 * 60 * 48)


@login_required(login_url='/admin/login/')
def panelView(request):
    _notify_weekly_rollover(request)

    current_edu = request.GET.get('edu') or 'spo'
    current_week = request.GET.get('week') or 'this'
    group_department = current_edu.upper()

    groups = Group.objects.values('code').order_by('code').filter(department=group_department)
    if any(group.get('code') == request.GET.get('group') for group in groups):
        current_group = request.GET.get('group')  
    else:
        current_group = groups.first().get('code') if groups.first() else ''

    active_parametrs = {'edu': current_edu, "week":current_week, 'group': current_group}

    if current_group:
        current_group_obj = get_object_or_404(Group, code=current_group)
        if current_group_obj.department == 'VO':
            active_parametrs['edu'] = 'vo'
        if current_group_obj.department == 'SPO':
            active_parametrs['edu'] = 'spo'

        lessons = Lesson.objects.filter(schedule__edu=current_edu, schedule__week=current_week, group=current_group_obj).prefetch_related('teachers')
        return render(request, 'panel.html', {
            'lessons': lessons,
            'groups': groups,
            'active_parametrs': active_parametrs,
            'schedules': Schedule.objects.all().order_by('-uploaded_at'),
            'delete_form': ScheduleDeleteForm(),
        })
    
    return render(request, 'panel.html', {
        'active_parametrs': active_parametrs,
        'schedules': Schedule.objects.all().order_by('-uploaded_at'),
        'delete_form': ScheduleDeleteForm(),
    })


def _clear_pending_upload(request):
    pending = request.session.pop('pending_upload', None)
    if pending and pending.get('file_path') and default_storage.exists(pending['file_path']):
        default_storage.delete(pending['file_path'])


def _store_pending_upload(request, edu, week, existing_id, uploaded_file):
    _clear_pending_upload(request)
    path = default_storage.save(f'pending_uploads/{uuid4().hex}.xlsx', uploaded_file)
    request.session['pending_upload'] = {
        'edu': edu,
        'week': week,
        'existing_id': existing_id,
        'file_path': path,
    }


def _continue_schedule_processing(request, schedule, edu, week, file_obj):
    """Продолжить загрузку: обновить файл у существующей записи или создать новую."""
    ScheduleError.objects.all().delete()
    schedule.edu = edu
    schedule.week = week
    schedule.file = file_obj
    schedule.save()
    request.session['fileId'] = schedule.id
    request.session['upload_is_overwrite'] = False
    return redirect('process')


def _start_schedule_processing(request, edu, week, file_obj):
    pending_id = request.session.get('fileId')
    if pending_id:
        Schedule.objects.filter(id=pending_id).delete()

    uploaded = Schedule.objects.create(week=week, edu=edu, file=file_obj)
    request.session['fileId'] = uploaded.id
    request.session['upload_is_overwrite'] = False
    return redirect('process')


def _complete_overwrite_upload(request):
    pending = request.session.get('pending_upload')
    if not pending:
        messages.error(request, 'Нет данных для перезаписи. Загрузите файл снова.')
        return redirect('upload')

    existing = get_object_or_404(Schedule, id=pending['existing_id'])
    Lesson.objects.filter(schedule=existing).delete()
    ScheduleError.objects.all().delete()

    with default_storage.open(pending['file_path'], 'rb') as stored_file:
        existing.file.save(os.path.basename(pending['file_path']), File(stored_file), save=True)

    existing.edu = pending['edu']
    existing.week = pending['week']
    existing.save()

    _clear_pending_upload(request)
    request.session['fileId'] = existing.id
    request.session['upload_is_overwrite'] = True
    return redirect('process')


@login_required(login_url='/admin/login/')
def uploadView(request):
    if request.method == 'POST':
        action = request.POST.get('action', 'upload')

        if action == 'cancel_overwrite':
            _clear_pending_upload(request)
            messages.info(request, 'Загрузка отменена.')
            return redirect('upload')

        if action == 'overwrite':
            return _complete_overwrite_upload(request)

        form = ScheduleUploadForm(request.POST, request.FILES)
        if form.is_valid():
            edu = form.cleaned_data['edu']
            week = form.cleaned_data['week']
            file = form.cleaned_data['schedule']
            pending_id = request.session.get('fileId')
            existing = Schedule.objects.filter(edu=edu, week=week).first()

            if existing and str(existing.id) != str(pending_id or ''):
                if not existing.lessons.exists():
                    existing.delete()
                    existing = None
                else:
                    _store_pending_upload(request, edu, week, existing.id, file)
                    return render(request, 'upload_confirm.html', {
                        'existing': existing,
                        'edu_label': existing.get_edu_display(),
                        'week_label': existing.get_week_display(),
                    })

            try:
                if existing and str(existing.id) == str(pending_id or ''):
                    return _continue_schedule_processing(request, existing, edu, week, file)
                return _start_schedule_processing(request, edu, week, file)
            except Exception:
                messages.error(request, 'Не удалось загрузить файл')
        else:
            messages.error(request, 'Проверьте заполнение формы')
    else:
        form = ScheduleUploadForm()

    return render(request, 'upload.html', {'form': form})

def _error_form_initial(error):
    data = initial_from_schedule_error(error)
    data['error_id'] = error.id
    return data


def _redirect_to_panel_after_upload(schedule_file):
    return redirect(f"{reverse('panel')}?edu={schedule_file.edu}&week={schedule_file.week}")


def _abort_schedule_upload(request, schedule_file, message):
    cancel_pending_schedule(request, schedule=schedule_file, notify=False)
    messages.error(request, message)


def _redirect_if_department_mismatch(request, reader, schedule_file):
    mismatches = reader.get_department_mismatches()
    if not mismatches:
        return None

    if len(mismatches) == 1:
        message = mismatches[0]
    else:
        message = 'В файле есть группы другого отделения (Например вы выбрали СПО, а в файле есть группы ВО)'

    _abort_schedule_upload(request, schedule_file, message)
    return redirect('upload')


@login_required(login_url='/admin/login/')
def cancelProcessView(request):
    cancel_pending_schedule(request, notify=True)
    return redirect('upload')


@login_required(login_url='/admin/login/')
def processView(request):
    file_id = request.session.get('fileId')
    if not file_id:
        return redirect('upload')

    schedule_file = get_object_or_404(Schedule, id=file_id)
    reader = ScheduleReader(schedule_file, Teacher, Lesson, Group, ScheduleError)

    mismatch_redirect = _redirect_if_department_mismatch(request, reader, schedule_file)
    if mismatch_redirect:
        return mismatch_redirect

    if request.method == 'POST':
        reader.validate_data(log_errors=False)
        exceptions = list(ScheduleError.objects.all().order_by('id'))
        formset = LessonErrorFormSet(request.POST)

        if formset.is_valid():
            for form in formset:
                error_id = form.cleaned_data.get('error_id')
                if not error_id:
                    continue
                error = ScheduleError.objects.filter(id=error_id).first()
                if error:
                    reader.fix_error(error, form.cleaned_data)

            if not ScheduleError.objects.exists():
                reader.upload_to_db()
                ScheduleError.objects.all().delete()
                messages.success(request, 'Расписание успешно загружено.')
                response = _redirect_to_panel_after_upload(schedule_file)
                complete_pending_upload(request)
                return response

            messages.info(request, 'Часть ошибок исправлена. Доработайте оставшиеся записи.')
        else:
            messages.error(request, 'Проверьте заполнение полей в формах.')

        exceptions = list(ScheduleError.objects.all().order_by('id'))
        if not exceptions:
            reader.upload_to_db()
            response = _redirect_to_panel_after_upload(schedule_file)
            complete_pending_upload(request)
            return response

        if formset.is_valid():
            initial_data = [_error_form_initial(e) for e in exceptions]
            formset = LessonErrorFormSet(initial=initial_data)

        error_forms = list(zip(formset, exceptions))
        return render(request, 'process.html', {
            'error_forms': error_forms,
            'formset': formset,
        })

    valid_count, error_count = reader.validate_data()

    if error_count == 0:
        reader.upload_to_db()
        response = _redirect_to_panel_after_upload(schedule_file)
        complete_pending_upload(request)
        return response

    request.session['error_count'] = error_count
    exceptions = list(ScheduleError.objects.all().order_by('id'))
    initial_data = [_error_form_initial(e) for e in exceptions]
    formset = LessonErrorFormSet(initial=initial_data)
    error_forms = list(zip(formset, exceptions))
    return render(request, 'process.html', {
        'error_forms': error_forms,
        'formset': formset,
    })

@login_required(login_url='/admin/login/')
def editSchedule(request):
    current_week = request.GET.get('week') or 'this'

    groups = Group.objects.values('code').order_by('code')
    current_group = request.GET.get('group') or groups.first().get('code')
    current_group_obj = get_object_or_404(Group, code=current_group)

    active_parametrs = {"week":current_week, 'group': current_group}

    lessons = Lesson.objects.prefetch_related('teachers').filter(schedule__week=current_week, group=current_group_obj)
    return render(request, 'edit.html', {'lessons': lessons, 'groups': groups, 'current_group': current_group, 'active_parametrs': active_parametrs})

@login_required(login_url='/admin/login/')
def editLesson(request, id):
    lesson = get_object_or_404(Lesson, id=id)
    form = LessonAdminForm(request.POST or None, instance=lesson)

    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Урок успешно обновлен.')
        return redirect('editSchedule')

    if request.method == 'POST':
        messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')

    return render(request, 'lesson_add.html', {'form': form, 'edit': True})


@login_required(login_url='/admin/login/')
def addLesson(request):
    form = LessonAdminForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Новый урок успешно добавлен в расписание.')
        return redirect('panel')

    if request.method == 'POST':
        messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')

    return render(request, 'lesson_add.html', {'form': form, 'edit': False})


@login_required(login_url='/admin/login/')
def deleteLesson(request, id):
    lesson = get_object_or_404(Lesson, id=id)
    week = lesson.schedule.week
    group_code = lesson.group.code
    lesson.delete()
    messages.success(request, 'Урок удалён.')
    return redirect(f'{reverse("editSchedule")}?week={week}&group={group_code}')


@login_required(login_url='/admin/login/')
def deleteSchedule(request):
    form = ScheduleDeleteForm(request.POST or None)

    if request.method == 'POST' and form.is_valid():
        schedule = form.cleaned_data['schedule']
        label = schedule.display_label()
        schedule.delete()
        messages.success(request, f'Расписание «{label}» удалено.')
        return redirect('panel')

    if request.method == 'POST':
        messages.error(request, 'Выберите расписание для удаления.')

    schedules = Schedule.objects.all().order_by('-uploaded_at')
    return render(request, 'schedule_delete.html', {
        'form': form,
        'schedules': schedules,
    })

# teachers
@login_required(login_url='/admin/login/')
def teachersView(request):
    teachers = Teacher.objects.all() 
    return render(request, 'teachers/teachers.html', {'teachers': teachers})

@login_required(login_url='/admin/login/')
def teachersAddView(request):
    form = TeacherForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('teachers')
    if request.method == 'POST':
        messages.error(request, 'Проверьте заполнение формы.')
    return render(request, 'teachers/teachers_add.html', {'form': form, 'edit': False})


@login_required(login_url='/admin/login/')
def teachersEditView(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    form = TeacherForm(request.POST or None, instance=teacher)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('teachers')
    if request.method == 'POST':
        messages.error(request, 'Проверьте заполнение формы.')
    return render(request, 'teachers/teachers_add.html', {'form': form, 'edit': True})

@login_required(login_url='/admin/login/')
def teachersDeleteView(request, id):
    teacher = get_object_or_404(Teacher, id=id)
    teacher.delete()
    return redirect('teachers')

# groups
@login_required(login_url='/admin/login/')
def groupsView(request):
    groups = Group.objects.all()
    return render(request, 'groups/groups.html', {'groups': groups})

@login_required(login_url='/admin/login/')
def groupsAddView(request):
    form = GroupForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('groups')
    if request.method == 'POST':
        messages.error(request, 'Проверьте заполнение формы.')
    return render(request, 'groups/groups_add.html', {'form': form, 'edit': False})


@login_required(login_url='/admin/login/')
def groupsEditView(request, id):
    group = get_object_or_404(Group, id=id)
    form = GroupForm(request.POST or None, instance=group)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('groups')
    if request.method == 'POST':
        messages.error(request, 'Проверьте заполнение формы.')
    return render(request, 'groups/groups_add.html', {'form': form, 'edit': True})

@login_required(login_url='/admin/login/')
def groupsDeleteView(request, id):
    group = get_object_or_404(Group, id=id)
    group.delete()
    return redirect('groups')

