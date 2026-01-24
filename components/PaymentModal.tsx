'use client';

import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { createLinkToken, exchangePublicToken, initiatePayment } from '@/app/actions/finance';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    billId: string;
    billAmount: number;
    billType: string;
    onPaymentSuccess?: () => void;
}

type PaymentStage = 'idle' | 'checking' | 'converting' | 'settled' | 'error';

export default function PaymentModal({
    isOpen,
    onClose,
    billId,
    billAmount,
    billType,
    onPaymentSuccess,
}: PaymentModalProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [connectedBank, setConnectedBank] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentStage, setPaymentStage] = useState<PaymentStage>('idle');
    const [txHash, setTxHash] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Load link token on mount
    useEffect(() => {
        if (isOpen && !linkToken) {
            loadLinkToken();
        }
    }, [isOpen]);

    const loadLinkToken = async () => {
        const result = await createLinkToken();
        if (result.success && result.linkToken) {
            setLinkToken(result.linkToken);
        }
    };

    const { open: openPlaidLink, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: async (publicToken, metadata) => {
            console.log('Plaid success:', metadata);
            const result = await exchangePublicToken(publicToken);
            if (result.success) {
                setConnectedBank({
                    institutionName: metadata.institution?.name || 'Bank',
                    accountName: metadata.account?.name || 'Account',
                    accountMask: metadata.account?.mask || '****',
                });
                setPaymentMethod('plaid-connected');
                alert(`✅ Successfully connected ${metadata.institution?.name}!`);
            }
        },
    });

    const handleConnectBank = () => {
        if (ready) {
            openPlaidLink();
        } else {
            alert('Plaid Link is not ready yet. Please try again.');
        }
    };

    const handleDisconnectBank = () => {
        if (confirm('Are you sure you want to remove this bank account?')) {
            setConnectedBank(null);
            setPaymentMethod('');
        }
    };

    const handleConfirmPayment = async () => {
        if (!paymentMethod && !connectedBank) {
            alert('Please select a payment method or connect a bank account.');
            return;
        }

        setPaymentStage('checking');

        try {
            // Stage 1: Checking Balance (handled by server)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setPaymentStage('converting');

            // Call the server action
            const result = await initiatePayment(billId);

            if (!result.success) {
                setPaymentStage('error');
                setErrorMessage(result.error || 'Payment failed');
                return;
            }

            // Stage 3: Settled
            setPaymentStage('settled');
            setTxHash(result.transaction?.cryptoTxHash || '');

            // Wait a bit before closing
            setTimeout(() => {
                if (onPaymentSuccess) {
                    onPaymentSuccess();
                }
                onClose();
                resetModal();
            }, 3000);
        } catch (error: any) {
            setPaymentStage('error');
            setErrorMessage(error.message || 'Payment failed');
        }
    };

    const resetModal = () => {
        setPaymentStage('idle');
        setTxHash('');
        setErrorMessage('');
        setPaymentMethod('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-up">
                {/* Payment Stage Indicator */}
                {paymentStage === 'checking' && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mb-4"></div>
                        <h3 className="text-xl font-bold text-slate-800">Checking Balance...</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Verifying your account has sufficient funds
                        </p>
                    </div>
                )}

                {paymentStage === 'converting' && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500 mb-4"></div>
                        <h3 className="text-xl font-bold text-slate-800">
                            Converting to Digital Asset...
                        </h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Processing your payment through our crypto settlement network
                        </p>
                    </div>
                )}

                {paymentStage === 'settled' && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                            <i className="fas fa-check text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Settled! ✨</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            Your payment has been processed successfully
                        </p>
                        {txHash && (
                            <div className="mt-4 bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
                                <p className="text-xs font-mono text-slate-700 break-all">
                                    {txHash}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {paymentStage === 'error' && (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                            <i className="fas fa-exclamation-triangle text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Payment Failed</h3>
                        <p className="text-sm text-slate-500 mt-2">{errorMessage}</p>
                        <button
                            onClick={handleClose}
                            className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-black"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Normal Payment Form */}
                {paymentStage === 'idle' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">
                                Pay {billType} Bill
                            </h3>
                            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100">
                            <p className="text-sm text-slate-500">Amount Due</p>
                            <p className="text-3xl font-bold text-slate-900">
                                ${billAmount.toFixed(2)}
                            </p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleConfirmPayment();
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Select payment method...</option>
                                        <option value="saved-1">Commonwealth Bank ...8821</option>
                                        <option value="saved-2">Credit Card ...4242</option>
                                        {connectedBank && (
                                            <option value="plaid-connected">
                                                🏦 {connectedBank.institutionName} ...
                                                {connectedBank.accountMask} (Plaid)
                                            </option>
                                        )}
                                    </select>
                                </div>

                                {/* Plaid Link Button */}
                                <div className="pt-2 border-t border-slate-200">
                                    {!connectedBank ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleConnectBank}
                                                className="w-full bg-blue-50 border-2 border-blue-200 text-blue-700 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                                            >
                                                <i className="fas fa-university mr-2"></i>
                                                Connect Bank Account with Plaid
                                            </button>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                Secure bank connection powered by Plaid
                                            </p>
                                        </>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <i className="fas fa-check-circle text-green-600 mr-2"></i>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {connectedBank.institutionName}
                                                        </p>
                                                        <p className="text-xs text-slate-600">
                                                            {connectedBank.accountName} ending in{' '}
                                                            {connectedBank.accountMask}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleDisconnectBank}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                Confirm Payment
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
