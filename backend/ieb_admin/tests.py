
from django.test import SimpleTestCase

from .utils.academic_data import AcademicDataParser


class AcademicDataParserTests(SimpleTestCase):
	def test_teacher_initials_are_normalized(self):
		parser = AcademicDataParser()

		teachers = parser._teacher_names('Васильев Б.А. Васильев Б. А.')

		self.assertEqual(teachers, {'Васильев Б.А.'})

	def test_teacher_fields_include_patronymic_initial(self):
		fields = AcademicDataParser.teacher_fields('Васильев Б.А.')

		self.assertEqual(fields['first_name'], 'Б')
		self.assertEqual(fields['patronymic'], 'А')
