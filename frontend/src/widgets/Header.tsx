import Logo from '@/shared/ui/Logo'
import Back from '@/shared/ui/Back';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Gear } from '@gravity-ui/icons';
import { useActiveSection } from '@/shared/lib/useActiveSection';

function Header() {
    const location = useLocation();
    const { scheduleActive, settingsActive } = useActiveSection();
    const showBack = location.pathname !== '/' && location.pathname !== '/404' && location.pathname !== '/settings';

    return (
        <header className="flex flex-wrap items-center justify-between gap-3 px-2 pt-[18px] md:grid md:grid-cols-[1fr_auto_58px] md:gap-6">
            <div className="flex min-w-0 items-center gap-3">
                <Logo />
                <div className="min-w-0">
                    <div className="truncate text-[2rem] font-extrabold leading-none tracking-[-1.5px]">ИЭБ</div>
                    <div className="mt-1.5 text-[1.2rem] font-semibold text-muted">Расписание</div>
                </div>
            </div>
            <nav className="hidden items-center gap-1 md:justify-self-end md:flex" aria-label="Навигация для компьютера">
                <NavLink
                    className={`flex min-h-[44px] items-center gap-2 rounded-[13px] px-4 text-sm font-bold no-underline transition ${scheduleActive ? 'bg-chip-primary text-primary-text' : 'text-nav-idle'}`}
                    to="/"
                    end
                >
                    <Calendar width="21" height="21" />
                    <span>Расписание</span>
                </NavLink>
                <NavLink
                    className={`flex min-h-[44px] items-center gap-2 rounded-[13px] px-4 text-sm font-bold no-underline transition ${settingsActive ? 'bg-chip-primary text-primary-text' : 'text-nav-idle'}`}
                    to="/settings"
                    end
                >
                    <Gear width="21" height="21" />
                    <span>Настройки</span>
                </NavLink>
            </nav>
            {showBack ? <div className="md:justify-self-end"><Back /></div> : <div className="hidden md:block" />}
        </header>
    )
}

export default Header;
