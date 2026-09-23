import TeacherButton from '@/entities/teacher/ui/TeacherButton';
import { teacherService } from '@/entities/teacher/api/teacherService';
import { useFetch } from '@/shared/lib/useFetch';
import Status from '@/shared/ui/Status';
import { BookmarkButton } from '@/features/bookmarks';

const TeachersPage = () => {
    const { data: teachers, loading, error } = useFetch(() => teacherService.get(), []);

    if (loading) return <Status>Загрузка...</Status>;
    if (error) return <Status>Не удалось загрузить преподавателей</Status>;
    if (!teachers?.length) return <Status>Преподаватели не найдены</Status>;

    return (
        <div className="mt-6 columns-1 md:columns-2 md:gap-4">
            {teachers.map((elem) => (
                <TeacherButton
                    key={elem.id}
                    id={elem.id}
                    name={elem.search_name}
                    action={<BookmarkButton kind="teachers" id={elem.id} />}
                />
            ))}
        </div>
    );
};

export default TeachersPage;
