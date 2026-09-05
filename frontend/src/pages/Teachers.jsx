import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Teacher from '../components/Teacher';
import { teacherService } from '../services/teacherService';

const Teachers = () => {
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

    const content = teachers.map((elem) => {
        return <Teacher key={elem.id} id={elem.id} name={elem.search_name}></Teacher>
    });
    return (
        <div className='nav_buttons--teachers'>
            {content}
        </div>
    );
};

export default Teachers;