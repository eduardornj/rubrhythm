import sharp from 'sharp';

/**
 * Apply watermark to an image buffer.
 * Places "rubrhythm.com" centered, using sharp's built-in text rendering.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Create watermark text as a separate image using sharp's text input
  // This uses Pango (built into libvips) which has its own font rendering
  const fontSize = Math.min(52, Math.max(20, Math.round(w * 0.035)));

  const textSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <style>
        @font-face { font-family: fallback; src: local("DejaVu Sans"), local("Liberation Sans"), local("Noto Sans"), local("sans-serif"); }
      </style>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="DejaVu Sans, Liberation Sans, Noto Sans, sans-serif"
        font-size="${fontSize}" font-weight="bold"
        fill="white" fill-opacity="0.4"
        stroke="black" stroke-width="1.5" stroke-opacity="0.3"
        paint-order="stroke">rubrhythm.com</text>
    </svg>`
  );

  try {
    const result = await sharp(inputBuffer)
      .composite([{ input: textSvg, top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark applied: ${w}x${h}, fontSize=${fontSize}`);
    return result;
  } catch (err) {
    console.error('Watermark error, returning original:', err.message);
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
