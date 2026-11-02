import { Clock } from '@gravity-ui/icons';
import type { PairInfo } from '../model/types';

interface LessonCardProps {
    num: number;
    startTime: string;
    endTime: string;
    studentsGroup?: string;
    isTeacherSchedule: boolean;
    items: PairInfo[];
    theme: {
        chip: string;
        header: string;
    };
}

function LessonCard({
    num,
    items,
    startTime,
    endTime,
    studentsGroup,
    isTeacherSchedule,
    theme
}: LessonCardProps) {
    const isSplitPair = items.length > 1;

    return (
        <article className="rounded-[27px] bg-surface px-4 py-5 m-0 flex flex-col shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
                <div className={`rounded-[13px] px-[13px] py-2 text-[0.95rem] font-extrabold ${theme.chip}`}>
                    {num} пара
                </div>
                <div className={`flex items-center rounded-[13px] px-[13px] py-2 text-[0.95rem] font-semibold ${theme.chip}`}>
                    <span className="mr-2"><Clock /></span>
                    {startTime} – {endTime}
                </div>
            </div>

            <div className="space-y-3">
                {items.map((pair, index) => (
                    <div key={pair.id} className="flex flex-col">
                        {isSplitPair && index > 0 && (
                            <div className={`stick h-[1px] w-[80%] ${theme.header} opacity-30 self-center my-3`}></div>
                        )}

                        <div className="p-4 flex flex-col rounded-2xl bg-surface-soft/60 border border-line/30 shadow-sm">
                            <div className="text-[1.15rem] font-extrabold leading-snug text-heading mb-3">
                                {pair.subject}
                            </div>

                            <div className="flex items-center justify-between gap-2 text-[0.88rem] font-bold text-meta mt-auto">
                                <span className="truncate max-w-[75%]">
                                    ● {isTeacherSchedule ? studentsGroup : pair.teachers.join(', ')}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-surface text-primary">
                                    {pair.auditorium ?? '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}

export default LessonCard;
