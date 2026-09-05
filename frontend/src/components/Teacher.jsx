import { Link } from "react-router-dom";

function Teacher(props) {
    return (
        <Link className="redirect_button" to={`/teacher/${props.id}/?week=this`}>
            {props.name}
        </Link>
    );
}

export default Teacher;