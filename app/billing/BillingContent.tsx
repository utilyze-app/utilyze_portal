'use client';

import { useState } from 'react';
import PaymentModal from '@/components/PaymentModal';

export default function BillingContent() {
    const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid');
    const [auditVisible, setAuditVisible] = useState(false);
    const [auditText, setAuditText] = useState('');
    const [auditLoading, setAuditLoading] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const handleAuditBill = async () => {
        setAuditVisible(true);
        setAuditLoading(true);

        // Simulate AI call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const audit =
            "<strong>Bill Audit:</strong> Good news! Your $84.20 USD gas bill is significantly lower than typical winter bills ($145+) because Cleveland is warming up. The cost breakdown is roughly $30 supply charge + $54 usage charge. Keep it up! 👍";

        setAuditText(audit);
        setAuditLoading(false);
    };

    const handlePayBill = () => {
        setPaymentModalOpen(true);
    };

    return (
        <>
            <div className="fade-in space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">Bills & Payments</h1>

                {/* Tab Switcher for Billing */}
                <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('unpaid')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'unpaid'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        Current & Due
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        History
                    </button>
                </div>

                {/* UNPAID BILLS SECTION */}
                {activeTab === 'unpaid' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-start space-x-4">
                                <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                                    <i className="fas fa-file-invoice-dollar text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">
                                        Gas Bill - Sep 2025
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Issued: 09/15/2025 • Due: 10/15/2025
                                    </p>
                                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                                        Due Soon
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-slate-900">$84.20</p>
                                <div className="mt-2 flex space-x-2">
                                    <button
                                        onClick={handleAuditBill}
                                        className="px-4 py-2 bg-yellow-400 text-black border border-yellow-500 rounded-lg text-sm hover:bg-yellow-500 shadow-sm flex items-center transition-colors"
                                    >
                                        <span className="mr-1">✨</span> Explain Bill
                                    </button>
                                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                                        View PDF
                                    </button>
                                    <button
                                        onClick={handlePayBill}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-black shadow-sm"
                                    >
                                        Pay Bill
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* AI Bill Explanation Area */}
                        {auditVisible && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-slate-800 relative">
                                <button
                                    onClick={() => setAuditVisible(false)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                                <div className="ai-content">
                                    {auditLoading ? (
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    ) : (
                                        <div dangerouslySetInnerHTML={{ __html: auditText }} />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <i className="fas fa-check-circle text-green-500 text-xl"></i>
                                <div>
                                    <p className="font-bold text-slate-800">
                                        Water Account is up to date
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Your next water bill will be issued on 28 Dec 2025.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTORY SECTION */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Service</th>
                                    <th className="p-4 font-semibold">Description</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                    <th className="p-4 font-semibold text-center">PDF</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4">09/28/2025</td>
                                    <td className="p-4">
                                        <span className="text-blue-600 font-medium">
                                            <i className="fas fa-tint mr-1"></i> Water
                                        </span>
                                    </td>
                                    <td className="p-4">Payment Received</td>
                                    <td className="p-4 text-right text-green-600">-$112.50</td>
                                    <td className="p-4 text-center">-</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4">09/15/2025</td>
                                    <td className="p-4">
                                        <span className="text-orange-600 font-medium">
                                            <i className="fas fa-fire mr-1"></i> Gas
                                        </span>
                                    </td>
                                    <td className="p-4">Quarterly Bill (Jul-Sep)</td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        $84.20
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:underline">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4">06/15/2025</td>
                                    <td className="p-4">
                                        <span className="text-orange-600 font-medium">
                                            <i className="fas fa-fire mr-1"></i> Gas
                                        </span>
                                    </td>
                                    <td className="p-4">Quarterly Bill (Apr-Jun)</td>
                                    <td className="p-4 text-right font-bold text-slate-800">
                                        $145.50
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="text-blue-600 hover:underline">
                                            <i className="fas fa-download"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                billId="gas-bill-1"
                billAmount={84.2}
                billType="Gas"
            />
        </>
    );
}
