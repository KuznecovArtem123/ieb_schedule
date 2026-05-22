import datetime

from django.db import migrations, models


def copy_date_from_fk(apps, schema_editor):
    Lesson = apps.get_model('schedule', 'Lesson')
    for lesson in Lesson.objects.all().select_related('date'):
        old_date = getattr(lesson, 'date', None)
        if old_date and hasattr(old_date, 'date'):
            lesson.lesson_date = old_date.date
        else:
            lesson.lesson_date = datetime.date.today()
        lesson.save(update_fields=['lesson_date'])


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0010_alter_date_id_alter_group_id_alter_lesson_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='lesson_date',
            field=models.DateField(null=True),
        ),
        migrations.RunPython(copy_date_from_fk, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='lesson',
            name='date',
        ),
        migrations.RenameField(
            model_name='lesson',
            old_name='lesson_date',
            new_name='date',
        ),
        migrations.AlterField(
            model_name='lesson',
            name='date',
            field=models.DateField(),
        ),
        migrations.DeleteModel(
            name='Date',
        ),
    ]
