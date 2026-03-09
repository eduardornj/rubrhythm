import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 1 * 1024 * 1024; // 1MB — matching the UI's stated limit
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

async function saveFile(file, dir, prefix) {
    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
    const filename = `${prefix}_${crypto.randomBytes(6).toString("hex")}${ext}`;
    const bytes = await file.arrayBuffer();
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(bytes));
    return filename;
}

export async function POST(request) {
    try {
        const formData = await request.formData();

        const fullName = (formData.get("fullName") || "").trim();
        const socialLink = (formData.get("socialLink") || "").trim();
        const idFile = formData.get("idDocument");
        const selfieFile = formData.get("selfiePhoto");

        // --- Validation ---
        if (!fullName) {
            return NextResponse.json({ error: "Full legal name is required." }, { status: 400 });
        }

        if (!idFile || typeof idFile === "string") {
            return NextResponse.json({ error: "ID document is required." }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(idFile.type)) {
            return NextResponse.json({ error: "ID must be JPEG, PNG or WebP." }, { status: 400 });
        }

        if (idFile.size > MAX_SIZE) {
            return NextResponse.json({ error: "ID file must be under 1 MB." }, { status: 400 });
        }

        if (selfieFile && typeof selfieFile !== "string") {
            if (!ALLOWED_TYPES.includes(selfieFile.type)) {
                return NextResponse.json({ error: "Selfie must be JPEG, PNG or WebP." }, { status: 400 });
            }
            if (selfieFile.size > MAX_SIZE) {
                return NextResponse.json({ error: "Selfie file must be under 1 MB." }, { status: 400 });
            }
        }

        // --- Generate a unique reference ID for this submission ---
        const refId = `pub_${crypto.randomBytes(8).toString("hex")}`;
        const uploadDir = path.join(
            process.cwd(),
            "private",
            "storage",
            "public-verification",
            refId
        );

        // --- Save files ---
        const savedFiles = {};
        savedFiles.idDocument = await saveFile(idFile, uploadDir, "id");

        if (selfieFile && typeof selfieFile !== "string" && selfieFile.size > 0) {
            savedFiles.selfiePhoto = await saveFile(selfieFile, uploadDir, "selfie");
        }

        // --- Save metadata alongside the files ---
        const meta = {
            refId,
            fullName,
            socialLink: socialLink || null,
            submittedAt: new Date().toISOString(),
            files: savedFiles,
        };

        await writeFile(
            path.join(uploadDir, "meta.json"),
            JSON.stringify(meta, null, 2)
        );

        console.log(`[public-verification] New submission: ${refId} — ${fullName}`);

        return NextResponse.json({
            success: true,
            message: "Verification request submitted. We'll review within 1–3 business days.",
            refId,
        });

    } catch (err) {
        console.error("[public-verification] Error:", err);
        return NextResponse.json(
            { error: "Server error. Please try again." },
            { status: 500 }
        );
    }
}
