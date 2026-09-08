"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamTable } from "@/components/dashboard/team-table";
import { InviteModal } from "@/components/dashboard/invite-modal";
import { UserPlus } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface TeamPageClientProps {
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  orgSlug: string;
  plan: string;
  memberCount: number;
  maxMembers: number;
}

export function TeamPageClient({
  members,
  currentUserId,
  isAdmin,
  orgSlug,
  plan,
  memberCount,
  maxMembers,
}: TeamPageClientProps) {
  const [showInvite, setShowInvite] = useState(false);

  const atLimit = memberCount >= maxMembers;
  const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();
  const seatLabel = maxMembers === Infinity ? "∞" : maxMembers;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              {memberCount} / {seatLabel} seats used
              <Badge variant="secondary">{planLabel} plan</Badge>
            </CardDescription>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              disabled={atLimit}
              title={atLimit ? "Member limit reached — upgrade to add more." : undefined}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </button>
          )}
        </CardHeader>
        <CardContent>
          <TeamTable
            members={members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        </CardContent>
      </Card>

      {showInvite && (
        <InviteModal orgSlug={orgSlug} onClose={() => setShowInvite(false)} />
      )}
    </div>
  );
}
