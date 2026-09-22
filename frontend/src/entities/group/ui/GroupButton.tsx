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
        <div className="relative w-full flex items-center justify-center">
            <BasicButton
                className={`shadow-card w-full text-center relative ${action ? 'pr-10' : ''}`}
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
