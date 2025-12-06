import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import ms from "ms";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function msSafe(value: string): number {
  return (ms as unknown as (v: string) => number)(value);
}

// Helper schema to convert durations like "15m" → 900000 (ms)
const durationSchema = z.string().transform((value, ctx) => {
  const converted = msSafe(value);
  if (typeof converted !== "number") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid duration format: "${value}". Expected "15m", "2h", "7d", etc.`,
    });
    return z.NEVER;
  }
  return converted;
});

const envSchema = z.object({
  PORT: z.string().transform((val, ctx) => {
    const num = Number(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PORT must be a number",
      });
      return z.NEVER;
    }
    return num;
  }),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_EXPIRES_IN: z.string().min(1),          // "15m"
  JWT_REFRESH_EXPIRES_IN: z.string().min(1),  // "30d"
});

const parsed = envSchema.parse(process.env);

const ENV = {
  ...parsed,
  // **parse the strings through durationSchema here to get number**
  JWT_EXPIRES_IN_MS: durationSchema.parse(parsed.JWT_EXPIRES_IN),
  JWT_REFRESH_EXPIRES_IN_MS: durationSchema.parse(parsed.JWT_REFRESH_EXPIRES_IN),
};

export default ENV;
