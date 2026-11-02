import type { MergedLesson } from '@/entities/lesson/model/types';

interface LessonRowProps {
    elem: MergedLesson;
    isTeacherSchedule: boolean;
}

export function LessonRow({ elem, isTeacherSchedule }: LessonRowProps) {
    const isSplitPair = elem.items.length > 1;

    return (
        <tr className="border-b-2 border-line last:border-b-0 hover:bg-surface-soft/30 transition-colors">
            <td className="px-4 py-5 align-top font-extrabold text-link select-none w-[7%]">
                {elem.order}
            </td>
            
            <td className="whitespace-nowrap px-4 py-5 align-top font-semibold text-meta select-none w-[14%]">
                {elem.start_time.slice(0, 5)} – {elem.end_time.slice(0, 5)}
            </td>
            
            <td colSpan={3} className="p-0 align-top w-[79%]">
                <div className="relative">
                    {isSplitPair && (
                        <div className="absolute left-2 top-3 bottom-3 w-[3px] rounded-full bg-primary/40" />
                    )}

                    <div className="flex flex-col">
                        {elem.items.map((pair, index) => (
                            <div key={pair.id} className="flex flex-col">
                                {index > 0 && (
                                    <div className="mx-4 border-t border-dashed border-line/40" />
                                )}
                                
                                <div className="grid grid-cols-[47%_38%_15%] items-center px-4 py-4 min-h-[64px]">
                                    <div className={`font-extrabold text-heading text-[0.98rem] tracking-tight leading-snug break-words ${isSplitPair ? 'pl-2' : ''}`}>
                                        {pair.subject}
                                    </div>
                                    
                                    <div className="break-words text-meta text-[0.92rem] px-2">
                                        {isTeacherSchedule ? elem.group_code : pair.teachers.join(', ')}
                                    </div>
                                    
                                    <div className="font-bold text-meta break-words text-right md:text-left">
                                        <span className="inline-flex items-center justify-center rounded-md text-[0.92rem] text-primary font-black bg-primary/10 px-2.5 py-0.5">
                                            {pair.auditorium ?? '—'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </td>
        </tr>
    );
}
