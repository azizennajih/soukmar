import imageCompression from 'browser-image-compression';

/** Downscales/compresses a listing photo in the browser before upload — phone
 * camera photos are routinely 8-12MB; this keeps upload bandwidth and
 * Cloudinary storage down without a visible quality loss at listing sizes. */
export function compressListingPhoto(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 1600, maxSizeMB: 1.5 });
}

/** Avatars are only ever displayed small (a few dozen px), so a much smaller
 * cap is enough and keeps profile-photo uploads near-instant. */
export function compressAvatar(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 640, maxSizeMB: 0.3 });
}

async function compress(file: File, opts: { maxWidthOrHeight: number; maxSizeMB: number }): Promise<File> {
  // Compression can fail on formats the library can't decode (e.g. some
  // camera RAW/HEIC variants) — fall back to the original file rather than
  // blocking the upload.
  try {
    return await imageCompression(file, { ...opts, useWebWorker: true, fileType: file.type });
  } catch (e) {
    console.error('Image compression failed, uploading original file:', e);
    return file;
  }
}
