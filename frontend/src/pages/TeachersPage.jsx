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

    if (loading) return <h2>Загрузка...</h2>;
    if (!teachers) return <p className='no-teachers'>Преподаватели не найдены</p>;

    return (
        <div className='nav_buttons--teachers'>
            {teachers.map((elem) => (
                <TeacherButton key={elem.id} id={elem.id} name={elem.search_name} />
            ))}
        </div>
    );
};

export default TeachersPage;