import Logo from '../shared/ui/Logo'
import Back from '../shared/ui/Back';
import { useLocation } from 'react-router-dom';

function Header() {
    const location = useLocation();
    const showBack = location.pathname !== '/' && location.pathname !== '/404' && location.pathname !== '/settings';

    return (
        <div className='flex justify-start items-center px-15 py-10 gap-10'>
            <Logo></Logo>
            <h1>ИЭБ Расписание</h1>
            {showBack && <Back />}
        </div>
    )
}

export default Header;