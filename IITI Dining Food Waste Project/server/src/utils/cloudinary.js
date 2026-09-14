import { v2 as cloudinary } from 'cloudinary';

const hasExplicitCreds = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);
const hasCloudinaryUrl = Boolean(process.env.CLOUDINARY_URL);

/** True if Cloudinary can run (either three env vars or a single CLOUDINARY_URL from the dashboard). */
export const cloudinaryEnabled = hasExplicitCreds || hasCloudinaryUrl;

if (cloudinaryEnabled) {
  if (hasExplicitCreds) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  } else {
    // SDK reads cloudinary://key:secret@cloud_name from CLOUDINARY_URL
    cloudinary.config(true);
  }
}

export async function uploadToCloudinary(file) {
  if (!cloudinaryEnabled) {
    const err = new Error(
      'Cloudinary not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
    err.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw err;
  }
  if (!file?.buffer) {
    const err = new Error('Missing file buffer');
    err.code = 'NO_FILE_BUFFER';
    throw err;
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: 'foodwaste' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(file.buffer);
  });
}


