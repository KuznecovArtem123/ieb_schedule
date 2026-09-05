import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { groupService } from '../services/groupService';
import PairCard from '../components/PairCard';

function Lessons() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [lessons, setLessons] = useState(null);
    const [loading, setLoading] = useState(true);
    const weekValue = searchParams.get('week') || 'this';

    const handleWeekChange = (newWeek) => {
        navigate(
            { search: `?week=${newWeek}` },
            { replace: true } 
        );
    };

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await groupService.getLessons(id, weekValue);
                setLessons(data);
            } catch (error) {
                console.error('Ошибка загрузки', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [id, weekValue]);

    if (loading) return <h2>Загрузка...</h2>;
    let content;

    if (lessons && lessons.length > 0) {
        const days = new Set();
        for (const lesson of lessons) {
            days.add(lesson.weekday);
        }
        const weeklist = [...days];
        content = weeklist.map(day => {
            const dayLessons = lessons.filter(l => l.weekday === day);

            return (
                <div key={day} className="weekday-block">
                    <div className="weekday-title">{day}</div>
                    <div className="pairs-list">
                        {dayLessons.map(elem => (
                            <PairCard
                                key={elem.id || elem.order}
                                num={elem.order}
                                teacher={elem.teachers[0]}
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