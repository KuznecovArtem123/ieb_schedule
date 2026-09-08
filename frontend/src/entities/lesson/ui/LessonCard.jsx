function LessonCard({
    num,
    teachers,
    classroom,
    subject,
    startTime,
    endTime,
    studentsGroup
}) {
    return (
        <div className="pair-card">
            <div className="pair-row pair-row--top">
                <div className="pair-num">{num} пара</div>
                <div className="pair-classroom">{classroom}</div>
            </div>
            <div className="pair-row pair-row--middle">
                <div className="pair-subject">{subject}</div>
                <div className="pair-time">{startTime}–{endTime}</div>
            </div>
            <div className="pair-row pair-row--footer">
                <span className="pair-teacher">{teachers.join(',')}</span>
                <span className="pair-students-group">{studentsGroup}</span>
            </div>
        </div>
    );
}

export default LessonCard;