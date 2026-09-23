from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from ieb_admin.models import Schedule


class ScheduleETagTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		Schedule.objects.create(
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

