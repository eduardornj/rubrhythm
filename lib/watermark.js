import sharp from 'sharp';

/**
 * Apply "RubRhythm.com" watermark centered on the image.
 * Uses sharp's built-in text() with Pango markup (no external fonts needed).
 * @param {Buffer} inputBuffer - Original image buffer
 * @returns {Promise<Buffer>} - Watermarked image buffer (JPEG, quality 90)
 */
export async function applyWatermark(inputBuffer) {
  const metadata = await sharp(inputBuffer).metadata();
  const w = metadata.width;
  const h = metadata.height;

  // Scale font size relative to image width (3.5%, min 20, max 56)
  const fontSize = Math.min(56, Math.max(20, Math.round(w * 0.035)));

  try {
    // Create text image using sharp's built-in Pango text renderer
    // This works on Vercel because Pango is bundled with libvips
    const textImage = await sharp({
      text: {
        text: `<span foreground="white" font_size="${fontSize * 1024}">RubRhythm.com</span>`,
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer();

    // Get text dimensions to center it
    const textMeta = await sharp(textImage).metadata();
    const textW = textMeta.width;
    const textH = textMeta.height;

    // Make the text semi-transparent
    const transparentText = await sharp(textImage)
      .ensureAlpha()
      .modulate({ brightness: 1 })
      .linear(0.45, 0) // reduce overall opacity to ~45%
      .png()
      .toBuffer();

    // Center position
    const left = Math.max(0, Math.round((w - textW) / 2));
    const top = Math.max(0, Math.round((h - textH) / 2));

    const result = await sharp(inputBuffer)
      .composite([{
        input: transparentText,
        left,
        top,
        blend: 'over',
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Watermark applied: ${w}x${h}, text=${textW}x${textH}, fontSize=${fontSize}`);
    return result;
  } catch (err) {
    console.error('Watermark failed:', err.message);
    // Fallback: return image as JPEG without watermark
    return sharp(inputBuffer).jpeg({ quality: 90 }).toBuffer();
  }
}
