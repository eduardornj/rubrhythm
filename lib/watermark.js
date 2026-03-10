import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load font once at module level — embedded as base64 in the SVG
let fontBase64 = null;
function getFontBase64() {
  if (!fontBase64) {
    try {
      const fontPath = join(process.cwd(), 'lib', 'fonts', 'Inter-Bold.woff2');
      fontBase64 = readFileSync(fontPath).toString('base64');
    } catch (e) {
      console.error('Failed to load font:', e.message);
    }
  }
  return fontBase64;
}

/**
 * Apply "RubRhythm.com" watermark centered on the image.
 * Embeds the Inter Bold font as base64 in the SVG so it works on any server.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  const fontSize = Math.min(56, Math.max(20, Math.round(w * 0.035)));
  const b64 = getFontBase64();

  if (!b64) {
    console.error('No font available for watermark');
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <style>
      @font-face {
        font-family: 'WM';
        src: url('data:font/woff2;base64,${b64}') format('woff2');
        font-weight: bold;
      }
    </style>
  </defs>
  <text x="${Math.round(w / 2)}" y="${Math.round(h / 2)}"
    text-anchor="middle" dominant-baseline="central"
    font-family="WM" font-size="${fontSize}" font-weight="bold"
    fill="white" fill-opacity="0.4"
    stroke="black" stroke-width="1.5" stroke-opacity="0.25"
    paint-order="stroke">RubRhythm.com</text>
</svg>`);

  try {
    const result = await sharp(inputBuffer)
      .composite([{ input: svg, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark OK: ${w}x${h}, font=${fontSize}px`);
    return result;
  } catch (err) {
    console.error('Watermark composite failed:', err.message);
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
