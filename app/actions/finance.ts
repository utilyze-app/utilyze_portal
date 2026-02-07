'use server';

import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Initialize Plaid Client
const plaidConfig = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
            'PLAID-SECRET': process.env.PLAID_SECRET!,
        },
    },
});

const plaidClient = new PlaidApi(plaidConfig);

/**
 * Create a Plaid Link Token for the frontend
 * This token is used to initialize the Plaid Link UI
 */
export async function createLinkToken() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized',
            };
        }

        const response = await plaidClient.linkTokenCreate({
            user: {
                client_user_id: session.user.id,
            },
            client_name: 'Utilyze Payment Portal',
            products: [Products.Auth, Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
        });

        return {
            success: true,
            linkToken: response.data.link_token,
        };
    } catch (error: any) {
        console.error('Error creating link token:', error);
        return {
            success: false,
            error: error.message || 'Failed to create link token',
        };
    }
}

/**
 * Exchange the public token from Plaid Link for an access token
 * Store the access token in the user's Account
 */
export async function exchangePublicToken(publicToken: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized',
            };
        }

        // Exchange public token for access token
        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // Get account information
        const authResponse = await plaidClient.authGet({
            access_token: accessToken,
        });

        const accounts = authResponse.data.accounts;
        const bankName = authResponse.data.item.institution_id || 'Unknown Bank';

        // Find the user's first account (or you can let them choose which account to link)
        const userAccount = await prisma.account.findFirst({
            where: { userId: session.user.id },
        });

        if (!userAccount) {
            return {
                success: false,
                error: 'No account found for user',
            };
        }

        // Get the first bank account from Plaid
        const plaidBankAccount = accounts[0];
        const plaidAccountId = plaidBankAccount?.account_id || null;

        // Update the account with Plaid credentials
        await prisma.account.update({
            where: { id: userAccount.id },
            data: {
                plaidAccessToken: accessToken,
                plaidItemId: itemId,
                plaidAccountId: plaidAccountId,
                bankName: bankName,
            },
        });

        return {
            success: true,
            message: 'Bank account connected successfully',
            accountId: userAccount.id,
            bankAccount: {
                accountId: plaidAccountId,
                mask: plaidBankAccount?.mask || '****',
                name: plaidBankAccount?.name || 'Checking',
                institutionName: bankName,
            },
        };
    } catch (error: any) {
        console.error('Error exchanging public token:', error);
        return {
            success: false,
            error: error.message || 'Failed to exchange token',
        };
    }
}

/**
 * Initiate a payment for a bill
 * Steps:
 * A. Check real-time balance using Plaid
 * B. Guard against insufficient funds
 * C. Mock crypto on-ramp (3-second delay)
 * D. Update bill status and create payment transaction
 */
export async function initiatePayment(billId: string, paymentMethod: string = 'PLAID_BANK') {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: 'Unauthorized',
        };
    }
    const userId = session.user.id;
    try {
        // Fetch the bill
        const bill = await prisma.bill.findUnique({
            where: { id: billId },
            include: {
                account: true,
            },
        });

        if (!bill) {
            return {
                success: false,
                error: 'Bill not found',
            };
        }

        // Verify the bill belongs to the user
        if (bill.account.userId !== userId) {
            return {
                success: false,
                error: 'Unauthorized access to bill',
            };
        }

        // Check if bill is already paid
        if (bill.status === 'PAID') {
            return {
                success: false,
                error: 'Bill has already been paid',
            };
        }

        // STEP A: Check real-time balance using Plaid
        const plaidAccessToken = bill.account.plaidAccessToken;

        if (!plaidAccessToken) {
            return {
                success: false,
                error: 'No bank account connected. Please connect a bank account first.',
            };
        }

        let availableBalance = 0;

        try {
            const balanceResponse = await plaidClient.accountsBalanceGet({
                access_token: plaidAccessToken,
            });

            // Get the first account's available balance
            const primaryAccount = balanceResponse.data.accounts[0];
            availableBalance = primaryAccount.balances.available || 0;
        } catch (plaidError: any) {
            console.error('Error fetching balance from Plaid:', plaidError);
            return {
                success: false,
                error: 'Failed to fetch account balance',
            };
        }

        // STEP B: Guard against insufficient funds
        if (availableBalance < bill.amount) {
            return {
                success: false,
                error: 'Insufficient Funds',
                details: {
                    required: bill.amount,
                    available: availableBalance,
                },
            };
        }

        // Update bill status to PENDING_SETTLEMENT
        await prisma.bill.update({
            where: { id: billId },
            data: { status: 'PENDING_SETTLEMENT' },
        });

        // STEP C: Mock Crypto On-Ramp -> USDC -> Off-Ramp (3-second delay)
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Generate mock crypto transaction hash
        const mockCryptoTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;

        // STEP D: Update bill status to PAID and create payment transaction
        const [updatedBill, paymentTransaction] = await prisma.$transaction([
            prisma.bill.update({
                where: { id: billId },
                data: { status: 'PAID' },
            }),
            prisma.paymentTransaction.create({
                data: {
                    billId: billId,
                    cryptoTxHash: mockCryptoTxHash,
                    status: 'CRYPTO_SETTLED',
                    paymentMethod: paymentMethod,
                    amount: bill.amount,
                },
            }),
        ]);

        return {
            success: true,
            message: 'Payment completed successfully',
            transaction: {
                id: paymentTransaction.id,
                cryptoTxHash: mockCryptoTxHash,
                amount: bill.amount,
                billId: billId,
            },
        };
    } catch (error: any) {
        console.error('Error initiating payment:', error);
        return {
            success: false,
            error: error.message || 'Payment failed',
        };
    }
}

/**
 * Get dashboard data for a user
 * Returns accounts, total balance due, and recent usage history
 */
export async function getDashboardData() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: 'Unauthorized',
        };
    }
    const userId = session.user.id;
    try {
        // Fetch all accounts for the user
        const accounts = await prisma.account.findMany({
            where: { userId },
            include: {
                bills: {
                    where: {
                        status: {
                            in: ['UNPAID', 'PENDING_SETTLEMENT'],
                        },
                    },
                    orderBy: {
                        dueDate: 'asc',
                    },
                },
                usageLogs: {
                    orderBy: {
                        date: 'desc',
                    },
                    take: 30, // Last 30 days of usage
                },
            },
        });

        // Calculate total balance due
        const totalBalanceDue = accounts.reduce((total, account) => {
            const accountBalance = account.bills.reduce((sum, bill) => sum + bill.amount, 0);
            return total + accountBalance;
        }, 0);

        // Get recent usage history across all accounts
        const recentUsage = accounts.flatMap((account) =>
            account.usageLogs.map((log) => ({
                accountId: account.id,
                accountType: account.type,
                date: log.date,
                value: log.value,
                unit: log.unit,
            }))
        );

        // Sort by date descending
        recentUsage.sort((a, b) => b.date.getTime() - a.date.getTime());

        return {
            success: true,
            data: {
                accounts: accounts.map((account) => ({
                    id: account.id,
                    type: account.type,
                    meterNumber: account.meterNumber,
                    address: account.address,
                    bankConnected: !!account.plaidAccessToken,
                    bankName: account.bankName,
                    unpaidBills: account.bills.length,
                    totalDue: account.bills.reduce((sum, bill) => sum + bill.amount, 0),
                    firstUnpaidBillId: account.bills[0]?.id || null,
                })),
                totalBalanceDue,
                recentUsage: recentUsage.slice(0, 30), // Limit to 30 most recent
            },
        };
    } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch dashboard data',
        };
    }
}

/**
 * Get billing data for the billing page
 * Returns unpaid bills and connected bank account info
 */
export async function getBillingData() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: 'Unauthorized',
        };
    }
    const userId = session.user.id;

    try {
        // Fetch all accounts for the user with unpaid bills
        const accounts = await prisma.account.findMany({
            where: { userId },
            include: {
                bills: {
                    where: {
                        status: {
                            in: ['UNPAID', 'PENDING_SETTLEMENT'],
                        },
                    },
                    orderBy: {
                        dueDate: 'asc',
                    },
                },
            },
        });

        // Get the connected bank info from the first account with Plaid
        const connectedAccount = accounts.find(a => a.plaidAccessToken);
        const connectedBank = connectedAccount ? {
            accountId: connectedAccount.plaidAccountId,
            bankName: connectedAccount.bankName || 'Connected Bank',
            mask: connectedAccount.plaidAccountId?.slice(-4) || '****',
        } : null;

        // Flatten all unpaid bills
        const unpaidBills = accounts.flatMap(account =>
            account.bills.map(bill => ({
                id: bill.id,
                accountId: account.id,
                accountType: account.type,
                amount: bill.amount,
                status: bill.status,
                description: bill.description || `${account.type} Bill`,
                issuedDate: bill.issuedDate?.toISOString() || null,
                dueDate: bill.dueDate.toISOString(),
            }))
        );

        return {
            success: true,
            data: {
                unpaidBills,
                connectedBank,
            },
        };
    } catch (error: any) {
        console.error('Error fetching billing data:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch billing data',
        };
    }
}

/**
 * Get payment history for the billing page History tab
 * Returns all payment transactions and paid bills
 */
export async function getPaymentHistory() {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: 'Unauthorized',
        };
    }
    const userId = session.user.id;

    try {
        // Fetch all accounts for the user
        const accounts = await prisma.account.findMany({
            where: { userId },
            include: {
                bills: {
                    include: {
                        transactions: true,
                    },
                    orderBy: {
                        dueDate: 'desc',
                    },
                },
            },
        });

        // Build payment history from all bills and transactions
        const history: Array<{
            id: string;
            date: string;
            serviceType: string;
            description: string;
            amount: number;
            type: 'payment' | 'bill';
            paymentMethod?: string;
            status: string;
        }> = [];

        for (const account of accounts) {
            for (const bill of account.bills) {
                // Add the bill itself
                history.push({
                    id: bill.id,
                    date: bill.issuedDate?.toISOString() || bill.dueDate.toISOString(),
                    serviceType: account.type,
                    description: bill.description || `${account.type} Bill`,
                    amount: bill.amount,
                    type: 'bill',
                    status: bill.status,
                });

                // Add payment transactions for this bill
                for (const tx of bill.transactions) {
                    history.push({
                        id: tx.id,
                        date: tx.createdAt.toISOString(),
                        serviceType: account.type,
                        description: 'Payment Received',
                        amount: tx.amount || bill.amount,
                        type: 'payment',
                        paymentMethod: tx.paymentMethod || 'UNKNOWN',
                        status: tx.status,
                    });
                }
            }
        }

        // Sort by date descending
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            success: true,
            data: {
                history,
            },
        };
    } catch (error: any) {
        console.error('Error fetching payment history:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch payment history',
        };
    }
}
