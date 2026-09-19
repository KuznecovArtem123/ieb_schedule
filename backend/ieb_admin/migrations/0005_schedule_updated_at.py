from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):
    dependencies = [
        ('ieb_admin', '0004_schedule_unique_schedule_edu_week'),
    ]

    operations = [
        migrations.AddField(
            model_name='schedule',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, default=timezone.now),
            preserve_default=False,
        ),
    ]