import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  WEB_URL: z.string().url().default("http://localhost:5173"),
  GEMINI_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
