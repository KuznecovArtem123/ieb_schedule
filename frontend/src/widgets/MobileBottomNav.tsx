import { NavLink } from 'react-router-dom';
import { Gear, Calendar } from '@gravity-ui/icons';
import { useActiveSection } from '@/shared/lib/useActiveSection';

function MobileBottomNav() {
    const { scheduleActive, settingsActive } = useActiveSection();

    return (
        <nav className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-10 grid grid-cols-2 gap-1.5 rounded-[22px] bg-surface/95 p-[3px_3px_4px] shadow-nav backdrop-blur md:hidden" aria-label="Основная навигация">
            <NavLink
                className={`grid  place-items-center rounded-[13px] text-[0.82rem] font-bold no-underline transition ${scheduleActive ? 'bg-chip-primary text-primary-text' : 'text-nav-idle'}`}
                to="/"
                end
            >
                <Calendar width="25" height='25'></Calendar>
                <span>Расписание</span>
            </NavLink>
            <NavLink className={`grid min-h-[54px] place-items-center  rounded-[13px] text-[0.82rem] font-bold no-underline transition ${settingsActive ? 'bg-chip-primary text-primary-text' : 'text-nav-idle'}`}
                to="/settings"
                end
                >
                <Gear width="25" height='25'></Gear>
                <span>Настройки</span>
            </NavLink>
        </nav>
    );
}

export default MobileBottomNav;
