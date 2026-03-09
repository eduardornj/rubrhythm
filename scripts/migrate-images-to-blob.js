/**
 * Migration script: Upload old local listing images to Vercel Blob
 * and update the database records.
 *
 * Run: node scripts/migrate-images-to-blob.js
 *
 * Requires BLOB_READ_WRITE_TOKEN env var (from .env or .env.local)
 */

const { PrismaClient } = require('@prisma/client');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Load env manually (no dotenv dependency)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const prisma = new PrismaClient();

const LOCAL_STORAGE_BASE = path.join(__dirname, '..', 'private', 'storage', 'users', 'listings');

// All possible locations where old images might be stored
function findLocalFile(filename) {
  // Direct in base dir
  const direct = path.join(LOCAL_STORAGE_BASE, filename);
  if (fs.existsSync(direct)) return direct;

  // In year/month subdirectories
  const yearMonthDirs = ['2025/09', '2026/02', '2026/03', '2025/04', '2025/05'];
  for (const sub of yearMonthDirs) {
    const p = path.join(LOCAL_STORAGE_BASE, sub, filename);
    if (fs.existsSync(p)) return p;
  }

  // Recursive search as fallback
  try {
    const search = (dir) => {
      if (!fs.existsSync(dir)) return null;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isFile() && entry.name === filename) return full;
        if (entry.isDirectory()) {
          const found = search(full);
          if (found) return found;
        }
      }
      return null;
    };
    return search(LOCAL_STORAGE_BASE);
  } catch {
    return null;
  }
}

function getMimeType(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return map[ext.toLowerCase()] || 'image/webp';
}

async function migrate() {
  console.log('=== Image Migration: Local → Vercel Blob ===\n');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('ERROR: BLOB_READ_WRITE_TOKEN not found in env. Set it in .env.local');
    process.exit(1);
  }

  // Get all listings with non-empty images
  const listings = await prisma.listing.findMany({
    select: { id: true, title: true, images: true },
  });

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalAlreadyBlob = 0;

  for (const listing of listings) {
    let images = listing.images;

    // Parse if string
    if (typeof images === 'string') {
      try { images = JSON.parse(images); } catch { images = []; }
    }
    if (!Array.isArray(images) || images.length === 0) continue;

    // Check if any images need migration
    const needsMigration = images.some(img =>
      typeof img === 'string' && img.trim() && !img.startsWith('http') && !img.startsWith('/')
    );

    if (!needsMigration) {
      totalAlreadyBlob += images.length;
      continue;
    }

    console.log(`\n📦 Listing: "${listing.title}" (${listing.id})`);
    const newImages = [];
    let changed = false;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Already a blob URL or absolute URL — keep as-is
      if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))) {
        newImages.push(img);
        totalAlreadyBlob++;
        continue;
      }

      // It's a local filename — find and upload
      const filename = typeof img === 'string' ? img.trim() : '';
      if (!filename) continue;

      const localPath = findLocalFile(filename);
      if (!localPath) {
        console.log(`  ❌ NOT FOUND: ${filename}`);
        totalFailed++;
        // Keep the old reference so we don't lose data
        newImages.push(filename);
        continue;
      }

      try {
        const buffer = fs.readFileSync(localPath);
        const ext = path.extname(filename);
        const contentType = getMimeType(ext);
        const blobPath = `listings/migrated/${filename}`;

        const blob = await put(blobPath, buffer, {
          access: 'public',
          contentType,
          addRandomSuffix: false,
        });

        console.log(`  ✅ Uploaded: ${filename} → ${blob.url}`);
        newImages.push(blob.url);
        changed = true;
        totalMigrated++;
      } catch (err) {
        console.log(`  ❌ UPLOAD FAILED: ${filename} — ${err.message}`);
        newImages.push(filename); // Keep old reference
        totalFailed++;
      }
    }

    // Update DB if any images were migrated
    if (changed) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { images: newImages },
      });
      console.log(`  💾 DB updated with ${newImages.length} images`);
    }
  }

  console.log('\n=== Migration Complete ===');
  console.log(`  Migrated:    ${totalMigrated}`);
  console.log(`  Already Blob: ${totalAlreadyBlob}`);
  console.log(`  Failed:      ${totalFailed}`);
  console.log(`  Skipped:     ${totalSkipped}`);

  await prisma.$disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
