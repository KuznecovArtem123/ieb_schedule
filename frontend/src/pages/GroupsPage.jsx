import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

import { groupService } from '../entities/group/api/groupService';
import GroupButton from '../entities/group/ui/GroupButton';

const GroupsPage = () => {
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

    return (
        <div className='nav_buttons--groups'>
            {groups.map((elem) => (
                <GroupButton key={elem.id} id={elem.id} profession={elem.profession} code={elem.code} />
            ))}
        </div>
    );
};

export default GroupsPage;