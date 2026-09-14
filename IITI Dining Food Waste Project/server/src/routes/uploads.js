import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { cloudinaryEnabled, uploadToCloudinary } from '../utils/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    if (!cloudinaryEnabled) {
      return res.status(503).json({
        message: 'Image uploads are not configured on the server',
        hint:
          'Set CLOUDINARY_URL (from Cloudinary dashboard) or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in server / Vercel env'
      });
    }
    const result = await uploadToCloudinary(req.file);
    return res.status(201).json({ url: result.secure_url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Upload failed', err);
    const code = err?.code;
    if (code === 'CLOUDINARY_NOT_CONFIGURED') return res.status(503).json({ message: err.message });
    if (code === 'NO_FILE_BUFFER') return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: 'Upload failed', error: err?.message || String(err) });
  }
});

export default router;











