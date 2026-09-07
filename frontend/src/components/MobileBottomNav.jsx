import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function MobileBottomNav() {
    const scheduleRoutes = ['/', '/edu/', '/schedule/', '/teacher/', '/teachers'];
    const [scheduleActive, activateSchedule] = useState(true);
    const [settingsActive, activateSettings] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const recognizeRoute = () => {
            const isScheduleRoute = scheduleRoutes.some((route) =>
                route === '/' ? location.pathname === '/' : location.pathname.startsWith(route)
            );
            const isSettingsRoute = location.pathname.startsWith('/settings')

            activateSettings(isSettingsRoute) 
            activateSchedule(isScheduleRoute)
        } 
        
        recognizeRoute()
    }, [location.pathname])
    return (
        <nav className="mobile-bottom-nav" aria-label="Основная навигация">
            <NavLink
                className={`mobile-bottom-nav__item${scheduleActive ? ' is-active' : ''}`}
                to="/"
                end
            >
                <i className="bi bi-calendar3 mobile-bottom-nav__icon" aria-hidden="true"></i>
                <span>Расписание</span>
            </NavLink>
            <NavLink className={`mobile-bottom-nav__item${settingsActive ? ' is-active' : ''}`}
                to="/settings"
                end
                >
                <i className="bi bi-sliders2 mobile-bottom-nav__icon" aria-hidden="true"></i>
                <span>Настройки</span>
            </NavLink>
        </nav>
    );
}

export default MobileBottomNav;
