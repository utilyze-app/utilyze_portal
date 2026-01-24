'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 flex justify-between items-center p-4">
                <div className="flex items-center space-x-2">
                    <Image src="/logo.png" alt="Utilyze Logo" width={32} height={32} />
                    <span className="text-lg font-bold text-slate-900">utilyze.</span>
                </div>
                <button onClick={toggleMobileMenu} className="text-slate-600 focus:outline-none">
                    <i className="fas fa-bars text-xl"></i>
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40"
                    onClick={toggleMobileMenu}
                >
                    <div
                        className="bg-white w-64 h-full shadow-lg p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex justify-between items-center">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={toggleMobileMenu} className="text-slate-500">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="w-full text-left px-4 py-3 rounded hover:bg-slate-100 block"
                                    onClick={toggleMobileMenu}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/billing"
                                    className="w-full text-left px-4 py-3 rounded hover:bg-slate-100 block"
                                    onClick={toggleMobileMenu}
                                >
                                    Bills & Payments
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/usage"
                                    className="w-full text-left px-4 py-3 rounded hover:bg-slate-100 block"
                                    onClick={toggleMobileMenu}
                                >
                                    Usage
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}
