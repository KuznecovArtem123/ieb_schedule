import type { ReactNode } from 'react';
import BasicButton from '@/shared/ui/BasicButton';

interface TeacherButtonProps {
    name: string;
    id: number;
    action?: ReactNode;
}

function TeacherButton({ id, name, action }: TeacherButtonProps) {
    return (
        <div className="relative w-full flex items-center justify-center">
            <BasicButton
                to={`/teacher/${id}/?week=this`}
                className={`w-full text-center ${action ? 'pr-10' : ''}`}
            >
                {name}
            </BasicButton>

            {action && (
                <div className="absolute right-4 flex items-center justify-center min-w-[16px] z-10">
                    {action}
                </div>
            )}
        </div>
    );
}

export default TeacherButton;
