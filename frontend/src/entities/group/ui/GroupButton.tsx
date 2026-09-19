import BasicButton from '@/shared/ui/BasicButton';

interface GroupButtonProps {
    profession: string;
    code: string;
    id: number;
};

function GroupButton(props: GroupButtonProps) {
    return (
        <BasicButton className="shadow-card" to={`/schedule/${props.id}/?week=this`}>
            {props.profession} {props.code}
        </BasicButton>
    );
}

export default GroupButton;