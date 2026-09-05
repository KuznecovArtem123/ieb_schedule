import { useNavigate } from 'react-router-dom';
import PairCard from './PairCard';

function Lessons(props) {
    const navigate = useNavigate();
    const handleWeekChange = (newWeek) => {
        navigate(
            { search: `?week=${newWeek}` },
            { replace: true }
        );
    };

    let content;

    const lessons = props.lessons;
    const weekValue = props.weekValue;

    if (lessons && lessons.length > 0) {
        const days = new Set();
        for (const lesson of lessons) {
            days.add(lesson.weekday);
        }
        const weeklist = [...days];
        content = weeklist.map(day => {
            const dayLessons = lessons.filter(l => l.weekday === day);
            const date = new Date(dayLessons[0].date);
            const dateNumber = String(date.getDate()).padStart(2, "0");
            const month = String((date.getMonth() + 1)).padStart(2, "0");
            const year = date.getFullYear();

            return (
                <div key={day} className="weekday-block">
                    <div className="weekday-title">{day}</div>
                    <div className="weekday-title">{dateNumber}.{month}.{year}</div>
                    <div className="pairs-list">
                        {dayLessons.map(elem => (
                            <PairCard
                                key={elem.id || elem.order}
                                num={elem.order}
                                teachers={elem.teachers}
                                classroom={elem.auditorium}
                                subject={elem.subject}
                                starttime={elem.start_time}
                                endtime={elem.end_time}
                                students_group={elem.group_code}
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
                <button onClick={() => handleWeekChange('this')} className={`week_button${weekValue == 'next' ? ' current-button' : ''}`}>эта неделя</button>
                <button onClick={() => handleWeekChange('next')} className={`week_button${weekValue == 'this' ? ' current-button' : ''}`}>следующая неделя</button>
            </div>
            {content}
        </div>
    );
}

export default Lessons;