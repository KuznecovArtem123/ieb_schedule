
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from ieb_admin.models import Schedule


class ScheduleVersionViewTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.schedule = Schedule.objects.create(
			edu=Schedule.Edu.SPO,
			week=Schedule.Week.THIS,
			file=SimpleUploadedFile('schedule.xlsx', b'schedule'),
		)

	def test_returns_schedule_id_and_version(self):
		response = self.client.get('/api/schedule/version/?edu=spo&week=this')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['id'], self.schedule.id)
		self.assertEqual(response.data['version'], self.schedule.updated_at.isoformat().replace('+00:00', 'Z'))

	def test_returns_not_found_for_missing_schedule(self):
		response = self.client.get('/api/schedule/version/?edu=vo&week=next')

		self.assertEqual(response.status_code, 404)
