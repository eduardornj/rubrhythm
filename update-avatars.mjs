import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Starting avatar backfill...");
    const approvedUsers = await prisma.user.findMany({
        where: { verified: true },
        select: { id: true, email: true, image: true, verificationrequest: true }
    });

    let updated = 0;
    for (const user of approvedUsers) {
        if (!user.image) {
            const approvedReq = user.verificationrequest.find(req => req.status === "approved" && req.selfiePath);
            if (approvedReq) {
                const imagePath = `/api/secure-files?path=${encodeURIComponent(approvedReq.selfiePath)}&type=verification`;
                await prisma.user.update({
                    where: { id: user.id },
                    data: { image: imagePath }
                });
                console.log(`Updated avatar for: ${user.email}`);
                updated++;
            }
        }
    }
    console.log(`Finished. Updated ${updated} users.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
