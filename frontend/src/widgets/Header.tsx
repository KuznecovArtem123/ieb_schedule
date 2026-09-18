import Logo from '@/shared/ui/Logo'
import Back from '@/shared/ui/Back';
import { useLocation } from 'react-router-dom';

function Header() {
    const location = useLocation();
    const showBack = location.pathname !== '/' && location.pathname !== '/404' && location.pathname !== '/settings';

    return (
        <header className="flex items-center justify-between gap-3 px-2 pt-[18px]">
            <div className="flex min-w-0 items-center gap-3">
                <Logo />
                <div className="min-w-0">
                    <div className="truncate text-[2rem] font-extrabold leading-none tracking-[-1.5px]">ИЭБ</div>
                    <div className="mt-1.5 text-[1.2rem] font-semibold text-[#8b9ab2]">Расписание</div>
                </div>
            </div>
            {showBack ? <Back /> : ''}
        </header>
    )
}

export default Header;