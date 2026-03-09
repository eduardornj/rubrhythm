const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function testCreate() {
    try {
        const userId = "test_user_for_debugging";

        // Create dummy user for test if not exists
        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                role: "provider",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        const LISTING_CREATION_COST = 10.0;

        // Give credits
        await prisma.creditbalance.upsert({
            where: { userId: userId },
            update: { balance: 100 },
            create: { id: crypto.randomUUID(), userId: userId, balance: 100 }
        });

        const result = await prisma.$transaction(async (tx) => {
            await tx.creditbalance.update({
                where: { userId: userId },
                data: { balance: { decrement: LISTING_CREATION_COST } }
            });

            const listing = await tx.listing.create({
                data: {
                    id: crypto.randomUUID(),
                    title: "Test Listing",
                    serviceLocation: "Incall",
                    description: "Test description",
                    phoneArea: "555",
                    phoneNumber: "123456",
                    country: "US",
                    state: "FL",
                    city: "Miami",
                    images: [],
                    services: [],
                    availability: {},
                    userId,
                    isApproved: false,
                    isFeatured: false,
                    updatedAt: new Date()
                },
            });

            await tx.credittransaction.create({
                data: {
                    id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId: userId,
                    amount: -LISTING_CREATION_COST,
                    type: "LISTING_CREATION",
                    description: `Listing creation: Test Listing`,
                    relatedId: listing.id
                }
            });

            return listing;
        });

        console.log("SUCCESS:", result.id);
    } catch (err) {
        console.error("PRISMA ERROR DETAILS:");
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

testCreate();
