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

// -------------------------
// 4. Bookings
// -------------------------

const completeBloodCount = await prisma.test.findFirst({
    where: {
        name: 'Complete Blood Count',
        centreId: centre1.id
    }
});

const lipidProfile = await prisma.test.findFirst({
    where: {
        name: 'Lipid Profile',
        centreId: centre1.id
    }
});

const liverFunctionTest = await prisma.test.findFirst({
    where: {
        name: 'Liver Function Test',
        centreId: centre2.id
    }
});

// Booking 1
const existingBooking1 = await prisma.booking.findFirst({
    where: {
        centreId: centre1.id,
        testId: completeBloodCount.id,
        appointmentTime: new Date('2026-10-05T10:00:00.000Z')
    }
});

if (!existingBooking1) {
    await prisma.booking.create({
        data: {
            userId: user1.id,
            testId: completeBloodCount.id,
            centreId: centre1.id,
            appointmentTime: new Date('2026-10-05T10:00:00.000Z'),
            amount: completeBloodCount.price,
            status: 'PENDING'
        }
    });
}

// Booking 2
const existingBooking2 = await prisma.booking.findFirst({
    where: {
        centreId: centre1.id,
        testId: lipidProfile.id,
        appointmentTime: new Date('2026-10-06T11:00:00.000Z')
    }
});

if (!existingBooking2) {
    await prisma.booking.create({
        data: {
            userId: user1.id,
            testId: lipidProfile.id,
            centreId: centre1.id,
            appointmentTime: new Date('2026-10-06T11:00:00.000Z'),
            amount: lipidProfile.price,
            status: 'CONFIRMED'
        }
    });
}

// Booking 3
const existingBooking3 = await prisma.booking.findFirst({
    where: {
        centreId: centre2.id,
        testId: liverFunctionTest.id,
        appointmentTime: new Date('2026-10-07T14:00:00.000Z')
    }
});

if (!existingBooking3) {
    await prisma.booking.create({
        data: {
            userId: user2.id,
            testId: liverFunctionTest.id,
            centreId: centre2.id,
            appointmentTime: new Date('2026-10-07T14:00:00.000Z'),
            amount: liverFunctionTest.price,
            status: 'CANCELLED'
        }
    });
}

    console.log('Seed completed successfully.');

console.log({
    users: [user1.email, user2.email],

    centres: [
        centre1.name,
        centre2.name,
        centre3.name
    ],

    bookings: [
        'CBC - Apollo Diagnostics - 10:00 AM - PENDING',
        'Lipid Profile - Apollo Diagnostics - 11:00 AM - CONFIRMED',
        'Liver Function Test - Dr Lal PathLabs - 2:00 PM - CANCELLED'
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