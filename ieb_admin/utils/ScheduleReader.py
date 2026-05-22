
import re
import datetime
import openpyxl
from django.utils import timezone
from openpyxl.cell import MergedCell
import json

class ScheduleReader:
    def __init__(self, file_obj, TeacherModel, LessonModel, GroupModel, ErrorModel):
        self.Teacher = TeacherModel
        self.Group = GroupModel
        self.Lesson = LessonModel
        self.ErrorModel = ErrorModel
        self.file_obj = file_obj
        self.filePath = self.file_obj.file.path
        self.workBook = openpyxl.load_workbook(self.filePath, data_only=True)
        
        self.lessons = []
        self.announces = []
        self.valid_announces = []
        self.valid_lessons = []
        self.exceptions = []
        self.expected_department = self._resolve_expected_department()

        self.weekdays_coords = ['C8:E8', 'C23:E23', 'C38:E38', 'C53:E53', 'C68:E68', 'C83:E83']
        self.pairs_ranges_coords = {
            'Понедельник': ['B9:B22;C9:D22', 'B9:B22;E9:F22'],
            'Вторник': ['B9:B22;C24:D37', 'B9:B22;E24:F37'],
            'Среда': ['B9:B22;C39:D52', 'B9:B22;E39:F52'],
            'Четверг': ['B9:B22;C54:D67', 'B9:B22;E54:F67'],
            'Пятница': ['B9:B22;C69:D82', 'B9:B22;E69:F82'],
            'Суббота': ['B84:B93;C84:D93', 'B84:B93;E84:F93']
        }
        self.onegroup_ranges_coords = {
            'Понедельник': ['B9:C22;F9:F22'],
            'Вторник': ['B24:C37;F24:F37'],
            'Среда': ['B39:C52;F39:F52'],
            'Четверг': ['B54:C67;F54:F67'],
            'Пятница': ['B69:C82;F69:F82'],
            'Суббота': ['B84:C93;F84:F93']
        }
        
        self.cached_dates = self.parse_dates()

    def _get_cell_value(self, cell, sheet):
        """Возвращает значение ячейки, учитывая объединения"""
        if isinstance(cell, MergedCell):
            for range_ in sheet.merged_cells.ranges:
                if cell.coordinate in range_:
                    return sheet.cell(range_.min_row, range_.min_col).value
        return cell.value

    def parse_groups_codes(self, sheet_name):
        return [group.strip() for group in sheet_name.split(',')]
    
    def parse_groups(self, sheet):
        result = {}
        for coordinates in ['C7', 'E7']:
            codes = self.parse_groups_codes(sheet.title)
            for code in codes:
                code = code.replace('-', '/')
                if not isinstance(sheet[coordinates], MergedCell):
                    group_title = sheet[coordinates].value
                    if group_title and code in group_title:
                        profession = group_title.replace(code, '').replace('(', '').replace(')', '').strip()
                        result[code] = profession
        return result
    
    def parse_dates(self):
        sheet = self.workBook.worksheets[0]
        weekdays = {}
        for coords in self.weekdays_coords:
            values = sheet[coords]
            if values[0][0].value:
                weekdays[values[0][0].value] = values[0][2].value
        return weekdays

    def get_combined_range(self, sheet, coords: str):
        coords_list = coords.split(';')
        first_range = list(sheet[coords_list[0]])
        second_range = list(sheet[coords_list[1]])
        combined = []
        for index, row in enumerate(first_range):
            combined.append(list(row) + list(second_range[index]))
        return combined
    
    def get_pairs_rows(self, pairs_range):
        pairs = []
        for i in range(0, len(pairs_range), 2):
            pairs.append([pairs_range[i], pairs_range[i+1]])
        return pairs

    def process_teacher_lastname(self, teacher_str: str):
        if not teacher_str: return []
        return re.findall(r'[А-Я][а-я]+', teacher_str)

    def get_subjects_and_teachers(self, firstCell, secondCell):
        STOP_WORDS = [
            # Степени (с учетом вариаций пробелов)
            r'к\.?\s?[эпю]\.?\s?н\.?', r'д\.?\s?[эпю]\.?\s?н\.?',
            # Звания и должности
            r'доцент', r'профессор', r'руководитель', r'ассистент',
            r'ст\.?\s?преподаватель', r'преподаватель', r'преп\.?',
            r'зам\.?\s?директора', r'директор',
            r'\bкуратор\b'
        ]
        combined_text = f"{firstCell} {secondCell}" if secondCell else str(firstCell)
    
        teacher_pattern = re.compile(r'[А-Я][а-яё]+\s+[А-Я]\.\s*[А-Я]\.')
        teachers_found = teacher_pattern.findall(combined_text)
        
        subject_clean = combined_text
        
        for t in teachers_found:
            subject_clean = subject_clean.replace(t, "")
        
        for word in STOP_WORDS:
            subject_clean = re.sub(word, "", subject_clean, flags=re.IGNORECASE)
        
        subject_clean = re.sub(r'\s+', ' ', subject_clean) # Схлопываем пробелы
        subject_clean = subject_clean.strip(",. ") 
        
        subject_clean = subject_clean.replace("()", "").strip()

        teachers_list = []
        for t in teachers_found:
            parts = re.split(r'\s+', t.strip())
            last_name = parts[0]
            initials = "".join(parts[1:]).replace(" ", "")
            teachers_list.append(f"{last_name} {initials}")

        return subject_clean, teachers_list

    def create_lesson_dict(self, sheet, group_codes, weekday, range_coords_list):
        for i, group_code in enumerate(group_codes):
                    if i >= len(range_coords_list): continue
                    
                    combined_range = self.get_combined_range(sheet, range_coords_list[i])
                    pairs = self.get_pairs_rows(combined_range)
                    
                    for index, lesson_pair in enumerate(pairs):
                        main_row = lesson_pair[0] # [start_time, subject/content, auditorium]
                        info_row = lesson_pair[1] # [end_time, teacher, _]
                        
                        cell_content = self._get_cell_value(main_row[1], sheet)
                        
                        if cell_content:
                            is_subgroups = False
                            # try:
                            #     is_subgroups = ('подгруппа' in info_row[1].value) or (len(info_row[1].value) > 50)
                            # except:
                            #     is_subgroups = False
                            if is_subgroups:
                                subgroups_subjects, subgroups_teachers = self.get_subjects_and_teachers(main_row[1].value, info_row[1].value)

                            # Общие данные для обоих типов
                            base_data = {
                                'order': index + 1,
                                'weekday': weekday,
                                'date_str': self.cached_dates.get(weekday),
                                'group': group_code,
                                'start_time': main_row[0].value,
                                'end_time': info_row[0].value,
                            }
                            repeated_announces = [item for item in self.announces if item['weekday'] == base_data['weekday'] and item['group'] == base_data['group']]
                            if isinstance(main_row[1], MergedCell) or (not main_row[2].value and not info_row[1].value):
                                # Для объявлений: только текст
                                if len(repeated_announces) == 0:
                                    
                                    base_data['content'] = cell_content
                                    self.announces.append(base_data)
                                continue
                            
                            # Для обычных уроков: добавляем предмет, учителей и кабинет
                            base_data.update({
                                'raw_teachers': info_row[1].value, 
                                'subject': subgroups_subjects if is_subgroups else cell_content,
                                'teachers': subgroups_teachers if is_subgroups else self.process_teacher_lastname(str(info_row[1].value or "")),
                                'auditorium': main_row[2].value
                            })
                            self.lessons.append(base_data)

    def parse_lessons(self):
        """Парсинг уроков и объявлений"""
        self.lessons = []
        self.announces = []
        for sheet in self.workBook.worksheets:
            groups_dict = self.parse_groups(sheet)
            group_codes = list(groups_dict.keys())
            if len(group_codes) == 2:
                for weekday, range_coords_list in self.pairs_ranges_coords.items():
                    self.create_lesson_dict(sheet, group_codes, weekday, range_coords_list)
            else:
                for weekday, range_coords_list in self.onegroup_ranges_coords.items():
                    self.create_lesson_dict(sheet, group_codes, weekday, range_coords_list)
                    
        return self.lessons

    def parse_date_string(self, date_str):
        if not date_str: return None
        months = {
            'января': 1, 'февраля': 2, 'марта': 3, 'апреля': 4, 'мая': 5, 'июня': 6,
            'июля': 7, 'августа': 8, 'сентября': 9, 'октября': 10, 'ноября': 11, 'декабря': 12
        }
        try:
            day_str, month_str = str(date_str).strip().split()
            return datetime.date(timezone.now().year, months[month_str.lower()], int(day_str))
        except:
            return None

    def _parse_time(self, time_val):
        if isinstance(time_val, datetime.time): return time_val
        if isinstance(time_val, str):
            match = re.search(r'(\d{2}[:\.]\d{2})', time_val)
            if match:
                return datetime.datetime.strptime(match.group(1).replace('.', ':'), '%H:%M').time()
        return datetime.time(9, 0)

    # ... (начало класса и методы парсинга остаются без изменений) ...

    def validate_data(self, log_errors=True):
        """Валидация перед загрузкой. Разделяет данные на уроки и анонсы."""
        self.valid_lessons = []
        self.valid_announces = []
        self.exceptions = []
        if log_errors:
            self.ErrorModel.objects.all().delete()

        self.parse_lessons() # Заполняет self.lessons и self.announces

        # 1. Валидация Уроков
        for item in self.lessons:
            errs = self._check_base_errors(item)
            found_teachers = []
            for t_name in item.get('teachers', []):
                t_obj = self.Teacher.objects.filter(search_name__icontains=t_name).first()
                if t_obj:
                    found_teachers.append(t_obj)
                else:
                    
                    errs.append(f"Учитель {t_name} не найден")

            if errs:
                if log_errors:
                    self._log_error(item, errs)
            else:
                item.update({'teacher_objs': found_teachers})
                self.valid_lessons.append(item)

        # 2. Валидация Анонсов (объявлений)
        for item in self.announces:
            errs = self._check_base_errors(item)
            if errs:
                if log_errors:
                    self._log_error(item, errs)
            else:
                # Анонсам не нужны учителя, только базовые проверки
                self.valid_announces.append(item)
        
        return len(self.valid_lessons) + len(self.valid_announces), len(self.exceptions)

    def _resolve_expected_department(self):
        """Сопоставление отделения расписания (edu) с department группы."""
        edu = (self.file_obj.edu or '').lower()
        if edu == 'vo':
            return self.Group.Department.VO
        return self.Group.Department.SPO

    def get_department_mismatches(self):
        """Группы из файла, не соответствующие выбранному отделению при загрузке."""
        if not self.lessons and not self.announces:
            self.parse_lessons()

        schedule_label = self.file_obj.get_edu_display()
        mismatches = []
        seen = set()

        for item in self.lessons + self.announces:
            code = item.get('group')
            if not code or code in seen:
                continue
            seen.add(code)

            group_obj = self.Group.objects.filter(code=code).first()
            if not group_obj or group_obj.department == self.expected_department:
                continue

            group_label = group_obj.get_department_display()
            mismatches.append(
                f'Группа {code} — {group_label}, загружается {schedule_label}'
            )

        return mismatches

    def _check_base_errors(self, item):
        """Вспомогательный метод для проверки общих полей (группа, дата)."""
        errs = []
        group_obj = self.Group.objects.filter(code=item['group']).first()
        if not group_obj:
            errs.append(f"Группа {item['group']} не найдена")

        p_date = self.parse_date_string(item['date_str'])
        if not p_date:
            errs.append(f"Дата {item['date_str']} не распознана")
        
        if not errs:
            item.update({'group_obj': group_obj, 'date_obj': p_date})
        return errs

    def _log_error(self, item: dict, errs):
        """Запись ошибки в базу данных."""
        copy = item.copy()
        for key in ('group_obj', 'date_obj', 'teachers', 'teacher_objs'):
            copy.pop(key, None)
        if isinstance(copy['start_time'], datetime.time):
            copy['start_time'] = copy['start_time'].strftime('%H:%M')
        if isinstance(copy['end_time'], datetime.time):
            copy['end_time'] = copy['end_time'].strftime('%H:%M')
        self.ErrorModel.objects.create(
            raw_data = copy,
            description = errs[0]
        )
        self.exceptions.append({'item': copy, 'reasons': errs})

    def fix_error(self, error, cleaned_data):
        """Добавляет исправленную пару к valid_lessons/valid_announces и удаляет запись об ошибке."""
        raw = error.raw_data or {}
        group_obj = cleaned_data['group']
        lesson_date = cleaned_data['date']
        is_announce = bool(raw.get('content')) and not raw.get('subject')

        item = {
            'order': int(cleaned_data['order']),
            'weekday': raw.get('weekday'),
            'date_str': raw.get('date_str') or str(lesson_date),
            'group': group_obj.code,
            'group_obj': group_obj,
            'date_obj': lesson_date,
            'start_time': cleaned_data['start_time'],
            'end_time': cleaned_data['end_time'],
        }

        if is_announce:
            item['content'] = cleaned_data['subject']
            self.valid_announces.append(item)
        else:
            item['subject'] = cleaned_data['subject']
            item['auditorium'] = cleaned_data.get('auditorium') or ''
            item['teacher_objs'] = list(cleaned_data.get('teachers') or [])
            self.valid_lessons.append(item)

        error.delete()


    def upload_to_db(self):
        """Загрузка в разные таблицы: Lesson и Announcement."""
        count = 0
        
        # Загружаем Уроки
        for item in self.valid_lessons:
            lesson = self.Lesson.objects.create(
                schedule=self.file_obj,
                date=item['date_obj'], group=item['group_obj'], order=item['order'],
                start_time=self._parse_time(item['start_time']),
                end_time=self._parse_time(item['end_time']),
                subject=item['subject'], auditorium=item['auditorium']
            )
            if item.get('teacher_objs'):
                lesson.teachers.set(item['teacher_objs'])
            count += 1

        # Загружаем Анонсы
        for item in self.valid_announces:
            self.Lesson.objects.create(
                schedule=self.file_obj,
                date=item['date_obj'],
                group=item['group_obj'], 
                order=item['order'],
                start_time=self._parse_time(item['start_time']),
                end_time=self._parse_time(item['end_time']),
                subject=item['content']
            )
            count += 1
            
        return count
