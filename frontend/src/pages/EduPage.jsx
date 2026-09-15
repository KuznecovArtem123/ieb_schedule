import { Link } from "react-router-dom";

function EduPage() {
    return (
        <div className="mt-6 flex flex-col gap-3">
            <Link className="rounded-[17px] bg-[#2B60A5] px-4 py-4 text-center text-lg font-bold text-white no-underline shadow-[0_10px_24px_rgba(31,126,238,0.2)] transition hover:bg-[#1474ed]" to="/edu/spo">Расписание СПО</Link>
            <Link className="rounded-[17px] bg-[#2B60A5] px-4 py-4 text-center text-lg font-bold text-white no-underline shadow-[0_10px_24px_rgba(31,126,238,0.2)] transition hover:bg-[#1474ed]" to="/edu/vo">Расписание ВО</Link>
            <Link className="rounded-[17px] bg-[#2B60A5] px-4 py-4 text-center text-lg font-bold text-white no-underline shadow-[0_10px_24px_rgba(255,121,18,0.2)] transition hover:bg-[#e96b0b]" to="/teachers">Расписание для преподавателей</Link>
        </div>
    )
}

export default EduPage;