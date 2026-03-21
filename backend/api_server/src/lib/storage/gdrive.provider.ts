import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';
import { v4 as uuid } from 'uuid';
import { env } from '../../config/env';
import { StorageProvider, UploadResult } from './storage.interface';

/** Google Drive implementation of the StorageProvider interface using OAuth2. */
export class GDriveStorageProvider implements StorageProvider {
  private drive: drive_v3.Drive;
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    );

    this.oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const stream = Readable.from(buffer);

    const response = await this.drive.files.create({
      requestBody: {
        name: key,
        parents: [env.GDRIVE_FOLDER_ID],
      },
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, webContentLink',
    });

    const fileId = response.data.id!;

    await this.drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const url = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

    return { key: fileId, url };
  }

  async getAccessUrl(key: string): Promise<string> {
    const { token } = await this.oauth2Client.getAccessToken();
    return `https://www.googleapis.com/drive/v3/files/${key}?alt=media&access_token=${token}`;
  }

  async deleteFile(key: string): Promise<void> {
    await this.drive.files.delete({ fileId: key });
  }

  generateVideoKey(_userId: string, filename: string): string {
    return `${uuid()}_${filename}`;
  }

  generateThumbnailKey(videoId: string): string {
    return `thumb_${videoId}.jpg`;
  }
}
