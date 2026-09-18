import BasicButton from '@/shared/ui/BasicButton';

interface GroupButtonProps {
    profession: string;
    code: string;
    id: number;
};

function GroupButton(props: GroupButtonProps) {
    return (
        <BasicButton className="shadow-[0_4px_10px_rgba(39,82,133,0.08)]" to={`/schedule/${props.id}/?week=this`}>
            {props.profession} {props.code}
        </BasicButton>
    );
}

export default GroupButton;