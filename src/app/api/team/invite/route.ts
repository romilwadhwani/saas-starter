import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { inviteLimiter } from "@/lib/rate-limit";
import { getPlanLimits } from "@/lib/plan";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["MEMBER", "VIEWER"]),
  orgSlug: z.string().min(1),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  try {
    await inviteLimiter.consume(ip);
  } catch {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const { email, role, orgSlug } = result.data;

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: orgSlug } },
    include: {
      organization: { include: { memberships: true } },
    },
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can invite members." }, { status: 403 });
  }

  const org = membership.organization;
  const limits = getPlanLimits(org.plan);
  if (org.memberships.length >= limits.maxMembers) {
    return NextResponse.json(
      {
        error: `Your ${org.plan} plan allows up to ${limits.maxMembers} members. Upgrade to invite more.`,
      },
      { status: 400 }
    );
  }

  const existing = await db.invitation.findFirst({
    where: {
      email,
      organizationId: org.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A pending invitation already exists for this email address." },
      { status: 400 }
    );
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await db.invitation.create({
    data: { email, organizationId: org.id, role, expiresAt },
  });

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const inviteUrl = `${origin}/invite/${invitation.token}`;

  return NextResponse.json({ inviteUrl });
}
