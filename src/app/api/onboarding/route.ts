import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { onboardingLimiter } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]*$|^[a-z0-9]$/, "Slug must be lowercase alphanumeric with hyphens only"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
  try {
    await onboardingLimiter.consume(ip);
  } catch {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { name, slug } = result.data;

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found. Please sign out and sign in again." }, { status: 404 });
  }

  const existing = await db.organization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "That slug is already taken. Choose another." }, { status: 400 });
  }

  const org = await db.organization.create({
    data: {
      name,
      slug,
      memberships: {
        create: {
          userId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return NextResponse.json({ slug: org.slug });
}
