import re

import openpyxl
from openpyxl.cell import MergedCell


class AcademicDataParser:
    """Extract groups and teacher names from the workbook schedule layout."""

    pairs_ranges_coords = {
        'Понедельник': ['B9:B22;C9:D22', 'B9:B22;E9:F22'],
        'Вторник': ['B9:B22;C24:D37', 'B9:B22;E24:F37'],
        'Среда': ['B9:B22;C39:D52', 'B9:B22;E39:F52'],
        'Четверг': ['B9:B22;C54:D67', 'B9:B22;E54:F67'],
        'Пятница': ['B9:B22;C69:D82', 'B9:B22;E69:F82'],
        'Суббота': ['B84:B93;C84:D93', 'B84:B93;E84:F93'],
    }
    onegroup_ranges_coords = {
        'Понедельник': ['B9:C22;F9:F22'],
        'Вторник': ['B24:C37;F24:F37'],
        'Среда': ['B39:C52;F39:F52'],
        'Четверг': ['B54:C67;F54:F67'],
        'Пятница': ['B69:C82;F69:F82'],
        'Суббота': ['B84:C93;F84:F93'],
    }
    teacher_pattern = re.compile(r'([А-ЯЁ][а-яё-]+\s+[А-ЯЁ]\.?\s*[А-ЯЁ]\.?)')

    def _cell_value(self, cell, sheet):
        if isinstance(cell, MergedCell):
            for merged_range in sheet.merged_cells.ranges:
                if cell.coordinate in merged_range:
                    return sheet.cell(merged_range.min_row, merged_range.min_col).value
        return cell.value

    def _combined_range(self, sheet, coords):
        first_coords, second_coords = coords.split(';')
        first_range = list(sheet[first_coords])
        second_range = list(sheet[second_coords])
        return [list(first) + list(second) for first, second in zip(first_range, second_range)]

    def _sheet_groups(self, sheet):
        groups = {}
        codes = [item.strip().replace('-', '/') for item in sheet.title.split(',') if item.strip()]
        for coordinates in ('C7', 'E7'):
            cell = sheet[coordinates]
            if isinstance(cell, MergedCell):
                continue
            title = str(cell.value or '')
            for code in codes:
                if code in title:
                    profession = title.replace(code, '').replace('(', '').replace(')', '').strip()
                    groups[code] = profession or 'Не указана'
        return groups

    def _teacher_names(self, value):
        if not isinstance(value, str):
            return set()
        names = set()
        for match in self.teacher_pattern.findall(value.replace('\n', ' ')):
            normalized = re.sub(r'\s+', ' ', match).strip()
            if normalized.lower() not in {'подгруппа', 'преподаватель', 'фио'}:
                names.add(normalized)
        return names

    def parse(self, file_path):
        groups = {}
        teachers = set()
        workbook = openpyxl.load_workbook(file_path, data_only=True)
        try:
            for sheet in workbook.worksheets:
                sheet_groups = self._sheet_groups(sheet)
                groups.update(sheet_groups)
                group_codes = list(sheet_groups)
                ranges = self.pairs_ranges_coords if len(group_codes) == 2 else self.onegroup_ranges_coords
                for range_coords_list in ranges.values():
                    for index, group_code in enumerate(group_codes):
                        if index >= len(range_coords_list):
                            continue
                        combined_range = self._combined_range(sheet, range_coords_list[index])
                        for row_index in range(1, len(combined_range), 2):
                            teacher_cell = combined_range[row_index][1]
                            teachers.update(self._teacher_names(self._cell_value(teacher_cell, sheet)))
        finally:
            workbook.close()
        return groups, sorted(teachers, key=str.casefold)