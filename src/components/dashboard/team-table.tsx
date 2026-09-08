"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface TeamTableProps {
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
}

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MEMBER: "secondary",
  VIEWER: "outline",
};

export function TeamTable({ members, currentUserId, isAdmin }: TeamTableProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function updateRole(memberId: string, role: string) {
    setBusy(memberId + ":role");
    await fetch(`/api/team/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusy(null);
    router.refresh();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member from the organisation?")) return;
    setBusy(memberId + ":remove");
    await fetch(`/api/team/members/${memberId}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            {isAdmin && (
              <th className="w-12 px-4 py-3 text-left font-medium text-muted-foreground" />
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isSelf = m.user.id === currentUserId;
            return (
              <tr
                key={m.id}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">
                  {m.user.name ?? "—"}
                  {isSelf && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{m.user.email}</td>
                <td className="px-4 py-3">
                  {isAdmin && !isSelf ? (
                    <select
                      value={m.role}
                      onChange={(e) => updateRole(m.id, e.target.value)}
                      disabled={busy === m.id + ":role"}
                      className="rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  ) : (
                    <Badge variant={roleVariant[m.role] ?? "outline"}>
                      {m.role.charAt(0) + m.role.slice(1).toLowerCase()}
                    </Badge>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <button
                        onClick={() => removeMember(m.id)}
                        disabled={busy === m.id + ":remove"}
                        aria-label="Remove member"
                        className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
