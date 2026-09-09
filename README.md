# Multi-Tenant SaaS Starter Kit

A production-ready, full-stack SaaS boilerplate built with **Next.js 14**, **TypeScript**, **Prisma 7**, **Clerk**, and **Stripe**. Designed as a real-world foundation that engineers can fork and ship from.

---

## Live Demo

> Deploy to Vercel and add your URL here.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| Components | shadcn/ui (manual) + Base UI | — |
| Auth | Clerk | 5 |
| Database | Neon (serverless Postgres) | — |
| ORM | Prisma | 7 |
| Payments | Stripe | 22 |
| Validation | Zod | 4 |
| Rate limiting | rate-limiter-flexible | — |
| Themes | next-themes | — |
| Charts | Recharts | — |
| Icons | Lucide React | — |

---

## Features

### Multi-Tenancy
- URL-segment routing: `/dashboard/[orgSlug]`
- Every organisation has isolated data at the DB layer via `organizationId` FK
- Org-check enforced in the dashboard layout server component (not Edge middleware) so Prisma can run

### Authentication
- Clerk v5 for sign-up / sign-in / session management
- Svix webhook signature verification on `POST /api/webhooks/clerk`
- `user.created` webhook syncs Clerk users to Postgres automatically

### Onboarding
- First-time users land on `/onboarding` to create their organisation
- Slug validated (lowercase alphanumeric + hyphens), unique enforced at DB level
- Rate-limited: 5 attempts per IP per hour

### Team Management
- Invite members by email with a 7-day tokenised link (`/invite/[token]`)
- Roles: **Admin**, **Member**, **Viewer**
- Admins can change roles inline or remove members — last-admin guard prevents lockout
- Seat limits enforced per plan (FREE: 3, PRO: 20, ENTERPRISE: unlimited)
- Invite accepts validate that signed-in user's email matches the invited address

### Stripe Billing
- Three plans: Free · Pro ($29/mo) · Enterprise ($99/mo)
- Stripe Checkout session for upgrades — org ID passed as `client_reference_id`
- Stripe Customer Portal for downgrades, cancellations, and invoice history
- Webhook handler syncs plan + subscription status on `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Dashboard
- 4 live metric cards (member count, active plan, account created, org slug)
- Recharts `LineChart` of cumulative member growth grouped by week
- Collapsible sidebar with active-link highlighting (mobile drawer + desktop always-on)
- Light / dark / system theme toggle (next-themes, HSL CSS variables, no FOUC)

### Settings
- Update org name and slug (slug change redirects to new URL automatically)
- Danger Zone: delete organisation (requires typing slug to confirm, cascades all data)

### Production Hardening
- Zod validation on every API route body
- Rate limiting on invite and onboarding routes
- Startup env var validation — throws clearly if any required variable is missing
- Security headers on all routes (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`)
- Loading skeletons on all dashboard pages
- Custom 404 and global error boundary

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 14 App Router                                   │
│                                                          │
│  src/app/                                                │
│  ├── page.tsx                  Landing page              │
│  ├── onboarding/               Org creation flow         │
│  ├── invite/[token]/           Token-based invite accept │
│  ├── dashboard/[orgSlug]/      Multi-tenant dashboard    │
│  │   ├── layout.tsx            Org-check + shell         │
│  │   ├── page.tsx              Metrics + growth chart    │
│  │   ├── team/                 Member management         │
│  │   ├── billing/              Stripe plan management    │
│  │   └── settings/             Org settings + delete     │
│  └── api/                                                │
│      ├── onboarding/           POST create org           │
│      ├── team/invite/          POST create invite        │
│      ├── team/members/[id]/    PATCH role · DELETE       │
│      ├── billing/checkout/     POST Stripe Checkout      │
│      ├── billing/portal/       POST Stripe Portal        │
│      ├── settings/org/         PATCH update · DELETE     │
│      └── webhooks/             Clerk + Stripe handlers   │
└──────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Clerk     │    │    Stripe    │    │    Neon      │
│  Auth + JWT  │    │  Billing     │    │  Postgres    │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Org-check in layout, not middleware | Prisma requires Node.js runtime; Edge middleware can't run it |
| Prisma 7 adapter pattern | v7 removed `datasourceUrl` from constructor — adapter is now required |
| Pooled URL at runtime, unpooled for CLI | Neon connection pooler (port 6543) for app requests; direct connection (port 5432) for `prisma migrate` |
| `organizationId` FK for tenancy | Simpler and faster than Clerk Organisations for this use case |
| No Clerk Organisations | Avoids the Clerk Org plan cost; tenancy implemented entirely in Postgres |

---

## Project Structure

```
src/
├── app/                    Next.js App Router pages and API routes
├── components/
│   ├── dashboard/          Shell, sidebar, navbar, charts, team, billing, settings
│   └── ui/                 shadcn-compatible primitives (button, card, input, label, badge)
├── generated/prisma/       Prisma 7 generated TypeScript client (gitignored)
└── lib/
    ├── db.ts               PrismaClient singleton (PrismaPg adapter)
    ├── env.ts              Startup env var validation
    ├── plan.ts             getPlanLimits() — seat caps per plan
    ├── rate-limit.ts       In-memory rate limiters
    ├── stripe.ts           Stripe singleton + planFromPriceId()
    └── utils.ts            cn() re-export
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- A [Neon](https://neon.tech) Postgres database (free tier is fine)
- A [Clerk](https://clerk.com) application
- A [Stripe](https://stripe.com) account with two products created (Pro, Enterprise)

### 1 — Clone and install

```bash
git clone https://github.com/romilwadhwani/saas-starter.git
cd saas-starter
npm install
```

### 2 — Environment variables

Create `.env.local` in the project root:

```env
# Neon Postgres
DATABASE_URL=postgresql://...@...neon.tech:6543/neondb?sslmode=require&pgbouncer=true
DATABASE_URL_UNPOOLED=postgresql://...@...neon.tech:5432/neondb?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3 — Database setup

```bash
# Run migrations
npx prisma migrate dev --config prisma7.config.ts

# Generate the TypeScript client
npx prisma generate --config prisma7.config.ts
```

### 4 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Webhooks

### Clerk

1. In Clerk Dashboard → Webhooks → Add endpoint
2. URL: `https://your-domain/api/webhooks/clerk`
3. Subscribe to: `user.created`
4. Copy the signing secret into `CLERK_WEBHOOK_SECRET`

For local development use [ngrok](https://ngrok.com):
```bash
ngrok http 3000
```

### Stripe

1. In Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-domain/api/webhooks/stripe`
3. Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

For local testing use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/onboarding` | Clerk | Create org + admin membership |
| `POST` | `/api/team/invite` | Clerk Admin | Create 7-day invite link |
| `PATCH` | `/api/team/members/[id]` | Clerk Admin | Update member role |
| `DELETE` | `/api/team/members/[id]` | Clerk Admin | Remove member |
| `POST` | `/api/billing/checkout` | Clerk Admin | Create Stripe Checkout session |
| `POST` | `/api/billing/portal` | Clerk Admin | Create Stripe Customer Portal session |
| `PATCH` | `/api/settings/org` | Clerk Admin | Update org name / slug |
| `DELETE` | `/api/settings/org` | Clerk Admin | Delete organisation |
| `POST` | `/api/webhooks/clerk` | Svix sig | Sync Clerk user to Postgres |
| `POST` | `/api/webhooks/stripe` | Stripe sig | Sync subscription plan to Postgres |

---

## Database Schema

```prisma
model User         { id, clerkId, email, name, avatarUrl, memberships[] }
model Organization { id, name, slug, plan, stripeCustomerId, stripeSubscriptionId,
                     stripeSubscriptionStatus, memberships[], invitations[] }
model Membership   { id, userId, organizationId, role }
model Invitation   { id, email, organizationId, role, token, expiresAt, acceptedAt }

enum Plan { FREE | PRO | ENTERPRISE }
enum Role { ADMIN | MEMBER | VIEWER }
```

