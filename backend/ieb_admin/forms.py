import datetime
import re

from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.core.exceptions import ValidationError
from django.forms import formset_factory
from django.utils import timezone

from .models import Schedule
from schedule.models import Lesson, Teacher, Group


FORM_CONTROL = {'class': 'form-control'}
FORM_CONTROL_SM = {'class': 'form-control form-control-sm'}


def _parse_date_string(date_str):
    if not date_str:
        return None
    months = {
        'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4, 'мая': 5, 'июня': 6,
        'июля': 7, 'августа': 8, 'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12,
    }
    try:
        day_str, month_str = str(date_str).strip().split()
        return datetime.date(timezone.now().year, months[month_str.lower()], int(day_str))
    except (ValueError, KeyError):
        return None


def initial_from_schedule_error(error):
    raw = error.raw_data or {}
    initial = {
        'subject': raw.get('subject') or '',
        'order': raw.get('order'),
        'start_time': raw.get('start_time'),
        'end_time': raw.get('end_time'),
        'auditorium': raw.get('auditorium') or '',
    }
    group = Group.objects.filter(code=raw.get('group')).first()
    if group:
        initial['group'] = group

    parsed_date = _parse_date_string(raw.get('date_str'))
    if parsed_date:
        initial['date'] = parsed_date

    teacher_pattern = re.compile(r'[А-Я][а-яё]+\s+[А-Я]\.\s*[А-Я]\.')
    raw_teachers = raw.get('raw_teachers') or ''
    found = []
    for match in teacher_pattern.findall(str(raw_teachers)):
        parts = re.split(r'\s+', match.strip())
        search_name = f"{parts[0]} {''.join(parts[1:]).replace(' ', '')}"
        teacher = Teacher.objects.filter(search_name__icontains=search_name[:10]).first()
        if teacher and teacher not in found:
            found.append(teacher)
    if found:
        initial['teachers'] = found

    return initial


class TeacherForm(forms.ModelForm):
    class Meta:
        model = Teacher
        fields = ['first_name', 'last_name', 'patronymic', 'search_name']
        widgets = {
            'first_name': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Иван'}),
            'last_name': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Иванов'}),
            'patronymic': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Иванович'}),
            'search_name': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Иванов И.И.'}),
        }


class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['code', 'profession', 'course', 'department']
        widgets = {
            'code': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'С2125'}),
            'profession': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Туризм и гостеприимство'}),
            'course': forms.NumberInput(attrs={**FORM_CONTROL, 'placeholder': '1', 'min': 1}),
            'department': forms.Select(attrs=FORM_CONTROL),
        }


class LessonAdminForm(forms.ModelForm):
    group = forms.ModelChoiceField(
        queryset=Group.objects.all().order_by('code'),
        widget=forms.Select(attrs=FORM_CONTROL),
        label='Группа',
    )
    schedule = forms.ModelChoiceField(
        queryset=Schedule.objects.all().order_by('-uploaded_at'),
        widget=forms.Select(attrs=FORM_CONTROL),
        label='Расписание',
    )
    teachers = forms.ModelMultipleChoiceField(
        queryset=Teacher.objects.all().order_by('last_name'),
        required=False,
        widget=forms.SelectMultiple(attrs={**FORM_CONTROL, 'style': 'height: 150px;'}),
        label='Преподаватели',
    )

    class Meta:
        model = Lesson
        fields = [
            'subject', 'date', 'order', 'start_time', 'end_time',
            'group', 'auditorium', 'teachers', 'schedule',
        ]
        widgets = {
            'subject': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Напр: Информационные технологии'}),
            'date': forms.DateInput(attrs={**FORM_CONTROL, 'type': 'date'}),
            'order': forms.NumberInput(attrs={**FORM_CONTROL, 'min': 1}),
            'start_time': forms.TimeInput(attrs={**FORM_CONTROL, 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={**FORM_CONTROL, 'type': 'time'}),
            'auditorium': forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Напр: 402'}),
        }


class LessonErrorForm(LessonAdminForm):
    error_id = forms.IntegerField(widget=forms.HiddenInput())

    class Meta(LessonAdminForm.Meta):
        fields = [
            'subject', 'date', 'order', 'start_time', 'end_time',
            'group', 'auditorium', 'teachers',
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('schedule', None)


LessonErrorFormSet = formset_factory(LessonErrorForm, extra=0)


class ScheduleDeleteForm(forms.Form):
    schedule = forms.ModelChoiceField(
        queryset=Schedule.objects.none(),
        widget=forms.RadioSelect,
        label='Расписание для удаления',
        empty_label=None,
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['schedule'].queryset = Schedule.objects.all().order_by('-uploaded_at')
        self.fields['schedule'].label_from_instance = lambda obj: obj.display_label()


class ScheduleUploadForm(forms.Form):
    edu = forms.ChoiceField(
        choices=Schedule.Edu.choices,
        widget=forms.RadioSelect,
        label='Ступень образования',
    )
    week = forms.ChoiceField(
        choices=Schedule.Week.choices,
        widget=forms.RadioSelect,
        label='Неделя',
    )
    schedule = forms.FileField(
        label='Файл .xlsx с расписанием',
        widget=forms.ClearableFileInput(attrs={'class': 'upload__file', 'accept': '.xlsx'}),
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.is_bound:
            self.fields['edu'].initial = Schedule.Edu.SPO
            self.fields['week'].initial = Schedule.Week.THIS

    def clean_schedule(self):
        file = self.cleaned_data['schedule']
        if not file.name.lower().endswith('.xlsx'):
            raise ValidationError('Файл обязательно должен иметь расширение .xlsx')
        return file


class AdminLoginForm(AuthenticationForm):
    username = forms.CharField(
        label='Имя пользователя',
        widget=forms.TextInput(attrs={**FORM_CONTROL, 'placeholder': 'Имя пользователя'}),
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={**FORM_CONTROL, 'placeholder': 'Пароль'}),
    )

    error_messages = {
        'invalid_login': 'Неверное имя или пароль',
        'inactive': 'Учётная запись отключена',
    }
