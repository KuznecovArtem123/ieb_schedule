import { Link } from "react-router-dom";

function Group(props) {
    return (
        <Link className="redirect_button" to={`/schedule/${props.id}/?week=this`}>
            {props.profession} {props.code}
        </Link>
    );
}

export default Group;