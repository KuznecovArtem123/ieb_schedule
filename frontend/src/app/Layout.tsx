import { Outlet } from 'react-router-dom';
import Header from '@/widgets/Header';
import Scroll from '@/shared/ui/Scroll';
import MobileBottomNav from '@/widgets/MobileBottomNav';

export default function Layout() {
    return (
        <div className="mx-auto min-h-screen w-full max-w-[375px] overflow-hidden rounded-[29px] bg-surface/90 px-[10px] pb-[13px] shadow-page md:max-w-[1180px] md:rounded-none md:px-8 md:pb-10 md:shadow-none">
            <Header></Header>
            <main className="page-content md:mx-auto md:w-full md:max-w-[1060px]">
                <Outlet />
            </main>
            <Scroll></Scroll>
            <MobileBottomNav />
        </div>
    );
}