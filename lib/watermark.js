import sharp from 'sharp';
import path from 'path';
import { readFileSync } from 'fs';

// Pre-rendered watermark PNGs (text already baked in — no font dependency)
// Sizes: sm (300px wide), md (500px), lg (700px)
const WATERMARKS = {};

function getWatermarkBuffer(size) {
  if (!WATERMARKS[size]) {
    // Try multiple paths: local dev, Vercel Lambda, webpack chunks
    const candidates = [
      path.join(process.cwd(), 'lib', 'fonts', `watermark-${size}.png`),
      path.join('/var/task', 'lib', 'fonts', `watermark-${size}.png`),
      path.join('/var/task/.next/server/chunks/fonts', `watermark-${size}.png`),
    ];
    for (const p of candidates) {
      try {
        WATERMARKS[size] = readFileSync(p);
        console.log(`Watermark PNG loaded: ${p}`);
        break;
      } catch { /* try next */ }
    }
  }
  return WATERMARKS[size] || null;
}

/**
 * Pick the best watermark size for the image width.
 * Returns 'sm' for small images, 'md' for medium, 'lg' for large.
 */
function pickSize(imageWidth) {
  if (imageWidth < 600) return 'sm';
  if (imageWidth < 1000) return 'md';
  return 'lg';
}

/**
 * Apply "RubRhythm.com" watermark centered on the image.
 * Uses pre-rendered PNG overlays — zero font dependency.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  const size = pickSize(w);
  const wmBuffer = getWatermarkBuffer(size);

  if (!wmBuffer) {
    console.error('Watermark PNG not found for size:', size);
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }

  try {
    // Get watermark dimensions
    const wmMeta = await sharp(wmBuffer).metadata();

    // Extract alpha channel, reduce to 40% opacity, recombine
    const { data, info } = await sharp(wmBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Modify alpha channel (every 4th byte: R,G,B,A)
    for (let i = 3; i < data.length; i += 4) {
      data[i] = Math.round(data[i] * 0.4);
    }

    const transparentWm = await sharp(data, {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer();

    // Center the watermark on the image
    const left = Math.round((w - wmMeta.width) / 2);
    const top = Math.round((h - wmMeta.height) / 2);

    const result = await sharp(inputBuffer)
      .composite([{
        input: transparentWm,
        left: Math.max(0, left),
        top: Math.max(0, top),
        blend: 'over',
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark OK: ${w}x${h}, size=${size}, pos=(${left},${top})`);
    return result;
  } catch (err) {
    console.error('Watermark failed:', err.message);
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
