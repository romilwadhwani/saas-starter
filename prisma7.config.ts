import { configDotenv } from "dotenv";
configDotenv({ path: ".env.local" });
import { defineConfig } from "prisma/config";

// Prisma CLI (migrate dev, db push) uses the DIRECT (unpooled) connection.
// PrismaClient at runtime uses the POOLED connection via datasourceUrl in src/lib/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
