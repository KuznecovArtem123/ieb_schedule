import GroupButton from "@/entities/group/ui/GroupButton";
import TeacherButton from "@/entities/teacher/ui/TeacherButton";
import groupService from "@/entities/group/api/groupService";
import teacherService from "@/entities/teacher/api/teacherService";
import type { Group } from "@/entities/group/model/types";
import type { Teacher } from "@/entities/teacher/model/types";
import { useFetch } from "@/shared/lib/useFetch";
import Status from "@/shared/ui/Status";
import { useBookmarks } from "../model/useBookmarks";
import BookmarkButton from "./BookmarkButton";

function BookmarkList() {
    const bookmarks = useBookmarks();
    const hasGroups = bookmarks.groups.length > 0;
    const hasTeachers = bookmarks.teachers.length > 0;

    const groupState = useFetch<Group[]>(
        (onCached, forceRequest = false) => hasGroups ? groupService.getAll(onCached, forceRequest) : Promise.resolve([]),
        [hasGroups],
    );
    const teacherState = useFetch<Teacher[]>(
        (onCached, forceRequest = false) => hasTeachers ? teacherService.get(onCached, forceRequest) : Promise.resolve([]),
        [hasTeachers],
    );

    if (!hasGroups && !hasTeachers) return null;

    const loading = (hasGroups && groupState.loading) || (hasTeachers && teacherState.loading);
    const failed = (hasGroups && groupState.error && groupState.data === null) ||
        (hasTeachers && teacherState.error && teacherState.data === null);

    const groups = bookmarks.groups
        .map((id) => groupState.data?.find((group) => group.id === id))
        .filter((group) => group !== undefined);

    const teachers = bookmarks.teachers
        .map((id) => teacherState.data?.find((teacher) => teacher.id === id))
        .filter((teacher) => teacher !== undefined);

    if (groups.length === 0 && teachers.length === 0) {
        if (loading) return <Status>Загрузка...</Status>;
        if (failed) return <Status>Не удалось загрузить избранное</Status>;
        return null;
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-[40px] bg-surface p-5 shadow-card gap-0 [&>*:last-child]:mb-0">
            <p className="mb-3 text-center text-lg font-extrabold text-heading">Избранное</p>
            {loading && <Status>Загрузка остального избранного...</Status>}
            {Boolean(failed) && <Status>Часть избранного не удалось загрузить</Status>}

            {groups.map((group) => (
                <GroupButton
                    key={group.id}
                    id={group.id}
                    profession={group.profession}
                    code={group.code}
                    action={<BookmarkButton kind="groups" id={group.id} />}
                />
            ))}

            {teachers.map((teacher) => (
                <TeacherButton
                    key={teacher.id}
                    id={teacher.id}
                    name={teacher.search_name}
                    action={<BookmarkButton kind="teachers" id={teacher.id} />}
                />
            ))}
        </div>
    );
}

export default BookmarkList;
