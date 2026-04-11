import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1).default('memory'),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VAPID_PUBLIC_KEY: z.string().default(''),
  VAPID_PRIVATE_KEY: z.string().default(''),
  VAPID_SUBJECT: z.string().default('mailto:admin@geomhls.app'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const googleOAuthEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
export const vapidEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
