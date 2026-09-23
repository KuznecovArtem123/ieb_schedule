import type { ReactNode } from 'react';
import BasicButton from '@/shared/ui/BasicButton';

interface GroupButtonProps {
    profession: string;
    code: string;
    id: number;
    action?: ReactNode;
}

function GroupButton({ id, profession, code, action }: GroupButtonProps) {
    return (
        <div className="relative mb-3 w-full break-inside-avoid flex items-center justify-center md:mb-4">
            <BasicButton
                className={`shadow-card w-full text-center relative md:flex md:min-h-[60px] md:items-center md:justify-center ${action ? 'pr-10' : ''}`}
                to={`/schedule/${id}/?week=this`}
            >
                {profession} {code}
            </BasicButton>

            {action && (
                <div className="absolute right-2 flex items-center justify-center z-10">
                    {action}
                </div>
            )}
        </div>
    );
}

export default GroupButton;
