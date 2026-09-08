import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan";
import { TeamPageClient } from "@/components/dashboard/team-page-client";

interface PageProps {
  params: { orgSlug: string };
}

export default async function TeamPage({ params }: PageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: params.orgSlug } },
    include: {
      organization: {
        include: {
          memberships: { include: { user: true }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!membership) redirect("/onboarding");

  const org = membership.organization;
  const limits = getPlanLimits(org.plan);

  return (
    <TeamPageClient
      members={org.memberships.map((m) => ({
        id: m.id,
        role: m.role,
        user: { id: m.user.id, name: m.user.name, email: m.user.email },
      }))}
      currentUserId={user.id}
      isAdmin={membership.role === "ADMIN"}
      orgSlug={params.orgSlug}
      plan={org.plan}
      memberCount={org.memberships.length}
      maxMembers={limits.maxMembers}
    />
  );
}
