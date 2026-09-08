import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const slugRegex = /^[a-z0-9][a-z0-9-]*$|^[a-z0-9]$/;

const patchSchema = z.object({
  orgSlug: z.string().min(1),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(50).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens only"),
});

const deleteSchema = z.object({
  orgSlug: z.string().min(1),
});

async function resolveAdmin(userId: string, orgSlug: string) {
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return null;

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: orgSlug } },
    include: { organization: true },
  });
  if (!membership || membership.role !== "ADMIN") return null;

  return { user, membership, org: membership.organization };
}

export async function PATCH(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const { orgSlug, name, slug: newSlug } = result.data;

  const ctx = await resolveAdmin(userId, orgSlug);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (newSlug !== orgSlug) {
    const taken = await db.organization.findUnique({ where: { slug: newSlug } });
    if (taken) return NextResponse.json({ error: "That slug is already taken. Choose another." }, { status: 400 });
  }

  const updated = await db.organization.update({
    where: { id: ctx.org.id },
    data: { name, slug: newSlug },
  });

  return NextResponse.json({ slug: updated.slug });
}

export async function DELETE(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = deleteSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }

  const ctx = await resolveAdmin(userId, result.data.orgSlug);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.organization.delete({ where: { id: ctx.org.id } });

  return NextResponse.json({ ok: true });
}
