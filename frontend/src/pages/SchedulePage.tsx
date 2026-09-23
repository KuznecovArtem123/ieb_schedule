import { useSearchParams, useParams, useMatch } from "react-router-dom";

import { groupService } from '@/entities/group/api/groupService';
import { teacherService } from '@/entities/teacher/api/teacherService';
import Lessons from '@/widgets/Lessons';
import { isWeek } from '@/entities/lesson/model/types';
import { useFetch } from '@/shared/lib/useFetch';
import Status from '@/shared/ui/Status';

function SchedulePage() {
    const { id } = useParams();
    const idNumber = Number(id);
    const [searchParams] = useSearchParams();

    const weekParam = searchParams.get('week');
    const weekValue = isWeek(weekParam) ? weekParam : 'this';
    const isTeacherRoute = useMatch('/teacher/:id') !== null;

    const { data: lessons, loading, error } = useFetch(
        () => (isTeacherRoute ? teacherService : groupService).getLessons(idNumber, weekValue),
        [idNumber, isTeacherRoute, weekValue],
    );

    if (loading) return <Status>Загрузка...</Status>;
    if (error) return <Status>Не удалось загрузить расписание</Status>;
    if (!lessons) return <Status>Пар нет</Status>;

    return <Lessons lessons={lessons} weekValue={weekValue} isTeacherSchedule={isTeacherRoute} />;
}

export default SchedulePage;
