import { env } from '../../config/env';
import { StorageProvider } from './storage.interface';
import { S3StorageProvider, s3Client, s3DeleteFile } from './s3.provider';
import { GDriveStorageProvider } from './gdrive.provider';

function createStorageProvider(): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case 'gdrive':
      return new GDriveStorageProvider();
    case 's3':
    default:
      return new S3StorageProvider();
  }
}

export const videoStorage = createStorageProvider();

export async function getSignedUrl(key: string, expiresIn?: number): Promise<string> {
  return videoStorage.getAccessUrl(key, expiresIn);
}

export async function deleteFile(key: string): Promise<void> {
  return videoStorage.deleteFile(key);
}

export function generateThumbnailKey(videoId: string): string {
  return videoStorage.generateThumbnailKey(videoId);
}

export { s3Client, s3DeleteFile };
export type { StorageProvider } from './storage.interface';
