import { useState, useEffect } from 'react';

function Scroll() {

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    return (
        <button
            className={`fixed bottom-24 right-5 z-20 grid h-12 w-12 place-items-center rounded-full border-0 bg-surface shadow-lg transition ${isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            onClick={scrollToTop}
            id="scrollToTopBtn"
            title="Наверх">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="var(--color-surface-scroll)" />
                <path d="M10 23L18 13L26 23" stroke="var(--color-link)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

export default Scroll;