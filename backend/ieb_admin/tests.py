
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

	def test_academic_data_parser_finds_teachers_in_both_subgroups(self):
		import os
		import tempfile
		wb = Workbook()
		sheet = wb.active
		sheet.title = "C7124Б"
		sheet['C7'] = "C7124Б (Информационные системы и программирование)"
		sheet['C9'] = "МДК.01.01. Разработка программных модулей (Практ.зан.) \n2 подгруппа\nпреп. Пискаев Д. Е."
		sheet['C10'] = "МДК.02.02 Инструментальные средства разработки программного обеспечения (Практ.зан.) 1 подгруппа\nпреп. Рагалевич М. В."
		with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
			wb.save(tmp.name)
			tmp_path = tmp.name

		try:
			parser = AcademicDataParser()
			groups, teachers = parser.parse(tmp_path)
			self.assertIn('C7124Б', groups)
			self.assertIn('Пискаев Д.Е.', teachers)
			self.assertIn('Рагалевич М.В.', teachers)
		finally:
			if os.path.exists(tmp_path):
				os.remove(tmp_path)


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
	def test_two_subgroups_new_format_detected_and_parsed(self):
		reader = ScheduleReader.__new__(ScheduleReader)
		wb = Workbook()
		sheet = wb.active

		sheet['B9'] = '09:00'
		sheet['C9'] = 'МДК.01.01. Разработка программных модулей (Практ.зан.) \n2 подгруппа\nпреп. Пискаев Д. Е.'
		sheet['D9'] = '204'

		sheet['B10'] = '10:20'
		sheet['C10'] = 'МДК.02.02 Инструментальные средства разработки программного обеспечения (Практ.зан.) 1 подгруппа\nпреп. Рагалевич М. В.'
		sheet['D10'] = '302'

		main_row = [sheet['B9'], sheet['C9'], sheet['D9']]
		info_row = [sheet['B10'], sheet['C10'], sheet['D10']]

		is_subgroups, data = reader._check_two_subgroups(main_row, info_row, sheet)
		self.assertTrue(is_subgroups)
		self.assertEqual(len(data), 2)

		sg1, sg2 = data
		self.assertEqual(sg1['subject'], 'МДК.01.01. Разработка программных модулей (Практ.зан.) 2 подгруппа')
		self.assertEqual(sg1['teachers'], ['Пискаев Д.Е.'])
		self.assertEqual(sg1['auditorium'], '204')
		self.assertEqual(sg1['subgroup_num'], 2)

		self.assertEqual(sg2['subject'], 'МДК.02.02 Инструментальные средства разработки программного обеспечения (Практ.зан.) 1 подгруппа')
		self.assertEqual(sg2['teachers'], ['Рагалевич М.В.'])
		self.assertEqual(sg2['auditorium'], '302')
		self.assertEqual(sg2['subgroup_num'], 1)

	def test_two_subgroups_old_format_detected_and_parsed(self):
		reader = ScheduleReader.__new__(ScheduleReader)
		wb = Workbook()
		sheet = wb.active

		sheet['B54'] = '09:00'
		sheet['C54'] = 'Основы алгоритмизации и программирования (Практ.зан.) 2 подгруппа'
		sheet['D54'] = '105\n204'

		sheet['B55'] = '10:20'
		sheet['C55'] = 'преп. Шиянов В.А. Основы проектирования баз данных (Практ.зан.) 1 подгруппа преп.Пискаев Д.Е.'
		sheet.merge_cells('D54:D55')

		main_row = [sheet['B54'], sheet['C54'], sheet['D54']]
		info_row = [sheet['B55'], sheet['C55'], sheet['D55']]

		is_subgroups, data = reader._check_two_subgroups(main_row, info_row, sheet)
		self.assertTrue(is_subgroups)
		self.assertEqual(len(data), 2)

		sg1, sg2 = data
		self.assertEqual(sg1['subject'], 'Основы алгоритмизации и программирования (Практ.зан.) 2 подгруппа')
		self.assertEqual(sg1['teachers'], ['Шиянов В.А.'])
		self.assertEqual(sg1['auditorium'], '105')

		self.assertEqual(sg2['subject'], 'Основы проектирования баз данных (Практ.зан.) 1 подгруппа')
		self.assertEqual(sg2['teachers'], ['Пискаев Д.Е.'])
		self.assertEqual(sg2['auditorium'], '204')

	def test_single_subgroup_is_not_detected_as_two_subgroups(self):
		reader = ScheduleReader.__new__(ScheduleReader)
		wb = Workbook()
		sheet = wb.active

		sheet['B9'] = '09:00'
		sheet['C9'] = 'Операционные системы и среды (Практ.зан.) 1 подгруппа'
		sheet['D9'] = '205'

		sheet['B10'] = '10:20'
		sheet['C10'] = 'преп Ланцов И. А.'
		sheet.merge_cells('D9:D10')

		main_row = [sheet['B9'], sheet['C9'], sheet['D9']]
		info_row = [sheet['B10'], sheet['C10'], sheet['D10']]

		is_subgroups, data = reader._check_two_subgroups(main_row, info_row, sheet)
		self.assertFalse(is_subgroups)
		self.assertIsNone(data)

	def test_subgroups_require_admin_confirmation_in_validation(self):
		reader = ScheduleReader.__new__(ScheduleReader)
		reader.ErrorModel = Mock()
		reader.Teacher = Mock()
		reader.Group = Mock()
		reader.Group.objects.filter.return_value.first.return_value = object()
		reader.Teacher.objects.filter.return_value.first.return_value = object()
		reader.lessons = [
			{
				'group': 'C7124',
				'date_str': '25 сентября',
				'teachers': ['Пискаев Д.Е.'],
				'raw_teachers': 'Пискаев Д. Е.',
				'auditorium': '204',
				'subject': 'МДК.01.01. Разработка программных модулей (Практ.зан.) 2 подгруппа',
				'start_time': datetime.time(9, 0),
				'end_time': datetime.time(10, 20),
				'is_subgroup': True,
				'subgroup_num': 2,
			},
			{
				'group': 'C7124',
				'date_str': '25 сентября',
				'teachers': ['Рагалевич М.В.'],
				'raw_teachers': 'Рагалевич М. В.',
				'auditorium': '302',
				'subject': 'МДК.02.02 Инструментальные средства разработки (Практ.зан.) 1 подгруппа',
				'start_time': datetime.time(9, 0),
				'end_time': datetime.time(10, 20),
				'is_subgroup': True,
				'subgroup_num': 1,
			}
		]
		reader.announces = []
		reader.valid_lessons = []
		reader.valid_announces = []
		reader.exceptions = []
		reader.parse_lessons = Mock()
		reader.require_subgroup_confirmation = True

		_, error_count = reader.validate_data()

		self.assertEqual(error_count, 2)
		self.assertIn('требуется подтверждение администратора', reader.exceptions[0]['reasons'][0])
		self.assertIn('подгруппа 2', reader.exceptions[0]['reasons'][0])
		self.assertIn('подгруппа 1', reader.exceptions[1]['reasons'][0])
		self.assertEqual(reader.ErrorModel.objects.create.call_count, 2)

