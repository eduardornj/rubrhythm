import sharp from 'sharp';

/**
 * Apply watermark text to an image buffer.
 * Places "rubrhythm.com" in the bottom-right corner, semi-transparent white with dark shadow.
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  // Get dimensions first (separate sharp instance)
  const metadata = await sharp(inputBuffer).metadata();
  const { width, height } = metadata;

  // Scale font size relative to image width (roughly 3% of width, min 16px, max 48px)
  const fontSize = Math.min(48, Math.max(16, Math.round(width * 0.03)));
  const padding = Math.round(fontSize * 0.8);

  // Create SVG watermark overlay (same size as image, text in bottom-right)
  const svgText = `<svg width="${width}" height="${height}">
    <defs>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.7"/>
      </filter>
    </defs>
    <text
      x="${width - padding}"
      y="${height - padding}"
      text-anchor="end"
      font-family="Arial,Helvetica,sans-serif"
      font-size="${fontSize}"
      font-weight="700"
      letter-spacing="1"
      fill="rgba(255,255,255,0.45)"
      filter="url(#s)"
    >rubrhythm.com</text>
  </svg>`;

  // New sharp instance for the composite operation
  const watermarked = await sharp(inputBuffer)
    .composite([{
      input: Buffer.from(svgText),
      top: 0,
      left: 0,
    }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return watermarked;
}
