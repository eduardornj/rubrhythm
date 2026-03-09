// Vercel Blob Storage - Central module for all file uploads
// Replaces local filesystem storage (which doesn't work on Vercel's read-only fs)

import { put, del, list } from '@vercel/blob';

/**
 * Upload a file buffer to Vercel Blob
 * @param {Buffer} buffer - File content
 * @param {string} pathname - Logical path (e.g., "listings/2026/03/file.webp")
 * @param {object} options - { contentType, access }
 * @returns {Promise<{url: string, pathname: string}>}
 */
export async function uploadToBlob(buffer, pathname, options = {}) {
  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: options.contentType || 'image/webp',
    addRandomSuffix: false,
  });
  return { url: blob.url, pathname: blob.pathname };
}

/**
 * Delete a file from Vercel Blob by URL
 * @param {string} url - The blob URL to delete
 */
export async function deleteFromBlob(url) {
  if (!url) return;
  try {
    await del(url);
  } catch (error) {
    console.error('Blob delete error:', error.message);
  }
}

/**
 * Delete multiple files from Vercel Blob
 * @param {string[]} urls - Array of blob URLs to delete
 */
export async function deleteManyFromBlob(urls) {
  const validUrls = (urls || []).filter(Boolean);
  if (validUrls.length === 0) return;
  try {
    await del(validUrls);
  } catch (error) {
    console.error('Blob bulk delete error:', error.message);
  }
}

/**
 * List files in a prefix path
 * @param {string} prefix - Path prefix to list
 * @returns {Promise<Array<{url: string, pathname: string}>>}
 */
export async function listBlobs(prefix) {
  const result = await list({ prefix });
  return result.blobs;
}

/**
 * Check if a URL is a Vercel Blob URL
 */
export function isBlobUrl(url) {
  return url && (url.includes('.vercel-storage.com') || url.includes('.blob.vercel-storage.com'));
}

/**
 * Generate a secure filename
 */
export function generateBlobPath(type, entityId, sequence, extension = 'webp') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
  const seq = String(sequence).padStart(2, '0');
  return `${type}/${year}/${month}/${entityId}_${timestamp}_${seq}.${extension}`;
}
