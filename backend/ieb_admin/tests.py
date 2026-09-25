
import datetime
from unittest.mock import Mock

from django.test import SimpleTestCase
from openpyxl import Workbook

from .utils.academic_data import AcademicDataParser
from .utils.ScheduleReader import ScheduleReader


class AcademicDataParserTests(SimpleTestCase):
	def test_teacher_initials_are_normalized(self):
		parser = AcademicDataParser()

		teachers = parser._teacher_names('Васильев Б.А. Васильев Б. А.')

		self.assertEqual(teachers, {'Васильев Б.А.'})

	def test_teacher_fields_include_patronymic_initial(self):
		fields = AcademicDataParser.teacher_fields('Васильев Б.А.')

		self.assertEqual(fields['first_name'], 'Б')
		self.assertEqual(fields['patronymic'], 'А')


class ScheduleReaderValidationTests(SimpleTestCase):
	def test_pair_order_comes_from_column_a_merged_cell(self):
		reader = ScheduleReader.__new__(ScheduleReader)
		sheet = Workbook().active
		sheet.merge_cells('A9:A10')
		sheet['A9'] = '3 пара'

		self.assertEqual(reader._get_pair_order(sheet, 10, 1), 3)

	def _reader_with_lesson(self, lesson):
		reader = ScheduleReader.__new__(ScheduleReader)
		reader.ErrorModel = Mock()
		reader.Teacher = Mock()
		reader.Group = Mock()
		reader.Group.objects.filter.return_value.first.return_value = object()
		reader.Teacher.objects.filter.return_value.first.return_value = object()
		reader.lessons = [lesson]
		reader.announces = []
		reader.valid_lessons = []
		reader.valid_announces = []
		reader.exceptions = []
		reader.parse_lessons = Mock()
		return reader

	def test_unrecognized_nonempty_teacher_text_is_reported(self):
		reader = self._reader_with_lesson({
			'group': 'C7124',
			'date_str': '25 сентября',
			'teachers': [],
			'raw_teachers': 'Иванов А.Б',
			'start_time': datetime.time(9, 0),
			'end_time': datetime.time(10, 0),
		})
		reader.Teacher.objects.filter.return_value.first.return_value = None

		_, error_count = reader.validate_data()

		self.assertEqual(error_count, 1)
		self.assertIn('Не удалось распознать преподавателя', reader.exceptions[0]['reasons'][0])
		reader.ErrorModel.objects.create.assert_called_once()

		reader.ErrorModel.objects.create.reset_mock()
		_, error_count = reader.validate_data(log_errors=False)

		self.assertEqual(error_count, 1)
		reader.ErrorModel.objects.create.assert_not_called()

	def test_multiple_teachers_and_auditoriums_require_manual_review(self):
		reader = self._reader_with_lesson({
			'group': 'C7124',
			'date_str': '25 сентября',
			'teachers': ['Иванов А.Б.', 'Петров В.Г.'],
			'raw_teachers': 'Иванов А.Б. Петров В.Г.',
			'auditorium': '101, 102',
			'subject': 'Математика',
			'start_time': datetime.time(9, 0),
			'end_time': datetime.time(10, 0),
		})

		_, error_count = reader.validate_data()

		self.assertEqual(error_count, 1)
		self.assertIn('требуется ручная проверка', reader.exceptions[0]['reasons'][0])
		reader.ErrorModel.objects.create.assert_called_once()
