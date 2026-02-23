import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';
import { s3Client } from '../lib/s3';
import { env } from './env';
import path from 'path';

const videoUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const key = `videos/${uuid()}/${file.originalname.replace(ext, '')}${ext}`;
      cb(null, key);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowed.join(', ')}`));
    }
  },
});

const avatarUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const key = `avatars/${uuid()}${ext}`;
      cb(null, key);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: image/jpeg, image/png, image/webp`));
    }
  },
});

export const uploadVideo = videoUpload.single('video');
export const uploadAvatar = avatarUpload.single('avatar');
