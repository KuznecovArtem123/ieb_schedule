from pathlib import Path

from schedule.models import Lesson, Teacher, Group, ScheduleError
from ieb_admin.utils.ScheduleReader import ScheduleReader

reader = ScheduleReader(
    Path('media/schedules/schedule.xlsx'),
    Teacher,
    Lesson,
    Group,
    ScheduleError,
)

print(reader.parse_lessons())
