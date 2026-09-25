import { useState, useEffect } from 'react';

export function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(min-width: 1024px)').matches;
        }
        return false;
    });

    useEffect(() => {
        const mediaMatch = window.matchMedia('(min-width: 1024px)');


        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mediaMatch.addEventListener('change', handler);

        return () => mediaMatch.removeEventListener('change', handler);
    }, []);

    return isDesktop;
}