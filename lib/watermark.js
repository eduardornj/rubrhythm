import sharp from 'sharp';

// Point fontconfig to our bundled fonts directory (works on Vercel Lambda)
if (!process.env.FONTCONFIG_PATH) {
  // On Vercel, webpack copies lib/fonts/ to .next/server/chunks/fonts/
  process.env.FONTCONFIG_PATH = '/var/task/.next/server/chunks/fonts';
}

/**
 * Apply "RubRhythm.com" watermark centered on the image.
 * Uses SVG text with Inter font (bundled via fontconfig).
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  const fontSize = Math.min(56, Math.max(20, Math.round(w * 0.035)));

  // SVG using Inter font (registered via fontconfig on server)
  // Falls back to sans-serif if Inter not available
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <text x="${Math.round(w / 2)}" y="${Math.round(h / 2)}"
    text-anchor="middle" dominant-baseline="central"
    font-family="Inter, sans-serif" font-size="${fontSize}" font-weight="bold"
    fill="white" fill-opacity="0.4"
    stroke="black" stroke-width="1.5" stroke-opacity="0.25"
    paint-order="stroke">RubRhythm.com</text>
</svg>`);

  try {
    const result = await sharp(inputBuffer)
      .composite([{ input: svg, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark OK: ${w}x${h}, font=${fontSize}px, FONTCONFIG=${process.env.FONTCONFIG_PATH}`);
    return result;
  } catch (err) {
    console.error('Watermark failed:', err.message);
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
