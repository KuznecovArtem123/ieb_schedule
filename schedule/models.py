from django.db import models
import json

class ScheduleError(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    raw_data = models.JSONField()  # Сохраняем весь словарь lesson_dict сюда
    description = models.TextField(null=True)

class Date(models.Model):
    DAYS_OF_WEEK = [
        (1, 'Понедельник'),
        (2, 'Вторник'),
        (3, 'Среда'),
        (4, 'Четверг'),
        (5, 'Пятница'),
        (6, 'Суббота'),
        (7, 'Воскесенье'),
    ]
    KEYS_FROM_DAYS = {
        'Понедельник': 1,
        'Вторник': 2,
        'Среда': 3,
        'Четверг': 4,
        'Пятница': 5,
        'Суббота': 6,
        'Воскесенье': 7,
    }
    date = models.DateField(unique=True)
    weekday = models.PositiveSmallIntegerField(choices=DAYS_OF_WEEK)

    def __str__(self):
        return f"{self.date}"
    
    def formatted_weekday(self):
        return self.DAYS_OF_WEEK[self.weekday - 1][1]

class Group(models.Model):
    class Department(models.TextChoices):
        SPO = 'SPO', 'Среднее профессиональное образование (СПО)'
        VO = 'VO', 'Высшее образование (ВО)'
    department = models.CharField(
        max_length=3,
        choices=Department.choices,
        default=Department.SPO
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
    
    # Дополнительное поле для связи с парсером
    search_name = models.CharField(
        max_length=100, 
        unique=True, 
        help_text="Как преподаватель записан в Excel (например: Артюхин А.С.)"
    )

    def __str__(self):
        return f"{self.last_name} {self.first_name[0]}. {self.patronymic[0] if self.patronymic else ''}."

    class Meta:
        verbose_name = "Преподаватель"
        verbose_name_plural = "Преподаватели"

class Lesson(models.Model):
    date = models.ForeignKey(Date, on_delete=models.CASCADE, related_name='lessons')
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

    def __str__(self):
        return f"{self.subject} - {self.group.code}"
