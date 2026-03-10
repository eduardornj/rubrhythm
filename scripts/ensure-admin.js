const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    // SECURITY: Read credentials from environment variables, never hardcode
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
        console.error("Example: ADMIN_EMAIL=admin@rubrhythm.com ADMIN_PASSWORD=your-strong-password node scripts/ensure-admin.js");
        process.exit(1);
    }

    if (password.length < 12) {
        console.error("ERROR: Admin password must be at least 12 characters.");
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: "admin",
            verified: true,
        },
        create: {
            id: `admin_${Date.now()}`,
            email,
            name: "Super Admin",
            password: hashedPassword,
            role: "admin",
            verified: true,
            credits: 0,
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
