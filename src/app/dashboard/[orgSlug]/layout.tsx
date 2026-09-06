import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/dashboard/shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { orgSlug: string };
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  // Org-check — second middleware layer (runs server-side before any dashboard page).
  // Prisma requires Node.js runtime so this check lives here, not in middleware.ts.
  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");

  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      organization: { slug: params.orgSlug },
    },
    include: { organization: true },
  });

  if (!membership) redirect("/onboarding");

  return (
    <DashboardShell
      orgSlug={membership.organization.slug}
      orgName={membership.organization.name}
    >
      {children}
    </DashboardShell>
  );
}
