const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const email = "admin@rubrhythm.com";
    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: "admin",
            verified: true,
        },
        create: {
            id: "admin-user-001",
            email,
            name: "Super Admin",
            password: hashedPassword,
            role: "admin",
            verified: true,
            credits: 9999,
        },
    });

    console.log("Admin user handled:", admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
