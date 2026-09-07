function PairCard(props) {
    return (
        <div className="pair-card">
            <div className="pair-row pair-row--top">
                <div className="pair-num">{props.num} пара</div>
                <div className="pair-classroom">{props.classroom}</div>
            </div>
            <div className="pair-row pair-row--middle">
                <div className="pair-subject">{props.subject}</div>
                <div className="pair-time">{props.starttime}–{props.endtime}</div>
            </div>
            <div className="pair-row pair-row--footer">
                <span className="pair-teacher">{props.teachers.join(',')}</span>
                <span className="pair-students-group">{props.students_group}</span>
            </div>
        </div>
    );
}

export default PairCard;