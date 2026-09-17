import BasicButton from '../../../shared/ui/BasicButton';

function TeacherButton(props) {
    return (
        <BasicButton to={`/teacher/${props.id}/?week=this`}>
            {props.name}
        </BasicButton>
    );
}

export default TeacherButton;