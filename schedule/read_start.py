

from ieb_admin.utils.ScheduleReader import ScheduleReader

reader = ScheduleReader(Path('C:/Users/won/Desktop/All code/python/ineb-schedule/ineb-project-v2/ieb/media/schedules/schedule.xlsx'), Date, Teacher, Lesson, TeacherLesson)

some_sheet = reader.workBook.worksheets[0]

print(reader.parse_lessons())
print(reader.teachers)