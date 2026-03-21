import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET_NAME: z.string().default(''),
  STORAGE_PROVIDER: z.enum(['s3', 'gdrive']).default('s3'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_REDIRECT_URI: z.string().default(''),
  GOOGLE_REFRESH_TOKEN: z.string().default(''),
  GDRIVE_FOLDER_ID: z.string().default(''),
  VISION_SERVER_URL: z.string().url().default('http://localhost:8000'),
  VISION_API_KEY: z.string().default(''),
  INTERNAL_WEBHOOK_SECRET: z.string().default(''),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASS: z.string().default(''),
}).refine(
  (data) => {
    if (data.STORAGE_PROVIDER === 'gdrive') {
      return data.GOOGLE_CLIENT_ID.length > 0 &&
        data.GOOGLE_CLIENT_SECRET.length > 0 &&
        data.GOOGLE_REFRESH_TOKEN.length > 0 &&
        data.GDRIVE_FOLDER_ID.length > 0;
    }
    return true;
  },
  {
    message: 'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GDRIVE_FOLDER_ID are required when STORAGE_PROVIDER is "gdrive"',
  },
);

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    console.error('Invalid environment variables:', flattened.fieldErrors);
    if (flattened.formErrors.length > 0) {
      console.error('Validation errors:', flattened.formErrors);
    }
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
