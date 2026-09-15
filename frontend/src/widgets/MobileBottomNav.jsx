import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {Gear, Calendar} from '@gravity-ui/icons';

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
        <nav className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-10 grid grid-cols-2 gap-1.5 rounded-[22px] bg-white/95 p-[3px_3px_4px] shadow-[0_10px_30px_rgba(33,62,103,0.16)] backdrop-blur" aria-label="Основная навигация">
            <NavLink
                className={`grid  place-items-center rounded-[13px] text-[0.72rem] font-bold no-underline transition ${scheduleActive ? 'bg-[#e9f3fd] text-[#2B60A5]' : 'text-[#9aaac2]'}`}
                to="/"
                end
            >
                <Calendar></Calendar>
                <span>Расписание</span>
            </NavLink>
            <NavLink className={`grid min-h-[54px] place-items-center  rounded-[13px] text-[0.72rem] font-bold no-underline transition ${settingsActive ? 'bg-[#e9f3fd] text-[#2B60A5]' : 'text-[#9aaac2]'}`}
                to="/settings"
                end
                >
                <Gear></Gear>
                <span>Настройки</span>
            </NavLink>
        </nav>
    );
}

export default MobileBottomNav;
