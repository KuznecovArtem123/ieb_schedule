export interface Lesson {
  id: number;
  subject: string;
  date: string;
  weekday: string;
  order: number;
  start_time: string;
  end_time: string;
  group_code: string;
  auditorium: string | null;
  teachers: string[];
};

export type Week = 'this' | 'next';

export function isWeek(value: string | null): value is Week {
    return value === 'this' || value === 'next';
}
