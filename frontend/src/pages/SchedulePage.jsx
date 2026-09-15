import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useMatch } from "react-router-dom";

import { groupService } from '../entities/group/api/groupService';
import { teacherService } from '../entities/teacher/api/teacherService';
import Lessons from '../widgets/Lessons';

function SchedulePage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [lessons, setLessons] = useState(null);
    const [loading, setLoading] = useState(true);
    const weekValue = searchParams.get('week') || 'this';
    const isTeacherRoute = useMatch('/teacher/:id');

    useEffect(() => {
        const fetchLessons = async () => {
            const service = isTeacherRoute ? teacherService : groupService
            try {
                const data = await service.getLessons(id, weekValue);
                setLessons(data);
            } catch (error) {
                console.error('Ошибка загрузки', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [id, isTeacherRoute, weekValue]);

    if (loading) {
        return <p className="py-12 text-center text-lg font-bold text-[#7897bd]">Загрузка...</p>;
    } else return <Lessons lessons={lessons} weekValue={weekValue}></Lessons>
}

export default SchedulePage;