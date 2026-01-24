import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import AIChat from '@/components/AIChat';
import UsageContent from './UsageContent';

export default function UsagePage() {
    return (
        <div className="bg-slate-50 text-slate-800 h-screen flex overflow-hidden">
            <Sidebar />
            <MobileHeader />

            <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0 transition-all bg-slate-50/50">
                <UsageContent />
            </main>

            <AIChat />
        </div>
    );
}
