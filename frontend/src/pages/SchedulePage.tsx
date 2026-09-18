import { useState, useEffect } from 'react';
import { useSearchParams, useParams, useMatch } from "react-router-dom";

import { groupService } from '@/entities/group/api/groupService';
import { teacherService } from '@/entities/teacher/api/teacherService';
import Lessons from '@/widgets/Lessons';
import { isWeek, type Lesson } from '@/entities/lesson/model/types';

function SchedulePage() {
    const { id } = useParams();
    const idNumber = Number(id);
    const [searchParams] = useSearchParams();

    const [lessons, setLessons] = useState<Lesson[] | null>(null);
    const [loading, setLoading] = useState(true);
    const weekParam = searchParams.get('week');
    const weekValue = isWeek(weekParam) ? weekParam : 'this';
    const isTeacherRoute = useMatch('/teacher/:id');

    useEffect(() => {
        const fetchLessons = async () => {
            const service = isTeacherRoute ? teacherService : groupService
            try {
                const data = await service.getLessons(idNumber, weekValue);
                setLessons(data);
            } catch (error) {
                console.error('Ошибка загрузки', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [idNumber, isTeacherRoute, weekValue]);

    if (loading) {
        return <p className="py-12 text-center text-lg font-bold text-[#7897bd]">Загрузка...</p>;
    }

    if (!lessons) {
        return <p className="py-12 text-center text-lg font-bold text-[#7897bd]">Не удалось загрузить расписание</p>;
    }

    return <Lessons lessons={lessons} weekValue={weekValue} />;
}

export default SchedulePage;
