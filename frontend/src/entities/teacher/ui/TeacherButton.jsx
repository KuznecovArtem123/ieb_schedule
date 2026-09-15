import { Link } from "react-router-dom";

function TeacherButton(props) {
    return (
        <Link className="block rounded-[17px] bg-white px-4 py-4 text-center text-lg font-bold text-[#2188ee] no-underline shadow-[0_4px_10px_rgba(39,82,133,0.08)] transition hover:bg-[#e9f3fd]" to={`/teacher/${props.id}/?week=this`}>
            {props.name}
        </Link>
    );
}

export default TeacherButton;