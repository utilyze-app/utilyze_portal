'use client';

import { useState, useEffect, useCallback } from 'react';
import PaymentModal from '@/components/PaymentModal';
import { getBillingData, getPaymentHistory } from '@/app/actions/finance';

interface UnpaidBill {
    id: string;
    accountId: string;
    accountType: string;
    amount: number;
    status: string;
    description: string;
    issuedDate: string | null;
    dueDate: string;
}

interface ConnectedBank {
    accountId: string | null;
    bankName: string;
    mask: string;
}

interface HistoryItem {
    id: string;
    date: string;
    serviceType: string;
    description: string;
    amount: number;
    type: 'payment' | 'bill';
    paymentMethod?: string;
    status: string;
}

export default function BillingContent() {
    const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid');
    const [auditVisible, setAuditVisible] = useState(false);
    const [auditText, setAuditText] = useState('');
    const [auditLoading, setAuditLoading] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<UnpaidBill | null>(null);

    // Data states
    const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([]);
    const [connectedBank, setConnectedBank] = useState<ConnectedBank | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBillingData = useCallback(async () => {
        setLoading(true);
        const result = await getBillingData();
        if (result.success && result.data) {
            setUnpaidBills(result.data.unpaidBills);
            setConnectedBank(result.data.connectedBank);
        }
        setLoading(false);
    }, []);

    const fetchHistory = useCallback(async () => {
        const result = await getPaymentHistory();
        if (result.success && result.data) {
            setHistory(result.data.history);
        }
    }, []);

    useEffect(() => {
        fetchBillingData();
        fetchHistory();
    }, [fetchBillingData, fetchHistory]);

    const handleAuditBill = async (bill: UnpaidBill) => {
        setAuditVisible(true);
        setAuditLoading(true);

        // Simulate AI call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const audit =
            `<strong>Bill Audit:</strong> Good news! Your $${bill.amount.toFixed(2)} USD ${bill.accountType.toLowerCase()} bill is significantly lower than typical winter bills ($145+) because Cleveland is warming up. The cost breakdown is roughly $30 supply charge + $${(bill.amount - 30).toFixed(2)} usage charge. Keep it up! 👍`;

        setAuditText(audit);
        setAuditLoading(false);
    };

    const handlePayBill = (bill: UnpaidBill) => {
        setSelectedBill(bill);
        setPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        // Refresh billing data after successful payment
        fetchBillingData();
        fetchHistory();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const getDueBadge = (dueDate: string) => {
        const due = new Date(dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
            return <div className="mt-2 inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">Overdue</div>;
        } else if (daysUntilDue <= 7) {
            return <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">Due Soon</div>;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="fade-in space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">Bills & Payments</h1>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-900"></div>
                </div>
            </div>
        );
    }

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
                        {unpaidBills.length === 0 ? (
                            <div className="bg-green-50 border border-green-100 p-6 rounded-lg text-center">
                                <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                                <p className="font-bold text-slate-800">All bills are paid!</p>
                                <p className="text-sm text-slate-600">You have no outstanding bills at this time.</p>
                            </div>
                        ) : (
                            unpaidBills.map((bill) => (
                                <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-start space-x-4">
                                        <div className={`${bill.accountType === 'GAS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} p-3 rounded-xl`}>
                                            <i className={`fas ${bill.accountType === 'GAS' ? 'fa-fire' : 'fa-tint'} text-xl`}></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">
                                                {bill.description}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {bill.issuedDate ? `Issued: ${formatDate(bill.issuedDate)} • ` : ''}Due: {formatDate(bill.dueDate)}
                                            </p>
                                            {getDueBadge(bill.dueDate)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-slate-900">${bill.amount.toFixed(2)}</p>
                                        <div className="mt-2 flex space-x-2">
                                            <button
                                                onClick={() => handleAuditBill(bill)}
                                                className="px-4 py-2 bg-yellow-400 text-black border border-yellow-500 rounded-lg text-sm hover:bg-yellow-500 shadow-sm flex items-center transition-colors"
                                            >
                                                <span className="mr-1">✨</span> Explain Bill
                                            </button>
                                            <button
                                                className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                                                title="PDF download coming soon"
                                                disabled
                                            >
                                                View PDF
                                            </button>
                                            <button
                                                onClick={() => handlePayBill(bill)}
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-black shadow-sm"
                                            >
                                                Pay Bill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

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
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <i className="fas fa-history text-3xl mb-2"></i>
                                <p>No payment history yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold">Date</th>
                                        <th className="p-4 font-semibold">Service</th>
                                        <th className="p-4 font-semibold">Description</th>
                                        <th className="p-4 font-semibold">Payment Method</th>
                                        <th className="p-4 font-semibold text-right">Amount</th>
                                        <th className="p-4 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50">
                                            <td className="p-4">{formatDate(item.date)}</td>
                                            <td className="p-4">
                                                <span className={`${item.serviceType === 'GAS' ? 'text-orange-600' : 'text-blue-600'} font-medium`}>
                                                    <i className={`fas ${item.serviceType === 'GAS' ? 'fa-fire' : 'fa-tint'} mr-1`}></i>
                                                    {item.serviceType === 'GAS' ? 'Gas' : 'Water'}
                                                </span>
                                            </td>
                                            <td className="p-4">{item.description}</td>
                                            <td className="p-4">
                                                {item.type === 'payment' ? (
                                                    <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                                        <i className="fas fa-university mr-1"></i>
                                                        {item.paymentMethod === 'PLAID_BANK' ? 'Bank (Plaid)' :
                                                            item.paymentMethod === 'CARD' ? 'Card' : 'Bank'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className={`p-4 text-right font-bold ${item.type === 'payment' ? 'text-green-600' : 'text-slate-800'}`}>
                                                {item.type === 'payment' ? '-' : ''}${item.amount.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.type === 'payment' ? (
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${item.status === 'CRYPTO_SETTLED' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'INITIATED' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {item.status === 'CRYPTO_SETTLED' ? 'Settled' :
                                                            item.status === 'INITIATED' ? 'Pending' : item.status}
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${item.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                        item.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {selectedBill && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedBill(null);
                    }}
                    billId={selectedBill.id}
                    billAmount={selectedBill.amount}
                    billType={selectedBill.accountType === 'GAS' ? 'Gas' : 'Water'}
                    connectedBank={connectedBank}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </>
    );
}
