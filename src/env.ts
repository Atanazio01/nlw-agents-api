import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  WEB_URL: z.string().url().default("http://localhost:5173"),
});

export const env = envSchema.parse(process.env);
