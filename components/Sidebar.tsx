'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: 'fa-home' },
        { name: 'Bills & Payments', path: '/billing', icon: 'fa-file-invoice-dollar' },
        { name: 'Usage & History', path: '/usage', icon: 'fa-chart-line' },
    ];

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-20 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                {/* Utilyze Logo */}
                <Image src="/logo.png" alt="Utilyze Logo" width={32} height={32} className="flex-shrink-0" />
                <span className="text-xl font-bold text-slate-900 tracking-tight">utilyze.</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`nav-item w-full text-left px-6 py-4 transition-colors flex items-center space-x-3 ${isActive ? 'active' : ''
                                        }`}
                                >
                                    <i className={`fas ${item.icon} w-5`}></i>
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile Snippet */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold">
                            JD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">John Doe</p>
                            <p className="text-xs text-slate-500">Cleveland, OH</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded transition-colors flex items-center"
                >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                </button>
            </div>
        </aside>
    );
}
