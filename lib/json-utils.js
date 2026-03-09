// Helper function to safely parse JSON fields that might contain data URLs or invalid JSON
export const safeJsonParse = (data) => {
  if (!data) return [];

  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  // If it's not a string, try to convert or return empty array
  if (typeof data !== 'string') {
    // If it's an object with length property (like array-like object), convert to array
    if (data && typeof data === 'object' && data.length !== undefined) {
      return Array.from(data);
    }
    // Empty objects from Prisma JSON fields — just return empty array silently
    return [];
  }

  try {
    // Check if it's a data URL or base64 image
    if (data.startsWith('data:image') || data.startsWith('/9j/') || data.startsWith('iVBOR')) {
      return [data]; // Return as single image array
    }
    return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to parse JSON:', data.substring(0, 50) + '...');
    return [];
  }
};

// Helper function to safely parse listing fields
export const parseListingFields = (listing) => {
  return {
    ...listing,
    images: safeJsonParse(listing.images),
    services: safeJsonParse(listing.services),
    availability: safeJsonParse(listing.availability)
  };
};

/**
 * Converts raw image filenames from the DB into full /api/secure-files URLs.
 * This must be called on EVERY listing API response before sending to the frontend.
 * @param {Array|string} images - Raw images field from the DB
 * @returns {string[]} Array of fully formed image URLs
 */
export const formatImageUrls = (images) => {
  const raw = safeJsonParse(images);
  return raw.map(img => {
    if (!img || typeof img !== 'string') return null;
    // Already a full URL - pass through as-is
    if (img.startsWith('http') || img.startsWith('/')) return img;
    // Raw filename - convert to secure-files URL
    return `/api/secure-files?path=users/listings/${img}&type=listing`;
  }).filter(Boolean);
};