import GroupButton from "@/entities/group/ui/GroupButton";
import TeacherButton from "@/entities/teacher/ui/TeacherButton";
import { groupService } from "@/entities/group/api/groupService";
import { teacherService } from "@/entities/teacher/api/teacherService";
import { useFetch } from "@/shared/lib/useFetch";
import Status from "@/shared/ui/Status";
import { useBookmarks } from "../model/useBookmarks";
import BookmarkButton from "./BookmarkButton";

function BookmarkList() {
    const bookmarks = useBookmarks();
    const hasBookmarks = bookmarks.groups.length > 0 || bookmarks.teachers.length > 0;

    const { data, loading, error } = useFetch(async () => {
        if (!hasBookmarks) return null;

        const [groups, teachers] = await Promise.all([
            groupService.getAll(),
            teacherService.get(),
        ]);

        return { groups, teachers };
    }, [hasBookmarks]);

    if (!hasBookmarks) return null;
    if (loading) return <Status>Загрузка...</Status>;
    if (error || !data) return <Status>Не удалось загрузить избранное</Status>;

    const groups = bookmarks.groups
        .map((id) => data.groups.find((group) => group.id === id))
        .filter((group) => group !== undefined);

    const teachers = bookmarks.teachers
        .map((id) => data.teachers.find((teacher) => teacher.id === id))
        .filter((teacher) => teacher !== undefined);

    if (groups.length === 0 && teachers.length === 0) return null;

    return (
        <div className="flex flex-col overflow-hidden rounded-[40px] bg-surface p-5 shadow-card gap-0 [&>*:last-child]:mb-0">
            <p className="mb-3 text-center text-lg font-extrabold text-heading">Избранное</p>

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
