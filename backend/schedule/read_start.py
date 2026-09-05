from pathlib import Path

from ieb_admin.utils.ScheduleReader import ScheduleReader
from schedule.models import Group, Lesson, ScheduleError, Teacher

reader = ScheduleReader(
    Path('media/schedules/schedule.xlsx'),
    Teacher,
    Lesson,
    Group,
    ScheduleError,
)

print(reader.parse_lessons())
