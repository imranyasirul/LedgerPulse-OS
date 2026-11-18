import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  // ডিফল্ট প্লেসহোল্ডার ইউআরএল থাকলে ডেটাবেস সংযুক্ত নয় বলে ধরে নেওয়া হবে
  if (url.includes("johndoe:randompassword")) return false;
  return url.startsWith("postgres://") || url.startsWith("postgresql://");
}