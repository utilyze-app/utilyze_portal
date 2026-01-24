import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create test users with hashed passwords
    const johnPassword = await bcrypt.hash('password123', 10);
    const janePassword = await bcrypt.hash('password123', 10);

    const john = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            name: 'John Doe',
            passwordHash: johnPassword,
        },
    });

    const jane = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            name: 'Jane Smith',
            passwordHash: janePassword,
        },
    });

    console.log('✅ Created users:', { john: john.email, jane: jane.email });

    // Create accounts for John
    const johnGasAccount = await prisma.account.upsert({
        where: { id: 'john-gas-account' },
        update: {},
        create: {
            id: 'john-gas-account',
            userId: john.id,
            type: 'GAS',
            meterNumber: '5241 8890 12',
            address: '123 Superior Avenue, Cleveland, OH 44114',
        },
    });

    const johnWaterAccount = await prisma.account.upsert({
        where: { id: 'john-water-account' },
        update: {},
        create: {
            id: 'john-water-account',
            userId: john.id,
            type: 'WATER',
            meterNumber: '9982-A44',
            address: '123 Superior Avenue, Cleveland, OH 44114',
        },
    });

    // Create accounts for Jane
    const janeGasAccount = await prisma.account.upsert({
        where: { id: 'jane-gas-account' },
        update: {},
        create: {
            id: 'jane-gas-account',
            userId: jane.id,
            type: 'GAS',
            meterNumber: '6542 9901 34',
            address: '456 Euclid Avenue, Cleveland, OH 44115',
        },
    });

    const janeWaterAccount = await prisma.account.upsert({
        where: { id: 'jane-water-account' },
        update: {},
        create: {
            id: 'jane-water-account',
            userId: jane.id,
            type: 'WATER',
            meterNumber: '7734-B55',
            address: '456 Euclid Avenue, Cleveland, OH 44115',
        },
    });

    console.log('✅ Created accounts');

    // Create bills for John
    await prisma.bill.upsert({
        where: { id: 'john-gas-bill-1' },
        update: {},
        create: {
            id: 'john-gas-bill-1',
            accountId: johnGasAccount.id,
            amount: 84.20,
            status: 'UNPAID',
            dueDate: new Date('2025-10-15'),
        },
    });

    await prisma.bill.upsert({
        where: { id: 'john-water-bill-1' },
        update: {},
        create: {
            id: 'john-water-bill-1',
            accountId: johnWaterAccount.id,
            amount: 112.50,
            status: 'PAID',
            dueDate: new Date('2025-09-28'),
        },
    });

    // Create bills for Jane
    await prisma.bill.upsert({
        where: { id: 'jane-gas-bill-1' },
        update: {},
        create: {
            id: 'jane-gas-bill-1',
            accountId: janeGasAccount.id,
            amount: 145.50,
            status: 'UNPAID',
            dueDate: new Date('2025-10-20'),
        },
    });

    await prisma.bill.upsert({
        where: { id: 'jane-water-bill-1' },
        update: {},
        create: {
            id: 'jane-water-bill-1',
            accountId: janeWaterAccount.id,
            amount: 98.75,
            status: 'UNPAID',
            dueDate: new Date('2025-10-25'),
        },
    });

    console.log('✅ Created bills');

    // Create usage logs for John's gas account
    const startDate = new Date('2025-05-01');
    const months = 6;
    const gasUsage = [1200, 1800, 2200, 2100, 1500, 900]; // MJ

    for (let i = 0; i < months; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);

        await prisma.usageLog.create({
            data: {
                accountId: johnGasAccount.id,
                date: date,
                value: gasUsage[i],
                unit: 'MJ',
            },
        });
    }

    const waterUsage = [15, 14, 13, 14, 16, 18]; // kL
    for (let i = 0; i < months; i++) {
        const date = new Date(startDate);
        date.setMonth(startDate.getMonth() + i);

        await prisma.usageLog.create({
            data: {
                accountId: johnWaterAccount.id,
                date: date,
                value: waterUsage[i],
                unit: 'kL',
            },
        });
    }

    console.log('✅ Created usage logs');
    console.log('');
    console.log('🎉 Database seed completed successfully!');
    console.log('');
    console.log('📧 Test Accounts:');
    console.log('   john@example.com / password123');
    console.log('   jane@example.com / password123');
    console.log('');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error seeding database:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
