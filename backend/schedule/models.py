from django.db import models
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

from ieb_admin.models import Schedule

WEEKDAY_NAMES_RU = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
]


class ScheduleError(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    raw_data = models.JSONField()
    description = models.TextField(null=True)


class Group(models.Model):
    class Department(models.TextChoices):
        SPO = 'SPO', 'Среднее профессиональное образование (СПО)'
        VO = 'VO', 'Высшее образование (ВО)'

    department = models.CharField(
        max_length=3,
        choices=Department.choices,
        default=Department.SPO,
    )
    profession = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    course = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return self.code


class Teacher(models.Model):
    last_name = models.CharField(max_length=50, verbose_name="Фамилия")
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    patronymic = models.CharField(max_length=50, verbose_name="Отчество", blank=True, null=True)
    search_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Как преподаватель записан в Excel (например: Артюхин А.С.)",
    )

    def __str__(self):
        return self.search_name

    class Meta:
        verbose_name = "Преподаватель"
        verbose_name_plural = "Преподаватели"


class Lesson(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    order = models.PositiveIntegerField()
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='lessons')
    schedule = models.ForeignKey("ieb_admin.Schedule", on_delete=models.CASCADE, related_name='lessons')
    subject = models.TextField()
    auditorium = models.CharField(max_length=100, blank=True, null=True)
    teachers = models.ManyToManyField(Teacher, related_name='lessons', blank=True)

    class Meta:
        ordering = ['date', 'order']

    def formatted_weekday(self):
        return WEEKDAY_NAMES_RU[self.date.weekday()]

    def __str__(self):
        return f"{self.subject} - {self.group.code}"


def touch_schedule_version(schedule_id):
    if schedule_id:
        Schedule.objects.filter(pk=schedule_id).update(updated_at=timezone.now())


@receiver(post_save, sender=Lesson)
@receiver(post_delete, sender=Lesson)
def update_schedule_version_on_lesson_change(sender, instance, **kwargs):
    touch_schedule_version(instance.schedule_id)


@receiver(m2m_changed, sender=Lesson.teachers.through)
def update_schedule_version_on_teacher_change(sender, instance, action, **kwargs):
    if action in {'post_add', 'post_remove', 'post_clear'}:
        touch_schedule_version(instance.schedule_id)
