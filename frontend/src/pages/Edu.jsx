import { Link } from "react-router-dom";

function Edu() {
    return (
        <div className="nav_buttons--groups">
            <Link className="redirect_button" to="/edu/spo">Расписание СПО</Link>
            <Link className="redirect_button" to="/edu/vo">Расписание ВО</Link>
            <Link className="redirect_button" to="/teachers">Расписание для преподавателей</Link>
        </div>
    )
}

export default Edu;