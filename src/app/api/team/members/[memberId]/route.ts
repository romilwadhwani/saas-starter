import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const patchSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

async function getActorAndTarget(userId: string, memberId: string) {
  const actor = await db.user.findUnique({ where: { clerkId: userId } });
  if (!actor) return null;

  const target = await db.membership.findUnique({
    where: { id: memberId },
    include: {
      organization: { include: { memberships: true } },
    },
  });
  if (!target) return null;

  const actorMembership = await db.membership.findFirst({
    where: { userId: actor.id, organizationId: target.organizationId },
  });
  if (!actorMembership || actorMembership.role !== "ADMIN") return null;

  return { actor, target };
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getActorAndTarget(userId, params.memberId);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  const { role } = result.data;
  const { target } = ctx;

  if (target.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = target.organization.memberships.filter((m) => m.role === "ADMIN").length;
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot demote the last admin." }, { status: 400 });
    }
  }

  await db.membership.update({ where: { id: params.memberId }, data: { role } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { memberId: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getActorAndTarget(userId, params.memberId);
  if (!ctx) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { target } = ctx;

  if (target.role === "ADMIN") {
    const adminCount = target.organization.memberships.filter((m) => m.role === "ADMIN").length;
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot remove the last admin." }, { status: 400 });
    }
  }

  await db.membership.delete({ where: { id: params.memberId } });
  return NextResponse.json({ ok: true });
}
