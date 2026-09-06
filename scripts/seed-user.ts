import { configDotenv } from "dotenv";
configDotenv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const clerkId = "user_3Is51RqBJ5KOP834qpEwFcQf8Kn";

  const res = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  const clerkUser = await res.json() as {
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };

  const email = clerkUser.email_addresses[0]?.email_address;
  const name = [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(" ") || null;

  const user = await db.user.upsert({
    where: { clerkId },
    update: { email, name, avatarUrl: clerkUser.image_url },
    create: { clerkId, email, name, avatarUrl: clerkUser.image_url },
  });

  console.log("✅ User seeded:", user);
}

main().catch(console.error).finally(() => db.$disconnect());
