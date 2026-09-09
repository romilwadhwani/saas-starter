import Link from "next/link";
import { Check } from "lucide-react";

const FEATURES = [
  {
    title: "Multi-Tenant Architecture",
    description:
      "Every organisation gets its own isolated data slice. URL-segment routing keeps tenants separated at the framework level.",
  },
  {
    title: "Team Management",
    description:
      "Invite members by email, assign Admin / Member / Viewer roles, enforce seat limits per plan, and revoke access instantly.",
  },
  {
    title: "Stripe Billing",
    description:
      "Checkout sessions, Customer Portal, and webhook sync keep plan state in your database automatically.",
  },
  {
    title: "Auth out of the box",
    description:
      "Clerk handles sign-up, sign-in, and session management. Webhooks sync users to Postgres on creation.",
  },
  {
    title: "Rate limiting & validation",
    description:
      "Every API route is Zod-validated and rate-limited with rate-limiter-flexible. No raw inputs reach the database.",
  },
  {
    title: "Light / Dark mode",
    description:
      "next-themes with CSS HSL variables — swap themes without a flash of unstyled content.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 team members", "Basic analytics", "Community support"],
    cta: "Get started",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    features: ["20 team members", "Advanced analytics", "Priority support", "Custom domains"],
    cta: "Start free trial",
    href: "/sign-up",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    features: ["Unlimited members", "Full analytics suite", "Dedicated support", "SLA guarantee", "SSO"],
    cta: "Contact sales",
    href: "/sign-up",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">SaaS Starter</span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Production-ready · Next.js 14 · TypeScript
          </div>
          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            The SaaS foundation
            <br />
            <span className="text-primary">you don&apos;t have to build</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Multi-tenant organisations, team invites, role-based access, Stripe subscriptions,
            and a polished dashboard, all wired together and ready to ship.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start building free
            </Link>
            <Link
              href="/sign-in"
              className="rounded-lg border border-border px-8 py-3 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold">Everything included</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Skip the boilerplate. Every feature is production-hardened and ready to extend.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
              Start free, upgrade when your team grows.
            </p>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-6 ${
                    plan.highlight
                      ? "border-primary bg-card shadow-md ring-2 ring-primary"
                      : "border-border bg-card"
                  }`}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`mt-6 block rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border hover:bg-muted"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Built with Next.js 14 · Clerk · Prisma · Stripe · Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
