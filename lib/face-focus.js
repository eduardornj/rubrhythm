/**
 * Smart face-focus for cropped images.
 *
 * Uses the native FaceDetector API (Chromium 86+) to find faces and
 * dynamically set `object-position` so the face is never cropped out.
 *
 * Falls back to `center 30%` (upper-third focus, good for portraits)
 * on unsupported browsers (Firefox, Safari).
 *
 * Usage:
 *   <img onLoad={(e) => detectFacePosition(e.target)} />
 */

const FALLBACK = "center 30%";

// Singleton FaceDetector instance (reused across all images)
let _detector = null;
function getDetector() {
  if (!_detector && typeof window !== "undefined" && "FaceDetector" in window) {
    try {
      _detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
    } catch { /* unsupported */ }
  }
  return _detector;
}

export async function detectFacePosition(img) {
  if (!img || !img.naturalWidth) {
    if (img) img.style.objectPosition = FALLBACK;
    return;
  }

  const detector = getDetector();
  if (!detector) {
    img.style.objectPosition = FALLBACK;
    return;
  }

  try {
    const faces = await detector.detect(img);

    if (!faces || faces.length === 0) {
      img.style.objectPosition = FALLBACK;
      return;
    }

    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // Combined bounding box of all detected faces
    let minTop = Infinity, minLeft = Infinity;
    let maxBottom = 0, maxRight = 0;

    for (const face of faces) {
      const box = face.boundingBox;
      minTop = Math.min(minTop, box.y);
      minLeft = Math.min(minLeft, box.x);
      maxBottom = Math.max(maxBottom, box.y + box.height);
      maxRight = Math.max(maxRight, box.x + box.width);
    }

    // Face center as percentage of natural image dimensions
    const centerX = ((minLeft + maxRight) / 2 / natW) * 100;
    const centerY = ((minTop + maxBottom) / 2 / natH) * 100;

    // Clamp between 10-90% to avoid extreme edge positions
    const clamp = (v) => Math.max(10, Math.min(90, Math.round(v)));

    img.style.objectPosition = `${clamp(centerX)}% ${clamp(centerY)}%`;
  } catch {
    img.style.objectPosition = FALLBACK;
  }
}
