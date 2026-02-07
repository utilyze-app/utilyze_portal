import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const bills = await prisma.bill.findMany({
            include: {
                account: {
                    include: {
                        user: {
                            select: {
                                email: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        const accounts = await prisma.account.findMany({
            select: {
                id: true,
                userId: true,
                type: true,
                plaidAccessToken: true,
            },
        });

        return NextResponse.json({
            bills: bills.map((b) => ({
                id: b.id,
                amount: b.amount,
                status: b.status,
                description: b.description,
                accountId: b.accountId,
                userEmail: b.account.user.email,
            })),
            users,
            accounts: accounts.map((a) => ({
                id: a.id,
                userId: a.userId,
                type: a.type,
                hasPlaid: !!a.plaidAccessToken,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
