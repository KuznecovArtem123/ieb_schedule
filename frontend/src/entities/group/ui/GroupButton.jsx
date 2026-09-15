import { Link } from "react-router-dom";

function GroupButton(props) {
    return (
        <Link className="block rounded-[17px] bg-[#2B60A5] px-4 py-4 text-center text-lg font-bold text-white no-underline shadow-[0_4px_10px_rgba(39,82,133,0.08)] transition hover:bg-[#e9f3fd]" to={`/schedule/${props.id}/?week=this`}>
            {props.profession} {props.code}
        </Link>
    );
}

export default GroupButton;