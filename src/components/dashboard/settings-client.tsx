"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsClientProps {
  orgSlug: string;
  orgName: string;
  isAdmin: boolean;
}

export function SettingsClient({ orgSlug, orgName, isAdmin }: SettingsClientProps) {
  const router = useRouter();

  const [name, setName] = useState(orgName);
  const [slug, setSlug] = useState(orgSlug);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const res = await fetch("/api/settings/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgSlug, name, slug }),
    });
    const data = await res.json();

    if (!res.ok) {
      setSaveError(typeof data.error === "string" ? data.error : "Failed to save settings.");
    } else {
      setSaveSuccess(true);
      if (data.slug !== orgSlug) {
        router.push(`/dashboard/${data.slug}/settings`);
      } else {
        router.refresh();
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (deleteConfirm !== orgSlug) return;
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch("/api/settings/org", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgSlug }),
    });
    const data = await res.json();

    if (!res.ok) {
      setDeleteError(typeof data.error === "string" ? data.error : "Failed to delete organisation.");
      setDeleting(false);
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <div className="max-w-2xl space-y-6 p-6">
      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Update your organisation name and URL slug.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organisation name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">URL slug</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">/dashboard/</span>
                <Input
                  id="org-slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  disabled={!isAdmin}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Changing the slug will redirect your dashboard to the new URL.
              </p>
            </div>
            {saveError && <p className="text-sm text-destructive">{saveError}</p>}
            {saveSuccess && (
              <p className="text-sm text-green-600 dark:text-green-400">Settings saved.</p>
            )}
            {isAdmin && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      {isAdmin && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this organisation and all its members, invitations, and data.
              This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Type <strong>{orgSlug}</strong> to confirm
              </Label>
              <Input
                id="delete-confirm"
                placeholder={orgSlug}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
            </div>
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== orgSlug || deleting}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete organisation"}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
