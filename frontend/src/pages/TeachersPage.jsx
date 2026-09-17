import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

import TeacherButton from '../entities/teacher/ui/TeacherButton';
import { teacherService } from '../entities/teacher/api/teacherService';

const TeachersPage = () => {
    const { category } = useParams();
    const [teachers, setTeachers] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoading(true)
                const data = await teacherService.get(category);
                setTeachers(data);
            } catch (error) {
                console.error('Ошибка загрузки', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [category]);

    if (loading) return <p className="py-12 text-center text-lg font-bold text-[#7897bd]">Загрузка...</p>;
    if (!teachers) return <p className="py-12 text-center text-lg font-bold text-[#7897bd]">Преподаватели не найдены</p>;

    return (
        <div className="mt-6 flex flex-col gap-3">
            {teachers.map((elem) => (
                <TeacherButton key={elem.id} id={elem.id} name={elem.search_name} />
            ))}
        </div>
    );
};

export default TeachersPage;