import { BookmarkList } from '@/features/bookmarks';
import BasicButton from '@/shared/ui/BasicButton';

function EduPage() {
    return (
        <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] md:items-start md:gap-8 md:mt-10">
            <div className="flex flex-col overflow-hidden rounded-[40px] bg-surface p-5 shadow-card gap-3 md:p-8 md:gap-4">
                <BasicButton to="/edu/spo">Расписание СПО</BasicButton>
                <BasicButton to="/edu/vo">Расписание ВО</BasicButton>
                <BasicButton to="/teachers">Расписание для преподавателей</BasicButton>
            </div>
            <BookmarkList></BookmarkList>
        </div>
    )
}

export default EduPage;