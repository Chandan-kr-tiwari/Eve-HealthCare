const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // -------------------------
    // 1. Users
    // -------------------------

    const password = await bcrypt.hash('Password@123', 10);

    const user1 = await prisma.user.upsert({
        where: {
            email: 'REDACTED@example.com'
        },
        update: {},
        create: {
            name: 'Chandan Tiwari',
            email: 'REDACTED@example.com',
            password
        }
    });

    const user2 = await prisma.user.upsert({
        where: {
            email: 'kundan@example.com'
        },
        update: {},
        create: {
            name: 'Kundan Tiwari',
            email: 'kundan@example.com',
            password
        }
    });

    // -------------------------
    // 2. Centres
    // -------------------------

    const centre1 = await prisma.centre.upsert({
        where: {
            name_location: {
                name: 'Apollo Diagnostics',
                location: 'Lucknow'
            }
        },
        update: {},
        create: {
            name: 'Apollo Diagnostics',
            location: 'Lucknow'
        }
    });

    const centre2 = await prisma.centre.upsert({
        where: {
            name_location: {
                name: 'Dr Lal PathLabs',
                location: 'Delhi'
            }
        },
        update: {},
        create: {
            name: 'Dr Lal PathLabs',
            location: 'Delhi'
        }
    });

    const centre3 = await prisma.centre.upsert({
        where: {
            name_location: {
                name: 'Metropolis Healthcare',
                location: 'Mumbai'
            }
        },
        update: {},
        create: {
            name: 'Metropolis Healthcare',
            location: 'Mumbai'
        }
    });

    // -------------------------
    // 3. Tests
    // -------------------------

    const tests = [
        {
            name: 'Complete Blood Count',
            price: 500,
            centreId: centre1.id
        },
        {
            name: 'Lipid Profile',
            price: 800,
            centreId: centre1.id
        },
        {
            name: 'Thyroid Profile',
            price: 700,
            centreId: centre1.id
        },
        {
            name: 'Liver Function Test',
            price: 900,
            centreId: centre2.id
        },
        {
            name: 'Kidney Function Test',
            price: 850,
            centreId: centre2.id
        },
        {
            name: 'Blood Glucose Test',
            price: 300,
            centreId: centre3.id
        },
        {
            name: 'Vitamin D Test',
            price: 1200,
            centreId: centre3.id
        }
    ];

    for (const test of tests) {
        const existingTest = await prisma.test.findFirst({
            where: {
                name: test.name,
                centreId: test.centreId
            }
        });

        if (!existingTest) {
            await prisma.test.create({
                data: test
            });
        }
    }

    console.log('Seed completed successfully.');

    console.log({
        users: [user1.email, user2.email],
        centres: [
            centre1.name,
            centre2.name,
            centre3.name
        ]
    });
}

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });