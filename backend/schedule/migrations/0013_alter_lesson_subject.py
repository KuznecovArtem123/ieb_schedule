from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0012_alter_lesson_group'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lesson',
            name='subject',
            field=models.TextField(),
        ),
    ]