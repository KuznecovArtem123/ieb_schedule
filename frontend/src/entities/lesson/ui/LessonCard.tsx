interface LessonCardProps {
  num: number;
  teachers: string[];
  classroom: string | null;
  subject: string;
  startTime: string;
  endTime: string;
  studentsGroup: string;
  theme: {
    chip: string;
    header: string;
  };
};

function LessonCard({
    num,
    teachers,
    classroom,
    subject,
    startTime,
    endTime,
    studentsGroup,
    theme
}: LessonCardProps) {
    return (
        <>
        <article className={` rounded-[27px] bg-white px-[22px] py-5 m-0`}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className={`rounded-[13px] px-[13px] py-2 text-[0.95rem] font-extrabold ${theme.chip}`}>{num} пара</div>
                <div className={`rounded-[13px] px-[13px] py-2 text-[0.95rem] font-semibold ${theme.chip}`}><span className="mr-2">◷</span>{startTime} – {endTime}</div>
            </div>
            <div className="mx-[5px] mt-6 mb-[18px]">
                <div className="text-[1.28rem] font-extrabold leading-tight">{subject}</div>
                <div className="mt-1 text-[1.05rem]">{studentsGroup}</div>
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-[#f4f7fb] px-3 py-2.5 text-[0.9rem] font-bold text-[#8996a9]">
                <span className="flex-1 basis-[145px]">● {teachers.join(', ')}</span>
                <span className={`text-base ${theme.chip.split(' ')[1]}`}>{classroom ?? '—'}</span>
            </div>
        </article>
        <div className={`h-[1px] w-[300px] ${theme.header} last:hidden self-center`}></div>
        </>
    );
}

export default LessonCard;