import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PageProps {
  params: { token: string };
}

function InvalidInvite({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid Invite</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default async function InvitePage({ params }: PageProps) {
  const invitation = await db.invitation.findUnique({
    where: { token: params.token },
    include: { organization: true },
  });

  if (!invitation) {
    return <InvalidInvite message="This invite link is invalid or does not exist." />;
  }

  if (invitation.acceptedAt) {
    return <InvalidInvite message="This invite link has already been used." />;
  }

  if (invitation.expiresAt < new Date()) {
    return <InvalidInvite message="This invite link has expired. Ask an admin to send a new one." />;
  }

  const { userId } = auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/invite/${params.token}`);
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    redirect(`/sign-in?redirect_url=/invite/${params.token}`);
  }

  if (user.email !== invitation.email) {
    return (
      <InvalidInvite message={`This invite was sent to ${invitation.email}. Sign in with that address to accept it.`} />
    );
  }

  const existingMembership = await db.membership.findFirst({
    where: { userId: user.id, organizationId: invitation.organizationId },
  });
  if (existingMembership) {
    redirect(`/dashboard/${invitation.organization.slug}`);
  }

  const roleName = invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase();

  async function accept() {
    "use server";
    await db.$transaction([
      db.membership.create({
        data: {
          userId: user!.id,
          organizationId: invitation!.organizationId,
          role: invitation!.role,
        },
      }),
      db.invitation.update({
        where: { id: invitation!.id },
        data: { acceptedAt: new Date() },
      }),
    ]);
    redirect(`/dashboard/${invitation!.organization.slug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {invitation.organization.name}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join as a <strong>{roleName}</strong>. Accept to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={accept}>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Accept Invite &amp; Join
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
