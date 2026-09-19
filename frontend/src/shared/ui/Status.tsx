import type { ReactNode } from 'react';

interface StatusProps {
    children: ReactNode;
}

function Status({ children }: StatusProps) {
    return <p className="py-12 text-center text-lg font-bold text-status">{children}</p>;
}

export default Status;
