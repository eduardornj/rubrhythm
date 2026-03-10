import sharp from 'sharp';

/**
 * Apply watermark text to an image buffer.
 * Places "rubrhythm.com" in the bottom-right corner, semi-transparent white with dark outline.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const { width, height } = metadata;

  // Scale font size relative to image width (3% of width, min 18px, max 52px)
  const fontSize = Math.min(52, Math.max(18, Math.round(width * 0.03)));
  const padding = Math.round(fontSize * 0.8);
  const strokeWidth = Math.max(1, Math.round(fontSize * 0.06));

  // Simple SVG: dark stroke for contrast + white semi-transparent fill
  // No filters (feDropShadow not supported in all sharp/libvips versions)
  const svgOverlay = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${width - padding}" y="${height - padding}" text-anchor="end"
    font-family="Arial,Helvetica,sans-serif" font-size="${fontSize}" font-weight="700"
    letter-spacing="1" stroke="#000000" stroke-width="${strokeWidth}" stroke-opacity="0.5"
    fill="rgba(255,255,255,0.5)">rubrhythm.com</text>
</svg>`);

  const watermarked = await sharp(inputBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return watermarked;
}
