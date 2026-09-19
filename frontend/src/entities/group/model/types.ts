export type Department = 'SPO' | 'VO';

export type EduCategory = Lowercase<Department>;

export interface Group {
    id: number;
    department: Department;
    profession: string;
    code: string;
    course: number;
}

export function isEduCategory(value: string | undefined): value is EduCategory {
    return value === 'spo' || value === 'vo';
}
