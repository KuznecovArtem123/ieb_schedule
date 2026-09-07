import { Outlet, useLocation } from 'react-router-dom';
import Back from './components/Back';
import Logo from './components/Logo';
import Scroll from './components/Scroll';

export default function Layout() {
    const location = useLocation();
    const showBack = location.pathname !== '/' && location.pathname !== '/404';
    return (
        <div className='container'>
            {showBack && <Back />}
            <Logo />
            <Outlet />
            <Scroll></Scroll>
        </div>
    );
}