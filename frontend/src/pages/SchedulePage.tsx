import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from "react-router-dom";

import { groupService } from '@/entities/group/api/groupService';
import { teacherService } from '@/entities/teacher/api/teacherService';
import Lessons from '@/widgets/Lessons';
import { isWeek } from '@/entities/lesson/model/types';
import { useFetch } from '@/shared/lib/useFetch';
import Status from '@/shared/ui/Status';
import { refreshScheduleVersion, useScheduleVersion } from '@/shared/lib/schedule-version';
import { getIsOnline, useIsOnline } from '@/shared/lib/network';

function SchedulePage() {
    const { id } = useParams();
    const idNumber = Number(id);
    const [searchParams] = useSearchParams();

    const weekParam = searchParams.get('week');
    const weekValue = isWeek(weekParam) ? weekParam : 'this';
    const eduParam = searchParams.get('edu');
    const eduValue = eduParam === 'vo' ? 'vo' : 'spo';
    const isTeacherRoute = window.location.pathname.startsWith('/teacher/');
    const scheduleVersion = useScheduleVersion(eduValue, weekValue);
    const networkOnline = useIsOnline();
    const [versionReady, setVersionReady] = useState(false);
    const [versionMissing, setVersionMissing] = useState(false);
    const [versionUnavailable, setVersionUnavailable] = useState(false);

    useEffect(() => {
        let cancelled = false;

        setVersionReady(false);
        setVersionMissing(false);
        setVersionUnavailable(false);
        void refreshScheduleVersion(eduValue, weekValue, true).then((result) => {
            if (cancelled) return;
            setVersionMissing(result === 'missing');
            setVersionUnavailable(result === 'unavailable');
            setVersionReady(result !== 'missing' || !getIsOnline());
        });

        return () => {
            cancelled = true;
        };
    }, [eduValue, weekValue]);

    const { data: lessons, loading, error } = useFetch(
        () => isTeacherRoute
            ? teacherService.getLessons(idNumber, weekValue, eduValue)
            : groupService.getLessons(idNumber, weekValue, eduValue),
        [idNumber, isTeacherRoute, weekValue, eduValue, scheduleVersion],
        versionReady,
    );

    let errorMessage;
    if (!versionReady) {
        errorMessage = <Status>{versionMissing ? 'Расписание отсутствует на эту неделю' : 'Проверка расписания...'}</Status>;
    } else if (loading) {
        errorMessage = <Status>Загрузка расписания...</Status>;
    } else if (error) {
        errorMessage = <Status>Не удалось загрузить расписание</Status>;
    }

    return (
        <Lessons
            lessons={lessons ?? []}
            weekValue={weekValue}
            eduValue={eduValue}
            errorMessage={errorMessage}
            isOffline={versionUnavailable && !networkOnline}
        />
    );
}

export default SchedulePage;
