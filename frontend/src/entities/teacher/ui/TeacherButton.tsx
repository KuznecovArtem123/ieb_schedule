import type { ReactNode } from 'react';
import BasicButton from '@/shared/ui/BasicButton';

interface TeacherButtonProps {
    name: string;
    id: number;
    action?: ReactNode;
}

function TeacherButton({ id, name, action }: TeacherButtonProps) {
    return (
        <div className="relative mb-3 w-full break-inside-avoid flex items-center justify-center md:mb-4">
            <BasicButton
                to={`/teacher/${id}/?week=this`}
                className={`w-full text-center md:flex md:min-h-[60px] md:items-center md:justify-center ${action ? 'pr-10' : ''}`}
            >
                {name}
            </BasicButton>

            {action && (
                <div className="absolute right-2 flex items-center justify-center min-w-[16px] z-10">
                    {action}
                </div>
            )}
        </div>
    );
}

export default TeacherButton;
