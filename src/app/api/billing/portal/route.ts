import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const schema = z.object({ orgSlug: z.string().min(1) });

export async function POST(req: Request) {
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

  const { orgSlug } = result.data;

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: orgSlug } },
    include: { organization: true },
  });
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (membership.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can manage billing." }, { status: 403 });
  }

  const org = membership.organization;
  if (!org.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe customer found. Please subscribe to a plan first." },
      { status: 400 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${origin}/dashboard/${orgSlug}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
