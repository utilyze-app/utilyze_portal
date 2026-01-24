'use client';

import { useState, useEffect } from 'react';
import { getDashboardData } from '@/app/actions/finance';
import { getCurrentUser } from '@/app/actions/auth';
import PaymentModal from '@/components/PaymentModal';

export default function DashboardContent() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [insightVisible, setInsightVisible] = useState(false);
    const [insightText, setInsightText] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [user, data] = await Promise.all([
            getCurrentUser(),
            getDashboardData()
        ]);
        setCurrentUser(user);
        if (data.success) {
            setDashboardData(data.data);
        }
        setLoading(false);
    };

    const handlePayBill = (accountType: string, billAmount: number, billId: string) => {
        setSelectedBill({ type: accountType, amount: billAmount, id: billId });
        setPaymentModalOpen(true);
    };

    const getSmartInsight = async () => {
        setInsightVisible(true);
        setInsightLoading(true);

        // Simulate AI call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const insight =
            "Great news! Your gas usage is dropping as Cleveland warms up. You're tracking 40% lower than winter - that's some serious savings heading into summer! 🌞";

        setInsightText(insight);
        setInsightLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mb-4"></div>
                    <p className="text-slate-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Mock data fallback if no real data
    const gasAccount = dashboardData?.accounts?.find((a: any) => a.type === 'GAS') || {
        type: 'GAS',
        meterNumber: '5241 8890 12',
        totalDue: 84.2,
        unpaidBills: 1,
    };

    const waterAccount = dashboardData?.accounts?.find((a: any) => a.type === 'WATER') || {
        type: 'WATER',
        meterNumber: '9982-A44',
        totalDue: 0,
        unpaidBills: 0,
    };

    return (
        <>
            <div className="fade-in space-y-6">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Welcome, {currentUser?.name || 'User'}</h1>
                        <p className="text-slate-500">Welcome to your Utilyze dashboard.</p>
                    </div>
                    <button
                        onClick={getSmartInsight}
                        className="mt-3 md:mt-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center"
                    >
                        <span className="mr-2">✨</span> Ask Utilyze Assistant
                    </button>
                </div>

                {/* Account Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* GAS ACCOUNT CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
                        <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center transition-colors group-hover:bg-orange-100">
                            <div className="flex items-center space-x-2">
                                <div className="bg-white p-2 rounded-lg text-orange-600 shadow-sm">
                                    <i className="fas fa-fire"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Natural Gas</h3>
                                    <p className="text-xs text-slate-500">
                                        MIRN: {gasAccount.meterNumber}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-1 rounded">
                                Next Bill: 15 Oct
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                                    <h2 className="text-3xl font-bold text-slate-900">
                                        ${gasAccount.totalDue.toFixed(2)}{' '}
                                        <span className="text-sm font-normal text-slate-500">
                                            USD
                                        </span>
                                    </h2>
                                </div>
                                <button
                                    onClick={() =>
                                        handlePayBill('gas', gasAccount.totalDue, 'gas-bill-1')
                                    }
                                    className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Pay Now
                                </button>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{ width: '45%' }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500 flex justify-between">
                                <span>45% into billing cycle</span>
                                <span>Ends 30 Oct</span>
                            </p>
                        </div>
                    </div>

                    {/* WATER ACCOUNT CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative group">
                        <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center transition-colors group-hover:bg-blue-100">
                            <div className="flex items-center space-x-2">
                                <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm">
                                    <i className="fas fa-tint"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Water Supply</h3>
                                    <p className="text-xs text-slate-500">
                                        Meter: {waterAccount.meterNumber}
                                    </p>
                                </div>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                                Paid
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                                    <h2 className="text-3xl font-bold text-green-600">
                                        ${waterAccount.totalDue.toFixed(2)}{' '}
                                        <span className="text-sm font-normal text-slate-500">
                                            USD
                                        </span>
                                    </h2>
                                </div>
                                <button className="bg-white border border-slate-300 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                                    Paid
                                </button>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                <i className="fas fa-check-circle text-green-500"></i>
                                <span>Last payment of $112.50 received on 28 Sep</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Analysis Section (AI) */}
                <div className="bg-black rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-bold flex items-center">
                                <span className="mr-2">✨</span> Utilyze Smart Insight
                            </h3>
                            <p className="text-gray-400 text-sm mt-1">
                                Based on your recent gas usage (MJ) and cooler weather forecast.
                            </p>
                        </div>
                        <button
                            onClick={getSmartInsight}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm transition-all backdrop-blur-sm"
                        >
                            Refresh Insights
                        </button>
                    </div>
                    {insightVisible && (
                        <div className="relative z-10 mt-4 text-sm bg-white/5 p-4 rounded-lg border border-white/10 ai-content">
                            {insightLoading ? (
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            ) : (
                                insightText
                            )}
                        </div>
                    )}
                    {/* Decor: Subtle Bolt Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full blur-3xl opacity-10 -mr-16 -mt-16"></div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-2 rounded-full text-green-600 w-8 h-8 flex items-center justify-center">
                                    <i className="fas fa-dollar-sign text-xs"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Payment Received - Water
                                    </p>
                                    <p className="text-xs text-slate-500">28 Sep 2025</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-green-600">-$112.50</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                            <div className="flex items-center space-x-3">
                                <div className="bg-orange-100 p-2 rounded-full text-orange-600 w-8 h-8 flex items-center justify-center">
                                    <i className="fas fa-file-invoice text-xs"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
                                        Bill Generated - Gas
                                    </p>
                                    <p className="text-xs text-slate-500">15 Sep 2025</p>
                                </div>
                            </div>
                            <span className="text-sm font-bold text-slate-800">$84.20</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedBill && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    billId={selectedBill.id}
                    billAmount={selectedBill.amount}
                    billType={selectedBill.type}
                    onPaymentSuccess={loadData}
                />
            )}
        </>
    );
}
