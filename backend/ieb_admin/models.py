from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
import os

class Schedule(models.Model):
    class Week(models.TextChoices):
        THIS = 'this', 'Эта'
        NEXT = 'next', 'Следующая'
    
    class Edu(models.TextChoices):
        VO = 'vo', 'ВО'
        SPO = 'spo', 'СПО'

    week = models.CharField(choices=Week, default=Week.THIS, max_length=4)
    edu = models.CharField(choices=Edu,default=Edu.SPO, max_length=3)
    file = models.FileField(upload_to='schedules')
    uploaded_at = models.DateField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['edu', 'week'], name='unique_schedule_edu_week'),
        ]

    def __str__(self):
        return self.display_label()

    def display_label(self):
        return f'{self.get_edu_display()} — {self.get_week_display()} ({self.uploaded_at:%d.%m.%Y})'

@receiver(post_delete, sender=Schedule)
def delete_file_on_schedule_delete(sender, instance, **kwargs):
    """
    Удаляет файл из файловой системы после удаления записи из БД.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)