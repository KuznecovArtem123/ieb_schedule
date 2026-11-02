import { useNavigate } from 'react-router-dom';
import LessonCard from '@/entities/lesson/ui/LessonCard';
import Status from '@/shared/ui/Status';
import { mergeLessons, type Lesson, type MergedLesson, type Week } from '@/entities/lesson/model/types';
import { Books } from '@gravity-ui/icons';
import { useRef } from 'react';
import DayNavigation from './DayNavigation';
import { LessonRow } from './LessonRow';

interface LessonsProps {
    lessons: Lesson[];
    weekValue: Week;
    isTeacherSchedule: boolean;
}

function Lessons({ lessons, weekValue, isTeacherSchedule }: LessonsProps) {
    const daysRef = useRef<(HTMLElement | null)[]>([]);
    const navigate = useNavigate();

    const handleWeekChange = (newWeek: Week) => {
        navigate(
            { search: `?week=${newWeek}` },
            { replace: true }
        );
    };

    const handleScroll = (index: number) => {
        daysRef.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const dayThemes = [
        { header: 'bg-primary', border: 'border-primary', chip: 'bg-chip-primary text-link' },
        { header: 'bg-accent', border: 'border-accent', chip: 'bg-chip-accent text-accent' },
    ];

    const mergedLessons: MergedLesson[] = mergeLessons(lessons);
    const weeklist = [...new Set(mergedLessons.map(lesson => lesson.weekday))];

    if (!mergedLessons || mergedLessons.length === 0) {
        return (
            <>
                <WeekButtons weekValue={weekValue} onWeekChange={handleWeekChange} />
                <Status>Пар нет</Status>
            </>
        );
    }

    return (
        <>
            <WeekButtons weekValue={weekValue} onWeekChange={handleWeekChange} />
            <DayNavigation onDaySelect={handleScroll} days={weeklist} />

            <div className="md:grid md:grid-cols-1 md:items-start md:gap-6">
                {weeklist.map((day, dayIndex) => {
                    const dayLessons = mergedLessons.filter((l: MergedLesson) => l.weekday === day);
                    const [, dateMonth, dateDay] = dayLessons[0].date.split('-');
                    const theme = dayThemes[dayIndex % dayThemes.length];

                    return (
                        <section
                            ref={(elem) => { daysRef.current[dayIndex] = elem; }}
                            key={day}
                            className={`mb-[25px] overflow-hidden rounded-[27px] bg-surface shadow-card md:rounded-[27px] md:border-2 md:bg-surface md:shadow-card ${theme.border}`}
                        >
                            <div className={`flex min-h-[68px] items-center justify-between px-[19px] text-white md:hidden ${theme.header}`}>
                                <div className="flex items-center gap-3.5 text-[1.15rem] font-extrabold tracking-[0.4px]">
                                    <Books width='22' height='22' />{day}
                                </div>
                                <div className="shrink-0 text-base font-bold">{dateDay}.{dateMonth}</div>
                            </div>

                            <div className={`space-y-3 border-2 border-t-0 ${theme.border} rounded-b-[27px] flex flex-col items-between md:space-y-0 md:rounded-none md:border-0`}>
                                <div className="md:hidden [&>article:last-child_.stick]:hidden">
                                    {dayLessons.map((elem: MergedLesson) => (
                                        <LessonCard
                                            key={elem.order}
                                            num={elem.order}
                                            items={elem.items}
                                            startTime={elem.start_time.slice(0, 5)}
                                            endTime={elem.end_time.slice(0, 5)}
                                            studentsGroup={isTeacherSchedule ? elem.group_code : undefined}
                                            isTeacherSchedule={isTeacherSchedule}
                                            theme={theme}
                                        />
                                    ))}
                                </div>

                                <div className="hidden overflow-hidden md:block">
                                    <table className="w-full table-fixed border-collapse text-left">
                                        <colgroup>
                                            <col style={{ width: '7%' }} />
                                            <col style={{ width: '14%' }} />
                                            <col style={{ width: '37%' }} />
                                            <col style={{ width: '30%' }} />
                                            <col style={{ width: '12%' }} />
                                        </colgroup>
                                        <thead className="text-sm uppercase tracking-[0.08em] text-white">
                                            <tr className={`${theme.header}`}>
                                                <th colSpan={5} className="px-4 py-4 text-left text-base normal-case tracking-normal">
                                                    <span className="inline-flex items-center gap-3 font-extrabold">
                                                        <Books width="20" height="20" />{day}
                                                    </span>
                                                    <span className="float-right font-bold">{dateDay}.{dateMonth}</span>
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="w-[7%] bg-surface-soft px-4 py-3 font-extrabold text-heading">Пара</th>
                                                <th className="w-[14%] bg-surface-soft px-4 py-3 font-extrabold text-heading">Время</th>
                                                <th className="w-[37%] bg-surface-soft px-4 py-3 font-extrabold text-heading">Дисциплина</th>
                                                <th className="w-[30%] bg-surface-soft px-4 py-3 font-extrabold text-heading">
                                                    {isTeacherSchedule ? 'Группа' : 'Преподаватель'}
                                                </th>
                                                <th className="w-[12%] bg-surface-soft px-4 py-3 font-extrabold text-heading">Аудитория</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dayLessons.map((elem: MergedLesson) => (
                                                <LessonRow
                                                    key={elem.order}
                                                    elem={elem}
                                                    isTeacherSchedule={isTeacherSchedule}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>
        </>
    );
}

interface WeekButtonsProps {
    weekValue: Week;
    onWeekChange: (week: Week) => void;
}
function WeekButtons({ weekValue, onWeekChange }: WeekButtonsProps) {
    return (
        <div className="my-[17px] mb-[10px] grid grid-cols-2 gap-2" aria-label="Переключение недели">
            <button
                onClick={() => onWeekChange('this')}
                className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'this' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}
            >
                Эта неделя
            </button>
            <button
                onClick={() => onWeekChange('next')}
                className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'next' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}
            >
                Следующая неделя
            </button>
        </div>
    );
}

export default Lessons;
