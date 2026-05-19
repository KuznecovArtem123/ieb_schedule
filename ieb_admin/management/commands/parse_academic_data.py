import os
import openpyxl
from django.core.management.base import BaseCommand
from django.db import transaction
from openpyxl.cell import MergedCell

# Импортируем твои реальные модели
from schedule.models import Teacher, Group
from ieb_admin.models import Schedule


class Command(BaseCommand):
    help = "Парсинг уникальных групп и учителей на основе маппинга ScheduleReader"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Координаты и маппинг из твоего ScheduleReader
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

    def _get_cell_value(self, cell, sheet):
        """Вспомогательный метод из твоего парсера для объединенных ячеек"""
        if isinstance(cell, MergedCell):
            for range_ in sheet.merged_cells.ranges:
                if cell.coordinate in range_:
                    return sheet.cell(range_.min_row, range_.min_col).value
        return cell.value

    def get_combined_range(self, sheet, coords: str):
        """Объединение диапазонов из твоего парсера"""
        coords_list = coords.split(';')
        first_range = list(sheet[coords_list[0]])
        second_range = list(sheet[coords_list[1]])
        combined = []
        for index, row in enumerate(first_range):
            combined.append(list(row) + list(second_range[index]))
        return combined

    def get_pairs_rows(self, pairs_range):
        """Разбивка строк по парам из твоего парсера"""
        pairs = []
        for i in range(0, len(pairs_range), 2):
            pairs.append([pairs_range[i], pairs_range[i+1]])
        return pairs

    def parse_groups_codes(self, sheet_name):
        return [group.strip() for group in sheet_name.split(',')]

    def extract_groups_from_sheet(self, sheet):
        """Парсинг кодов групп на основе твоей логики"""
        found_codes = set()
        for coordinates in ['C7', 'E7']:
            codes = self.parse_groups_codes(sheet.title)
            for code in codes:
                code = code.replace('-', '/')
                if not isinstance(sheet[coordinates], MergedCell):
                    group_title = sheet[coordinates].value
                    if group_title and code in group_title:
                        found_codes.add(code)
        return found_codes

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Запуск парсинга учителей и групп по структуре ScheduleReader..."))

        schedules = Schedule.objects.all()
        if not schedules.exists():
            self.stdout.write(self.style.ERROR("Файлы расписания в модели Schedule не найдены."))
            return

        all_unique_teachers = set()
        all_unique_groups = set()

        for item in schedules:
            if not item.file or not os.path.exists(item.file.path):
                self.stdout.write(self.style.ERROR(f"Файл для ID {item.id} отсутствует на диске."))
                continue

            self.stdout.write(f"Сканируем файл: {item.file.name}")
            try:
                # ВАЖНО: убираем read_only=True, иначе sheet.merged_cells.ranges может отработать некорректно
                wb = openpyxl.load_workbook(item.file.path, data_only=True)
                
                for sheet in wb.worksheets:
                    # 1. Сбор групп с текущего листа
                    sheet_groups = self.extract_groups_from_sheet(sheet)
                    all_unique_groups.update(sheet_groups)

                    # 2. Определение режима (одна или две группы на листе)
                    group_codes = list(sheet_groups)
                    if len(group_codes) == 2:
                        ranges_source = self.pairs_ranges_coords.items()
                    else:
                        ranges_source = self.onegroup_ranges_coords.items()

                    # 3. Обход ячеек расписания для поиска учителей
                    for weekday, range_coords_list in ranges_source:
                        for i, group_code in enumerate(group_codes):
                            if i >= len(range_coords_list):
                                continue
                            
                            combined_range = self.get_combined_range(sheet, range_coords_list[i])
                            pairs = self.get_pairs_rows(combined_range)
                            
                            for lesson_pair in pairs:
                                info_row = lesson_pair[1] # Строка с преподавателем
                                teacher_cell = info_row[1]
                                
                                teacher_value = self._get_cell_value(teacher_cell, sheet)
                                if teacher_value and isinstance(teacher_value, str):
                                    # Чистим строку от лишних пробелов, переносов и мусора
                                    t_name = teacher_value.strip().replace('\n', ' ')
                                    # Проверка от попадания технических слов подгрупп или пустых строк в базу
                                    if t_name and not any(word in t_name.lower() for word in ['подгруппа', 'преподаватель', 'фио']):
                                        all_unique_teachers.add(t_name)
                                        
                wb.close()
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Ошибка при обработке файла {item.file.name}: {e}"))

        self.stdout.write(f"Парсинг завершен. Найдено групп: {len(all_unique_groups)}, учителей: {len(all_unique_teachers)}")

        # Сохранение в базу данных
        groups_created = 0
        teachers_created = 0

        with transaction.atomic():
            # Запись Групп
            for g_code in all_unique_groups:
                # Для групп используем поле code (как в твоем filter(code=item['group']))
                _, created = Group.objects.get_or_create(code=g_code)
                if created:
                    groups_created += 1

            # Запись Учителей
            for t_name in all_unique_teachers:
                # Создаем учителя по имени
                _, created = Teacher.objects.get_or_create(name=t_name)
                if created:
                    teachers_created += 1

        self.stdout.write(self.style.SUCCESS(
            f"Синхронизация с базой выполнена успешно!\n"
            f"Добавлено новых групп: {groups_created}\n"
            f"Добавлено новых учителей: {teachers_created}"
        ))