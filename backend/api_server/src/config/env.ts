import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
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
});

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
