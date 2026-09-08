"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlanDef {
  key: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  priceId: string | null;
}

interface BillingClientProps {
  orgSlug: string;
  currentPlan: string;
  hasStripeCustomer: boolean;
  isAdmin: boolean;
  plans: PlanDef[];
  successMessage: string | null;
  canceledMessage: string | null;
}

export function BillingClient({
  orgSlug,
  currentPlan,
  hasStripeCustomer,
  isAdmin,
  plans,
  successMessage,
  canceledMessage,
}: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  async function upgrade(priceId: string) {
    setLoading("checkout");
    setApiError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug, priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setApiError(typeof data.error === "string" ? data.error : "Checkout failed.");
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    setApiError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setApiError(typeof data.error === "string" ? data.error : "Could not open portal.");
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          {successMessage}
        </div>
      )}
      {canceledMessage && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          {canceledMessage}
        </div>
      )}
      {apiError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold">Billing &amp; Plans</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the plan that fits your team.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isHigher =
            (plan.key === "PRO" && currentPlan === "FREE") ||
            (plan.key === "ENTERPRISE" && currentPlan !== "ENTERPRISE");

          return (
            <Card
              key={plan.key}
              className={isCurrent ? "border-primary ring-2 ring-primary" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  {" "}
                  <span className="text-sm">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isAdmin && (
                  <div className="pt-2">
                    {isCurrent && hasStripeCustomer && plan.key !== "FREE" && (
                      <button
                        onClick={openPortal}
                        disabled={loading === "portal"}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      >
                        {loading === "portal" ? "Redirecting…" : "Manage Subscription"}
                      </button>
                    )}
                    {isCurrent && plan.key === "FREE" && (
                      <div className="rounded-lg border border-border px-3 py-2 text-center text-sm text-muted-foreground">
                        Your current plan
                      </div>
                    )}
                    {!isCurrent && isHigher && plan.priceId && (
                      <button
                        onClick={() => upgrade(plan.priceId!)}
                        disabled={loading === "checkout"}
                        className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading === "checkout" ? "Redirecting…" : `Upgrade to ${plan.name}`}
                      </button>
                    )}
                    {!isCurrent && !isHigher && hasStripeCustomer && (
                      <button
                        onClick={openPortal}
                        disabled={loading === "portal"}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      >
                        {loading === "portal" ? "Redirecting…" : "Downgrade"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
