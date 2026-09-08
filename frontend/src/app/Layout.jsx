import { Outlet } from 'react-router-dom';
import Header from '../widgets/Header';
import Scroll from '../shared/ui/Scroll';
import MobileBottomNav from '../widgets/MobileBottomNav';


export default function Layout() {
    return (
        <div className='flex flex-col '>
            <Header></Header>
            <Outlet />
            <Scroll></Scroll>
            <MobileBottomNav />
        </div>
    );
}