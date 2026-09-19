import BasicButton from '@/shared/ui/BasicButton';

interface TeacherButtonProps {
    name: string;
    id: number;
};

function TeacherButton(props: TeacherButtonProps) {
    return (
        <BasicButton to={`/teacher/${props.id}/?week=this`}>
            {props.name}
        </BasicButton>
    );
}

export default TeacherButton;