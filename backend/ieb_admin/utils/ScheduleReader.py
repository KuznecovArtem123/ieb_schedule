
import datetime
import re

import openpyxl
from django.utils import timezone
from openpyxl.cell import MergedCell


class ScheduleReader:
    def __init__(self, file_obj, TeacherModel, LessonModel, GroupModel, ErrorModel, require_subgroup_confirmation=True):
        self.Teacher = TeacherModel
        self.Group = GroupModel
        self.Lesson = LessonModel
        self.ErrorModel = ErrorModel
        self.file_obj = file_obj
        self.require_subgroup_confirmation = require_subgroup_confirmation
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

    def _get_pair_order(self, sheet, row, fallback):
        value = self._get_cell_value(sheet.cell(row=row, column=1), sheet)
        match = re.search(r'\d+', str(value or ''))
        return int(match.group()) if match else fallback

    def parse_groups_codes(self, sheet_name):
        return [group.strip() for group in sheet_name.split(',')]
    
    def parse_groups(self, sheet):
        result = {}
        codes = self.parse_groups_codes(sheet.title)
        found_codes = set()

        for coordinates in ['C7', 'E7']:
            cell = sheet[coordinates]

            if isinstance(cell, MergedCell):
                continue

            group_title = cell.value

            if not group_title:
                continue

            for code in codes:
                code = code.replace('-', '/')

                if code in group_title:
                    profession = (
                        group_title
                        .replace(code, '')
                        .replace('(', '')
                        .replace(')', '')
                        .strip()
                    )

                    result[code] = profession
                    found_codes.add(code)

        not_found = {code.replace('-', '/') for code in codes} - found_codes

        if not_found:
            raise ValueError(
                f'Не удалось найти коды групп: {", ".join(not_found)}'
            )

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
        if not teacher_str:
            return []

        teacher_pattern = re.compile(
            r'(?P<last_name>[А-ЯЁ][а-яё-]+)\s+'
            r'(?P<first_initial>[А-ЯЁ])\s*\.\s*'
            r'(?P<patronymic_initial>[А-ЯЁ])\s*\.'
        )

        return [
            f"{match.group('last_name')} "
            f"{match.group('first_initial')}.{match.group('patronymic_initial')}."
            for match in teacher_pattern.finditer(str(teacher_str))
        ]

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

    @staticmethod
    def _extract_subgroup_number(text, fallback=1):
        if not text:
            return fallback
        match = re.search(r'(\d)\s*(?:подгрупп|п/?г)', str(text), flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
        match = re.search(r'(?:подгрупп|п/?г)\s*(\d)', str(text), flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
        return fallback

    @staticmethod
    def _has_subgroup_keyword(text):
        if not text:
            return False
        return bool(re.search(r'(подгрупп|\b\d\s*п/?г\b|\bп/?г\s*\d\b)', str(text), flags=re.IGNORECASE))

    def _split_subgroup_cell(self, text):
        if not text:
            return "", [], ""
        text_str = str(text)
        teachers_norm = []
        raw_matches = []

        teacher_pattern = re.compile(
            r'(?P<last_name>[А-ЯЁ][а-яё-]+)\s+(?P<init1>[А-ЯЁ])\s*\.\s*(?P<init2>[А-ЯЁ])\s*\.?'
        )
        for m in teacher_pattern.finditer(text_str):
            teachers_norm.append(f"{m.group('last_name')} {m.group('init1')}.{m.group('init2')}.")
            raw_matches.append(m.group(0))

        full_teacher_pattern = re.compile(
            r'(?:(?:ст\.?\s*преп(?:одаватель)?\.?|преп(?:одаватель)?\.?|доцент|профессор|ассистент|руководитель|куратор:?)\s*)?'
            r'[А-ЯЁ][а-яё-]+\s+[А-ЯЁ]\s*\.\s*[А-ЯЁ]\s*\.?',
            flags=re.IGNORECASE
        )

        cleaned = text_str
        for m in full_teacher_pattern.finditer(text_str):
            cleaned = cleaned.replace(m.group(0), " ")

        prefixes = [
            r'\bст\.?\s*преп(?:одаватель)?\.?',
            r'\bпреп(?:одаватель)?\.?',
            r'\bдоцент\b',
            r'\bпрофессор\b',
            r'\bкуратор\b:?',
        ]
        for p in prefixes:
            cleaned = re.sub(p, " ", cleaned, flags=re.IGNORECASE)

        cleaned = re.sub(r'[\r\n]+', ' ', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip(" ,.-:\t")
        raw_teachers_str = ", ".join(raw_matches)
        return cleaned, teachers_norm, raw_teachers_str

    def _check_two_subgroups(self, main_row, info_row, sheet):
        """Проверяет, делится ли пара на две подгруппы (новый и старый форматы).
        Возвращает (True, [subgroup_1_dict, subgroup_2_dict]) или (False, None).
        """
        cell_1 = main_row[1]
        cell_2 = info_row[1]
        if isinstance(cell_1, MergedCell):
            return False, None

        main_val = self._get_cell_value(cell_1, sheet)
        if not main_val:
            return False, None

        info_val = self._get_cell_value(cell_2, sheet)
        main_aud = self._get_cell_value(main_row[2], sheet)
        info_aud = self._get_cell_value(info_row[2], sheet)
        is_info_aud_merged = isinstance(info_row[2], MergedCell)

        main_str = str(main_val or '').strip()
        info_str = str(info_val or '').strip()

        subj_main, teachers_main, raw_t_main = self._split_subgroup_cell(main_str)
        subj_info, teachers_info, raw_t_info = self._split_subgroup_cell(info_str)

        has_sub_main = self._has_subgroup_keyword(main_str)
        has_sub_info = self._has_subgroup_keyword(info_str)

        # Ветвь 1: Новый формат расписания (скрин 2)
        # В main_row и info_row указаны предметы и преподаватели для каждой подгруппы,
        # а ячейки аудиторий разделены и каждая содержит своё значение.
        is_new_subgroups = False
        if subj_info and (has_sub_info or has_sub_main):
            if teachers_main and teachers_info or not is_info_aud_merged and info_aud and str(info_aud).strip() and str(info_aud).strip() != str(main_aud).strip():
                is_new_subgroups = True

        if is_new_subgroups:
            aud_1 = str(main_aud or '').strip()
            aud_2 = str(info_aud or '').strip()
            if is_info_aud_merged or not aud_2 or aud_1 == aud_2:
                if '\n' in aud_1 or ',' in aud_1:
                    parts = [p.strip() for p in re.split(r'[\r\n]+|\,\s*', aud_1) if p.strip()]
                    if len(parts) >= 2:
                        aud_1, aud_2 = parts[0], parts[1]

            num_1 = self._extract_subgroup_number(subj_main, fallback=1)
            num_2 = self._extract_subgroup_number(subj_info, fallback=2)
            if num_1 == num_2:
                num_2 = 2 if num_1 == 1 else 1

            subgroup_1 = {
                'subject': subj_main,
                'teachers': teachers_main,
                'raw_teachers': raw_t_main,
                'auditorium': aud_1,
                'is_subgroup': True,
                'subgroup_num': num_1,
            }
            subgroup_2 = {
                'subject': subj_info,
                'teachers': teachers_info,
                'raw_teachers': raw_t_info,
                'auditorium': aud_2,
                'is_subgroup': True,
                'subgroup_num': num_2,
            }
            return True, [subgroup_1, subgroup_2]

        # Ветвь 2: Старый формат расписания (скрин 1)
        # В main_row предмет первой подгруппы, в info_row преподаватель 1 - предмет 2 - преподаватель 2,
        # аудитория объединена и содержит оба значения.
        if has_sub_main and (has_sub_info or len(teachers_info) >= 2):
            aud_1 = str(main_aud or '').strip()
            aud_2 = str(info_aud or '').strip()
            if is_info_aud_merged or not aud_2 or aud_1 == aud_2:
                if '\n' in aud_1 or ',' in aud_1 or ' ' in aud_1:
                    parts = [p.strip() for p in re.split(r'[\r\n]+|\,\s*|\s{2,}', aud_1) if p.strip()]
                    if len(parts) >= 2:
                        aud_1, aud_2 = parts[0], parts[1]

            t1 = [teachers_info[0]] if len(teachers_info) > 0 else []
            t2 = [teachers_info[1]] if len(teachers_info) > 1 else teachers_info
            raw_1 = t1[0] if t1 else ""
            raw_2 = t2[0] if t2 else ""

            num_1 = self._extract_subgroup_number(main_str, fallback=1)
            num_2 = self._extract_subgroup_number(subj_info, fallback=2)
            if num_1 == num_2:
                num_2 = 2 if num_1 == 1 else 1

            subgroup_1 = {
                'subject': main_str.strip(),
                'teachers': t1,
                'raw_teachers': raw_1,
                'auditorium': aud_1,
                'is_subgroup': True,
                'subgroup_num': num_1,
            }
            subgroup_2 = {
                'subject': subj_info,
                'teachers': t2,
                'raw_teachers': raw_2,
                'auditorium': aud_2,
                'is_subgroup': True,
                'subgroup_num': num_2,
            }
            return True, [subgroup_1, subgroup_2]

        return False, None

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
                            base_data = {
                                'order': self._get_pair_order(sheet, main_row[0].row, index + 1),
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

                            # Проверка на две подгруппы (отдельная условная ветвь поведения при загрузке)
                            is_subgroups, subgroups_data = self._check_two_subgroups(main_row, info_row, sheet)
                            if is_subgroups and subgroups_data:
                                for sg in subgroups_data:
                                    sg_item = base_data.copy()
                                    sg_item.update(sg)
                                    self.lessons.append(sg_item)
                                continue

                            # Для обычных уроков: добавляем предмет, учителей и кабинет
                            base_data.update({
                                'raw_teachers': info_row[1].value, 
                                'subject': cell_content,
                                'teachers': self.process_teacher_lastname(str(info_row[1].value or "")),
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
            teacher_names = item.get('teachers', [])
            raw_teachers = str(item.get('raw_teachers') or '').strip()
            if raw_teachers and not teacher_names:
                errs.append(f"Не удалось распознать преподавателя: {raw_teachers}")
            auditorium_text = str(item.get('auditorium') or '').strip()
            auditoriums = [
                value.strip()
                for value in re.split(r'[,;/\n]|\s+и\s+', auditorium_text, flags=re.IGNORECASE)
                if value.strip()
            ]
            if len(teacher_names) > 1 and len(auditoriums) > 1 and not item.get('is_subgroup'):
                errs.append('В паре указаны несколько преподавателей и аудиторий; требуется ручная проверка')

            for t_name in teacher_names:
                t_obj = self.Teacher.objects.filter(search_name__iexact=t_name).first()
                if not t_obj and ' ' in str(t_name):
                    t_obj = self.Teacher.objects.filter(search_name__icontains=str(t_name).split()[0]).first()
                if t_obj:
                    found_teachers.append(t_obj)
                else:
                    errs.append(f"Учитель {t_name} не найден")

            # Отдельная ветвь для пар с двумя подгруппами: создаем исключение для обязательного подтверждения админом
            if item.get('is_subgroup') and getattr(self, 'require_subgroup_confirmation', True):
                subgroup_num = item.get('subgroup_num')
                label = f" (подгруппа {subgroup_num})" if subgroup_num else ""
                errs.append(f"Пара разделена на две подгруппы{label}; требуется подтверждение администратора")

            if errs:
                self._log_error(item, errs, persist=log_errors)
            else:
                item.update({'teacher_objs': found_teachers})
                self.valid_lessons.append(item)

        # 2. Валидация Анонсов (объявлений)
        for item in self.announces:
            errs = self._check_base_errors(item)
            if errs:
                self._log_error(item, errs, persist=log_errors)
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

    def _log_error(self, item: dict, errs, persist=True):
        """Запись ошибки в базу данных."""
        copy = item.copy()
        if 'teachers' in copy and isinstance(copy['teachers'], list):
            copy['teacher_names'] = list(copy['teachers'])
        for key in ('group_obj', 'date_obj', 'teachers', 'teacher_objs'):
            copy.pop(key, None)
        if isinstance(copy['start_time'], datetime.time):
            copy['start_time'] = copy['start_time'].strftime('%H:%M')
        if isinstance(copy['end_time'], datetime.time):
            copy['end_time'] = copy['end_time'].strftime('%H:%M')
        if persist:
            self.ErrorModel.objects.create(
                raw_data=copy,
                description=errs[0],
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
                date=item['date_obj'], 
                group=item['group_obj'], 
                order=item['order'],
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
