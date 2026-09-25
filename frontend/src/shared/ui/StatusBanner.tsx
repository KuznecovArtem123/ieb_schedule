import type { ReactNode } from 'react';

interface StatusBannerProps {
    children: ReactNode;
    action?: ReactNode;
    tone?: 'info' | 'warning';
}

const toneStyles = {
    info: 'border-primary/30 bg-chip-primary text-primary-text',
    warning: 'border-warning bg-warning/15 text-warning-content',
};

function StatusBanner({ children, action, tone = 'info' }: StatusBannerProps) {
    return (
        <div
            role="status"
            className={`mb-[17px] flex flex-wrap items-center gap-3 rounded-[17px] border px-4 py-3 text-sm font-semibold leading-5 ${toneStyles[tone]}`}
        >
            <div className="min-w-0 flex-1 basis-48">{children}</div>
            {action}
        </div>
    );
}

export default StatusBanner;
