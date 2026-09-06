import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      memberships: {
        include: { organization: true },
        take: 1,
      },
    },
  });

  // Already has an org — skip onboarding
  if (user?.memberships[0]) {
    redirect(`/dashboard/${user.memberships[0].organization.slug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <OnboardingForm />
    </div>
  );
}
