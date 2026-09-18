import { Outlet } from 'react-router-dom';
import Header from '@/widgets/Header';
import Scroll from '@/shared/ui/Scroll';
import MobileBottomNav from '@/widgets/MobileBottomNav';

export default function Layout() {
    return (
        <div className="mx-auto min-h-screen w-full max-w-[375px] overflow-hidden rounded-[29px] bg-white/90 px-[10px] pb-[13px] shadow-[0_18px_55px_rgba(69,111,167,0.1)]">
            <Header></Header>
            <main className="page-content">
                <Outlet />
            </main>
            <Scroll></Scroll>
            <MobileBottomNav />
        </div>
    );
}