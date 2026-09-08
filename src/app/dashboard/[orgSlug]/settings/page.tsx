import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SettingsClient } from "@/components/dashboard/settings-client";

interface PageProps {
  params: { orgSlug: string };
}

export default async function SettingsPage({ params }: PageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/onboarding");

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { slug: params.orgSlug } },
    include: { organization: true },
  });
  if (!membership) redirect("/onboarding");

  return (
    <SettingsClient
      orgSlug={membership.organization.slug}
      orgName={membership.organization.name}
      isAdmin={membership.role === "ADMIN"}
    />
  );
}
