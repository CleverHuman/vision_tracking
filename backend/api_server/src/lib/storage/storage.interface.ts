export interface UploadResult {
  key: string;
  url: string;
}

/** Abstraction over file storage backends (S3, Google Drive, etc.) */
export interface StorageProvider {
  uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult>;
  getAccessUrl(key: string, expiresIn?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
  generateVideoKey(userId: string, filename: string): string;
  generateThumbnailKey(videoId: string): string;
}
