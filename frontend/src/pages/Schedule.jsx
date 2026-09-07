import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from "react-router-dom";
import { groupService } from '../services/groupService';
import Lessons from '../components/Lessons';

function Schedule() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [lessons, setLessons] = useState(null);
    const [loading, setLoading] = useState(true);
    const weekValue = searchParams.get('week') || 'this';

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

    if (loading) {
        return <h2>Загрузка...</h2>;
    } else return <Lessons lessons={lessons} weekValue={weekValue}></Lessons>
}

export default Schedule;