import { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import { useParams } from "react-router-dom";
import Group from '../components/Group';

const Groups = () => {
    const { category } = useParams();
    const [groups, setGroups] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true)
                const data = await groupService.get(category);
                setGroups(data);
            } catch (error) {
                console.error('Ошибка загрузки', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, [category]);

    if (loading) return <h2>Загрузка...</h2>;
    if (!groups) return <p className='no-groups'>Группы не найдены</p>;

    const content = groups.map((elem) => {
        return <Group key={elem.id} id={elem.id} profession={elem.profession} code={elem.code}></Group>
    });
    return (
        <div className='nav_buttons--groups'>
            {content}
        </div>
    );
};

export default Groups;