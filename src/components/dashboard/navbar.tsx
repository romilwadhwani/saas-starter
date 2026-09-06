"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { UserButton } from "@clerk/nextjs";

interface NavbarProps {
  orgSlug: string;
  onMenuClick: () => void;
}

function getPageTitle(pathname: string, orgSlug: string): string {
  const base = `/dashboard/${orgSlug}`;
  if (pathname === base) return "Dashboard";
  if (pathname.startsWith(`${base}/team`)) return "Team";
  if (pathname.startsWith(`${base}/billing`)) return "Billing";
  if (pathname.startsWith(`${base}/settings`)) return "Settings";
  return "Dashboard";
}

export function Navbar({ orgSlug, onMenuClick }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const pageTitle = getPageTitle(pathname, orgSlug);

  return (
    <header className="flex items-center justify-between border-b bg-background px-4 py-3 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 hover:bg-muted text-foreground md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-md p-1.5 hover:bg-muted text-foreground"
          aria-label="Toggle theme"
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )
          ) : (
            <div className="h-5 w-5" />
          )}
        </button>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
