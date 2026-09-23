import Logo from '@/shared/ui/Logo'
import Back from '@/shared/ui/Back';
import { NavLink, useLocation } from 'react-router-dom';

function Header() {
    const location = useLocation();
    const showBack = location.pathname !== '/' && location.pathname !== '/404' && location.pathname !== '/settings';

    return (
        <header className="flex items-center justify-between gap-3 px-2 pt-[18px] md:px-0 md:pt-8">
            <div className="flex min-w-0 items-center gap-3">
                <Logo />
                <div className="min-w-0">
                    <div className="truncate text-[2rem] font-extrabold leading-none tracking-[-1.5px]">ИЭБ</div>
                    <div className="mt-1.5 text-[1.2rem] font-semibold text-muted">Расписание</div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden items-center gap-2 md:flex" aria-label="Основная навигация">
                    <NavLink className="rounded-xl px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip-primary hover:text-primary-text" to="/">Расписание</NavLink>
                    <NavLink className="rounded-xl px-4 py-2 text-sm font-bold text-muted transition hover:bg-chip-primary hover:text-primary-text" to="/settings">Настройки</NavLink>
                </nav>
                {showBack ? <Back /> : ''}
            </div>
        </header>
    )
}

export default Header;