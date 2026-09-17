import BasicButton from '../../../shared/ui/BasicButton';

function TeacherButton(props) {
    return (
        <BasicButton variant="light" to={`/teacher/${props.id}/?week=this`}>
            {props.name}
        </BasicButton>
    );
}

export default TeacherButton;