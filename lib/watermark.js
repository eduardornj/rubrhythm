import sharp from 'sharp';

/**
 * Apply watermark text to an image buffer.
 * Places "rubrhythm.com" in the bottom-right corner.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Scale font size relative to image width
  const fontSize = Math.min(52, Math.max(20, Math.round(w * 0.035)));
  const margin = Math.round(fontSize * 1.2);

  // SVG with explicit xmlns — required for sharp/libvips
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <text x="${w - margin}" y="${h - margin}" text-anchor="end"
    font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="bold"
    fill="white" fill-opacity="0.6"
    stroke="black" stroke-width="2" stroke-opacity="0.4"
    paint-order="stroke">rubrhythm.com</text>
</svg>`;

  try {
    const result = await sharp(inputBuffer)
      .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark applied: ${w}x${h}, fontSize=${fontSize}`);
    return result;
  } catch (err) {
    console.error('Watermark error, returning original:', err.message);
    // If watermark fails, return the image as JPEG without watermark
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
