import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const schema = z.object({
  orgSlug: z.string().min(1),
  priceId: z.string().min(1),
});

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

  const { orgSlug, priceId } = result.data;

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

  try {
    let stripeCustomerId = org.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: { organizationId: org.id },
      });
      stripeCustomerId = customer.id;
      await db.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId },
      });
    }

    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      client_reference_id: org.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard/${orgSlug}/billing?success=1`,
      cancel_url: `${origin}/dashboard/${orgSlug}/billing?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : "Failed to create checkout session.";
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
