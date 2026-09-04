import { Outlet, useLocation } from 'react-router-dom';
import Back from './components/Back';
import Logo from './components/Logo';
import Scroll from './components/Scroll';
import { usePWAUpdate } from './hooks/usePWAUpdate'

export default function Layout() {
    const location = useLocation();
    const showBack = location.pathname !== '/' && location.pathname !== '/404';
    const { updateReady, update } = usePWAUpdate();
    return (
        <div className='container'>
            {updateReady && (
                <div>
                    <h2>Доступна новая версия</h2>
                    <button onClick={update} className="redirect_button">
                        Обновить сейчас
                    </button>
                </div>
            )}
            {showBack && <Back />}
            <Logo />
            <Outlet />
            <Scroll></Scroll>
        </div>
    );
}