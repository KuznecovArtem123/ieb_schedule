from django.db import models

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
        return f"{self.last_name} {self.first_name[0]}. {self.patronymic[0] if self.patronymic else ''}."

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
    subject = models.CharField(max_length=255)
    auditorium = models.CharField(max_length=100, blank=True, null=True)
    teachers = models.ManyToManyField(Teacher, related_name='lessons', blank=True)

    class Meta:
        ordering = ['date', 'order']

    def formatted_weekday(self):
        return WEEKDAY_NAMES_RU[self.date.weekday()]

    def __str__(self):
        return f"{self.subject} - {self.group.code}"
