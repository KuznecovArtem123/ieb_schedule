import { matchPath, useLocation } from 'react-router-dom';

const scheduleRoutes = ['/', '/edu/:category', '/schedule/:id', '/teacher/:id', '/teachers'];

export function useActiveSection() {
    const { pathname } = useLocation();

    return {
        scheduleActive: scheduleRoutes.some((route) => matchPath(route, pathname) !== null),
        settingsActive: matchPath('/settings', pathname) !== null,
    };
}
