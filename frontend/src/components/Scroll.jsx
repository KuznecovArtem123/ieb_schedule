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
            className={`scroll-to-top ${isVisible ? 'visible' : ''}`}
            onClick={scrollToTop}
            id="scrollToTopBtn"
            title="Наверх">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#f5f8ff" />
                <path d="M10 23L18 13L26 23" stroke="#2563eb" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    );
}

export default Scroll;