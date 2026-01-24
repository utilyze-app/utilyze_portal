import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import AIChat from '@/components/AIChat';
import DashboardContent from './DashboardContent';

export default function DashboardPage() {
    return (
        <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden">
            <Sidebar />
            <MobileHeader />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 transition-all bg-slate-50/50">
                <DashboardContent />
            </main>

            <AIChat />
        </div>
    );
}
