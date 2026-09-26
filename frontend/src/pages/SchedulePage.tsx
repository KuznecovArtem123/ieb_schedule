import { useSearchParams, useParams, useMatch } from "react-router-dom";

import groupService from '@/entities/group/api/groupService';
import teacherService from '@/entities/teacher/api/teacherService';
import Lessons from '@/widgets/lessons/ui/Lessons';
import { isWeek, type Lesson } from '@/entities/lesson/model/types';
import { useFetch } from '@/shared/lib/useFetch';
import { useIsOnline } from '@/shared/lib/network';
import Status from '@/shared/ui/Status';
import StatusBanner from '@/shared/ui/StatusBanner';
import { Button } from "@heroui/react";
import { ArrowRotateRight } from '@gravity-ui/icons';

function SchedulePage() {
    const { id } = useParams();
    const idNumber = Number(id);
    const [searchParams] = useSearchParams();
    const isOnline = useIsOnline();

    const weekParam = searchParams.get('week');
    const weekValue = isWeek(weekParam) ? weekParam : 'this';
    const isTeacherRoute = useMatch('/teacher/:id') !== null;

    const { data: lessons, loading, refreshing, retrying, refetch, error } = useFetch<Lesson[]>(
        (onCached, forceRequest = false) =>
            (isTeacherRoute ? teacherService : groupService).getLessons(idNumber, weekValue, onCached, forceRequest),
        [idNumber, isTeacherRoute, weekValue],
    );

    if (loading) return <Status>Загрузка...</Status>;
    let content;
    if (error && lessons === null) {
        content = <Status>Не удалось загрузить расписание</Status>;
    } else if (lessons) {
        content = <Lessons lessons={lessons} weekValue={weekValue} isTeacherSchedule={isTeacherRoute} />;
    }
    if (!lessons) content = <Status>Пар нет</Status>;

    return (
        <div className="mt-2">
            {!isOnline ? (
                <StatusBanner tone="warning" action={
                    <Button
                        variant="secondary"
                        className="min-h-11 shrink-0 rounded-xl border border-warning/40 bg-warning/10 text-warning-content"
                        isDisabled={retrying}
                        onClick={refetch}
                    >
                        <ArrowRotateRight
                            width={16}
                            height={16}
                            aria-hidden="true"
                            className={retrying ? 'motion-safe:animate-spin' : undefined}
                        />
                        {retrying ? 'Загрузка...' : 'Повторить'}
                    </Button>}>
                    Вы офлайн. Расписание может быть неактуальным.
                </StatusBanner>
            ) : refreshing ? (
                <StatusBanner tone="info">
                    Показываем сохранённое расписание. Проверяем обновления…
                </StatusBanner>
            ) : null}
            {content}
        </div>
    );
}

export default SchedulePage;
