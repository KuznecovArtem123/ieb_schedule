import { useNavigate } from 'react-router-dom';
import LessonCard from '../entities/lesson/ui/LessonCard';

function Lessons({lessons, weekValue}) {
    const navigate = useNavigate();
    const handleWeekChange = (newWeek) => {
        navigate(
            { search: `?week=${newWeek}` },
            { replace: true }
        );
    };

    let content;

    if (lessons && lessons.length > 0) {
        const weeklist = [...new Set(lessons.map(lesson => lesson.weekday))];
        
        content = weeklist.map(day => {
            const dayLessons = lessons.filter(l => l.weekday === day);
            const [_, dateMonth, dateDay] = dayLessons[0].date.split('-');

            return (
                <div key={day} className="weekday-block">
                    <div className="weekday-title">{day}</div>
                    <div className="weekday-title">{dateDay}.{dateMonth}</div>
                    <div className="pairs-list">
                        {dayLessons.map(elem => (
                            <LessonCard
                                key={elem.id || elem.order}
                                num={elem.order}
                                teachers={elem.teachers}
                                classroom={elem.auditorium}
                                subject={elem.subject}
                                startTime={elem.start_time}
                                endTime={elem.end_time}
                                studentsGroup={elem.group_code}
                            />
                        ))}
                    </div>
                </div>
            );
        });
    } else {
        content = <h2>Пар нет</h2>;
    }

    return (
        <div>
            <div className="week-switch-buttons">
                <button onClick={() => handleWeekChange('this')} className={`week_button${weekValue === 'next' ? ' current-button' : ''}`}>эта неделя</button>
                <button onClick={() => handleWeekChange('next')} className={`week_button${weekValue === 'this' ? ' current-button' : ''}`}>следующая неделя</button>
            </div>
            {content}
        </div>
    );
}

export default Lessons;