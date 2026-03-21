import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuid } from 'uuid';
import { s3Client, videoStorage } from '../lib/storage';
import { env } from './env';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

const videoFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`));
  }
};

function createS3VideoUpload() {
  return multer({
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
    limits: { fileSize: MAX_VIDEO_SIZE },
    fileFilter: videoFileFilter,
  }).single('video');
}

function createDiskVideoUpload() {
  return multer({
    storage: multer.diskStorage({
      destination: os.tmpdir(),
      filename: (_req, file, cb) => {
        cb(null, `${uuid()}_${file.originalname}`);
      },
    }),
    limits: { fileSize: MAX_VIDEO_SIZE },
    fileFilter: videoFileFilter,
  }).single('video');
}

function gdrivePostUpload(req: Request, _res: Response, next: NextFunction) {
  if (!req.file) return next();

  const filePath = req.file.path;
  const buffer = fs.readFileSync(filePath);
  const key = `${uuid()}_${req.file.originalname}`;

  videoStorage
    .uploadFile(buffer, key, req.file.mimetype)
    .then((result) => {
      (req.file as any).key = result.key;
      (req.file as any).location = result.url;
      fs.unlink(filePath, () => {});
      next();
    })
    .catch((err) => {
      fs.unlink(filePath, () => {});
      next(err);
    });
}

export const uploadVideo: Array<(req: Request, res: Response, next: NextFunction) => void> =
  env.STORAGE_PROVIDER === 'gdrive'
    ? [createDiskVideoUpload(), gdrivePostUpload]
    : [createS3VideoUpload()];

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

export const uploadAvatar = avatarUpload.single('avatar');
