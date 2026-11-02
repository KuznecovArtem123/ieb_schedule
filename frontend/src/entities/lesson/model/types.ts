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

export interface MergedLesson {
  date: string;
  weekday: string;
  order: number;
  start_time: string;
  end_time: string;
  group_code: string;
  items: PairInfo[]
};

export interface PairInfo {
  auditorium: string | null;
  teachers: string[];
  subject: string;
  id: number;
}

export type Week = 'this' | 'next';

export function isWeek(value: string | null): value is Week {
  return value === 'this' || value === 'next';
}
export function mergeLessons(rawLessons: Lesson[]): MergedLesson[] {
  if (!Array.isArray(rawLessons)) return [];

  rawLessons = rawLessons.filter(x => x.subject.trim() !== '');
  // на случай, если на бэкенде будут присылаться пустые пары

  const mergedMap = rawLessons.reduce<Record<string, MergedLesson>>((acc, current) => {
    const key = `${current.date}_${current.order}`;

    const newPair: PairInfo = {
      id: current.id,
      subject: current.subject,
      auditorium: current.auditorium,
      teachers: current.teachers,
    };

    if (!acc[key]) {
      acc[key] = {
        date: current.date,
        weekday: current.weekday,
        order: current.order,
        start_time: current.start_time,
        end_time: current.end_time,
        group_code: current.group_code,
        items: [newPair],
      };
      return acc;
    }

    acc[key].items.push(newPair);

    return acc;
  }, {});

  return Object.values(mergedMap);
}