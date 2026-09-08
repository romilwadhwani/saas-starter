import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BillingClient } from "@/components/dashboard/billing-client";

interface PageProps {
  params: { orgSlug: string };
  searchParams: { success?: string; canceled?: string };
}

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 team members", "Basic analytics", "Community support"],
    priceId: null,
  },
  {
    key: "PRO",
    name: "Pro",
    price: "$29",
    period: "per month",
    features: [
      "20 team members",
      "Advanced analytics",
      "Priority support",
      "Custom domains",
    ],
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  },
  {
    key: "ENTERPRISE",
    name: "Enterprise",
    price: "$99",
    period: "per month",
    features: [
      "Unlimited members",
      "Full analytics suite",
      "Dedicated support",
      "SLA guarantee",
      "SSO",
    ],
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
  },
];

export default async function BillingPage({ params, searchParams }: PageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: params.orgSlug } },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  const org = membership.organization;

  return (
    <BillingClient
      orgSlug={params.orgSlug}
      currentPlan={org.plan}
      hasStripeCustomer={!!org.stripeCustomerId}
      isAdmin={membership.role === "ADMIN"}
      plans={PLANS}
      successMessage={searchParams.success === "1" ? "Subscription updated successfully!" : null}
      canceledMessage={searchParams.canceled === "1" ? "Checkout was canceled." : null}
    />
  );
}
