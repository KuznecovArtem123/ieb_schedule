import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import LessonCard from '@/entities/lesson/ui/LessonCard';
import Status from '@/shared/ui/Status';
import type { Lesson, Week } from '@/entities/lesson/model/types';
import { useIsOnline } from '@/shared/lib/network';
import { Books } from '@gravity-ui/icons';


interface LessonsProps {
    lessons: Lesson[];
    weekValue: Week;
    eduValue: 'spo' | 'vo';
    errorMessage?: ReactNode;
    isOffline?: boolean;
};

function Lessons({ lessons, weekValue, eduValue, errorMessage, isOffline = false }: LessonsProps) {
    const navigate = useNavigate();
    const isOnline = useIsOnline() && !isOffline;
    const handleWeekChange = (newWeek: Week) => {
        navigate(
            { search: `?edu=${eduValue}&week=${newWeek}` },
            { replace: true }
        );
    };

    let content: ReactNode;
    let desktopContent: ReactNode;
    const dayThemes = [
        { header: 'bg-primary', border: 'border-primary', chip: 'bg-chip-primary text-link' },
        { header: 'bg-accent', border: 'border-accent', chip: 'bg-chip-accent text-accent' },
    ];

    if (errorMessage) {
        content = errorMessage;
        desktopContent = <div className="hidden md:block">{errorMessage}</div>;
    } else if (lessons && lessons.length > 0) {
        const weeklist = [...new Set(lessons.map(lesson => lesson.weekday))];

        content = weeklist.map((day, dayIndex) => {
            const dayLessons = lessons.filter(l => l.weekday === day);
            const [, dateMonth, dateDay] = dayLessons[0].date.split('-');
            const theme = dayThemes[dayIndex % dayThemes.length];


            return (
                <section key={day} className="mb-[25px] overflow-hidden rounded-[27px] bg-surface shadow-card">
                    <div className={`flex min-h-[68px] items-center justify-between px-[19px] text-white ${theme.header}`}>
                        <div className="flex items-center gap-3.5 text-[1.15rem] font-extrabold tracking-[0.4px]"><Books width="22" height="22" />{day}</div>
                        <div className="shrink-0 text-base font-bold">{dateDay}.{dateMonth}</div>
                    </div>
                    <div className={`space-y-3 border-2 border-t-0 ${theme.border} rounded-b-[27px] flex flex-col items-between `}>
                        {dayLessons.map(elem => (
                            <LessonCard
                                key={elem.id || elem.order}
                                num={elem.order}
                                teachers={elem.teachers}
                                classroom={elem.auditorium}
                                subject={elem.subject}
                                startTime={elem.start_time.slice(0, 5)}
                                endTime={elem.end_time.slice(0, 5)}
                                studentsGroup={elem.group_code}
                                theme={theme}
                            />
                        ))}
                    </div>
                </section>
            );
        });

        desktopContent = (
            <div className="hidden space-y-6 md:block">
                {weeklist.map((day, dayIndex) => {
                    const dayLessons = lessons.filter((lesson) => lesson.weekday === day);
                    const [, month, date] = dayLessons[0].date.split('-');
                    const headerClass = dayIndex % 2 === 0 ? 'bg-primary' : 'bg-accent';

                    return (
                        <section key={day} className="rounded-[27px] bg-surface shadow-card md:mx-auto md:w-[92%]">
                            <header className={`flex min-h-[68px] items-center justify-between rounded-t-[27px] px-6 text-white ${headerClass}`}>
                                <h2 className="flex items-center gap-2 text-lg font-extrabold"><Books width="22" height="22" />{day}</h2>
                                <span className="text-base font-bold">{date}.{month}</span>
                            </header>
                            <div>
                                <table className="w-full table-fixed border-collapse text-left">
                                    <thead className="bg-surface-soft text-sm font-extrabold text-heading">
                                        <tr>
                                            <th className="w-[7%] whitespace-nowrap px-3 py-4">Пара</th>
                                            <th className="w-[14%] whitespace-nowrap px-3 py-4">Время</th>
                                            <th className="w-[32%] px-5 py-4">Предмет</th>
                                            <th className="w-[10%] px-3 py-4">Группа</th>
                                            <th className="w-[24%] px-4 py-4">Преподаватель</th>
                                            <th className="w-[12%] px-3 py-4">Кабинет</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-body">
                                        {dayLessons.map((lesson) => (
                                            <tr key={lesson.id || `${lesson.date}-${lesson.order}-${lesson.group_code}`} className="transition hover:bg-surface-soft">
                                                <td className="whitespace-nowrap px-3 py-4 font-extrabold">{lesson.order}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-meta">{lesson.start_time.slice(0, 5)} – {lesson.end_time.slice(0, 5)}</td>
                                                <td className="break-words px-5 py-4 font-extrabold">{lesson.subject}</td>
                                                <td className="break-words px-3 py-4">{lesson.group_code}</td>
                                                <td className="break-words px-4 py-4">{lesson.teachers.join(', ') || '—'}</td>
                                                <td className="break-words px-3 py-4 font-bold text-primary-text">{lesson.auditorium ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    );
                })}
            </div>
        );
    } else {
        content = <Status>Пар нет</Status>;
        desktopContent = <div className="hidden md:col-span-2 md:block">{content}</div>;
    }

    return (
        <div className="md:block">
            <div className="mx-auto my-[17px] mb-[22px] md:w-[92%]">
                {!isOnline && (
                    <div className="mb-3 rounded-xl bg-chip-accent px-4 py-2 text-center text-sm font-bold text-accent" role="status">
                        Офлайн: показываются сохранённые данные
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2" aria-label="Переключение недели">
                    <button onClick={() => handleWeekChange('this')} className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'this' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}>Эта неделя</button>
                    <button onClick={() => handleWeekChange('next')} className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'next' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}>Следующая неделя</button>
                </div>
            </div>
            <div className="md:hidden">{content}</div>
            {desktopContent}
        </div>
    );
}

export default Lessons;