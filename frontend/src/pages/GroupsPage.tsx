import { useParams } from "react-router-dom";

import groupService from '@/entities/group/api/groupService';
import GroupButton from '@/entities/group/ui/GroupButton';
import { isEduCategory, type Group } from '@/entities/group/model/types';
import { useFetch } from '@/shared/lib/useFetch';
import Status from '@/shared/ui/Status';
import { BookmarkButton } from '@/features/bookmarks';

const GroupsPage = () => {
    const { category: categoryParam } = useParams();
    const category = isEduCategory(categoryParam) ? categoryParam : 'spo';

    const { data: groups, loading, error } = useFetch<Group[]>(
        (onCached, forceRequest = false) => groupService.get(category, onCached, forceRequest),
        [category]
    );

    if (loading) return <Status>Загрузка...</Status>;
    if (error && groups === null) return <Status>Не удалось загрузить группы</Status>;
    if (!groups?.length) return <Status>Группы не найдены</Status>;

    return (
        <div className="mt-6 columns-1 md:columns-2 md:gap-4">
            {groups.map((elem) => (
                <GroupButton
                    key={elem.id}
                    id={elem.id}
                    profession={elem.profession}
                    code={elem.code}
                    action={<BookmarkButton kind="groups" id={elem.id} />}
                />
            ))}
        </div>
    );
};

export default GroupsPage;
