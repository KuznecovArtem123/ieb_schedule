import { useParams } from "react-router-dom";

import { groupService } from '@/entities/group/api/groupService';
import GroupButton from '@/entities/group/ui/GroupButton';
import { isEduCategory } from '@/entities/group/model/types';
import { useFetch } from '@/shared/lib/useFetch';
import Status from '@/shared/ui/Status';
import { BookmarkButton } from '@/features/bookmarks';

const GroupsPage = () => {
    const { category: categoryParam } = useParams();
    const category = isEduCategory(categoryParam) ? categoryParam : 'spo';

    const { data: groups, loading, error } = useFetch(() => groupService.get(category), [category]);

    if (loading) return <Status>Загрузка...</Status>;
    if (error) return <Status>Не удалось загрузить группы</Status>;
    if (!groups?.length) return <Status>Группы не найдены</Status>;

    return (
        <div className="mt-6 grid gap-3 md:grid-cols-2 md:gap-4">
            {groups.map((elem) => (
                <GroupButton
                    key={elem.id}
                    id={elem.id}
                    profession={elem.profession}
                    code={elem.code}
                    category={category}
                    action={<BookmarkButton kind="groups" id={elem.id} />}
                />
            ))}
        </div>
    );
};

export default GroupsPage;
