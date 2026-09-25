from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from ieb_admin.models import Schedule
from .models import Group, Lesson


class ScheduleETagTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.schedule = Schedule.objects.create(
			edu=Schedule.Edu.SPO,
			week=Schedule.Week.THIS,
			file=SimpleUploadedFile('schedule.xlsx', b'schedule'),
		)

	def test_returns_not_modified_for_matching_etag(self):
		response = self.client.get('/api/lessons/?edu=spo&week=this')

		self.assertEqual(response.status_code, 200)
		self.assertTrue(response['ETag'])

		cached_response = self.client.get(
			'/api/lessons/?edu=spo&week=this',
			HTTP_IF_NONE_MATCH=response['ETag'],
		)

		self.assertEqual(cached_response.status_code, 304)
		self.assertEqual(cached_response['ETag'], response['ETag'])

	def test_lesson_subject_accepts_long_announcement_text(self):
		group = Group.objects.create(code='TEST1', profession='Test')
		subject = 'Объявление ' * 30
		lesson = Lesson.objects.create(
			schedule=self.schedule,
			date='2026-09-25',
			start_time='09:00',
			end_time='10:00',
			order=1,
			group=group,
			subject=subject,
		)

		lesson.refresh_from_db()
		self.assertEqual(lesson.subject, subject)

