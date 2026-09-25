import { ChevronLeft, ChevronRight } from '@gravity-ui/icons';
import { Button } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { dayAliases } from '../model/dayAliases';

interface DayNavigationProps {
    onDaySelect(index: number): void;
    days: string[];
}

function DayNavigation({ onDaySelect, days }: DayNavigationProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScroll, setCanScroll] = useState({ left: false, right: false });

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const update = () => {
            const { scrollLeft, clientWidth, scrollWidth } = element;
            setCanScroll({
                left: scrollLeft > 1,
                right: scrollLeft + clientWidth < scrollWidth - 1,
            });
        };
        const observer = new ResizeObserver(update);
        observer.observe(element);
        element.addEventListener('scroll', update, { passive: true });
        return () => {
            observer.disconnect();
            element.removeEventListener('scroll', update);
        };
    }, [days]);

    const scroll = (direction: number) => {
        const element = scrollRef.current;
        element?.scrollBy({ left: direction * element.clientWidth * 0.75 });
    };
    const arrowClass = canScroll.left || canScroll.right ? 'shrink-0' : 'shrink-0 invisible';

    return (
        <nav aria-label="Навигация по дням" className="flex items-center gap-2 py-2">
            <Button
                isIconOnly
                variant="secondary"
                aria-label="Прокрутить дни влево"
                isDisabled={!canScroll.left}
                onClick={() => scroll(-1)}
                className={arrowClass}
            >
                <ChevronLeft width={18} height={18} aria-hidden="true" />
            </Button>
            <div ref={scrollRef} className="flex min-w-0 flex-1 justify-center-safe gap-2 overflow-x-auto p-1 scrollbar-none motion-safe:scroll-smooth">
                {days.map((day, index) => (
                    <Button
                        key={day}
                        variant="secondary"
                        className="shrink-0"
                        onClick={() => onDaySelect(index)}
                    >
                        {dayAliases[day.toLowerCase()] || day}
                    </Button>
                ))}
            </div>
            <Button
                isIconOnly
                variant="secondary"
                aria-label="Прокрутить дни вправо"
                isDisabled={!canScroll.right}
                onClick={() => scroll(1)}
                className={arrowClass}
            >
                <ChevronRight width={18} height={18} aria-hidden="true" />
            </Button>
        </nav>
    );
}

export default DayNavigation;
