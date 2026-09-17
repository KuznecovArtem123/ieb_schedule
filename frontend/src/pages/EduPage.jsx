import BasicButton from '../shared/ui/BasicButton';

function EduPage() {
    return (
        <div className="mt-6 flex flex-col gap-3">
            <BasicButton to="/edu/spo">Расписание СПО</BasicButton>
            <BasicButton to="/edu/vo">Расписание ВО</BasicButton>
            <BasicButton to="/teachers" variant="accent">Расписание для преподавателей</BasicButton>
        </div>
    )
}

export default EduPage;