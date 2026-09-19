import { BookmarkList } from '@/features/bookmarks';
import BasicButton from '@/shared/ui/BasicButton';

function EduPage() {
    return (
        <div className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col overflow-hidden rounded-[40px] bg-surface p-5 shadow-card gap-3">
                <BasicButton to="/edu/spo">Расписание СПО</BasicButton>
                <BasicButton to="/edu/vo">Расписание ВО</BasicButton>
                <BasicButton to="/teachers" variant="accent">Расписание для преподавателей</BasicButton>
            </div>
            <BookmarkList></BookmarkList>
        </div>
    )
}

export default EduPage;