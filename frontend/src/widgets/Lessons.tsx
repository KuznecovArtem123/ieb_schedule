import { useNavigate } from 'react-router-dom';
import LessonCard from '@/entities/lesson/ui/LessonCard';
import Status from '@/shared/ui/Status';
import type { Lesson, Week } from '@/entities/lesson/model/types';

interface LessonsProps {
    lessons: Lesson[];
    weekValue: Week;
};

function Lessons({ lessons, weekValue }: LessonsProps) {
    const navigate = useNavigate();
    const handleWeekChange = (newWeek: Week) => {
        navigate(
            { search: `?week=${newWeek}` },
            { replace: true }
        );
    };

    let content;
    const dayThemes = [
        { header: 'bg-primary', border: 'border-primary', chip: 'bg-chip-primary text-link' },
        { header: 'bg-accent', border: 'border-accent', chip: 'bg-chip-accent text-accent' },
    ];

    if (lessons && lessons.length > 0) {
        const weeklist = [...new Set(lessons.map(lesson => lesson.weekday))];

        content = weeklist.map((day, dayIndex) => {
            const dayLessons = lessons.filter(l => l.weekday === day);
            const [, dateMonth, dateDay] = dayLessons[0].date.split('-');
            const theme = dayThemes[dayIndex % dayThemes.length];


            return (
                <section key={day} className="mb-[25px] overflow-hidden rounded-[27px] bg-surface shadow-card">
                    <div className={`flex min-h-[68px] items-center justify-between px-[19px] text-white ${theme.header}`}>
                        <div className="flex items-center gap-3.5 text-[1.15rem] font-extrabold tracking-[0.4px]"><span className="text-[1.6rem]">▣</span>{day}</div>
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
    } else {
        content = <Status>Пар нет</Status>;
    }

    return (
        <div>
            <div className="my-[17px] mb-[22px] grid grid-cols-2 gap-2" aria-label="Переключение недели">
                <button onClick={() => handleWeekChange('this')} className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'this' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}><span>▣</span>Эта неделя</button>
                <button onClick={() => handleWeekChange('next')} className={`flex min-h-[58px] items-center justify-center gap-1.5 rounded-[17px] text-[0.92rem] font-bold transition ${weekValue === 'next' ? 'bg-primary text-white shadow-week' : 'bg-inactive text-white'}`}><span>▣</span>Следующая неделя</button>
            </div>
            {content}
        </div>
    );
}

export default Lessons;