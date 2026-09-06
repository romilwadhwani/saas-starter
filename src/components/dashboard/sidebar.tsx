"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "" },
  { label: "Team", icon: Users, href: "/team" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  orgSlug: string;
  orgName: string;
  onClose: () => void;
}

export function Sidebar({ orgSlug, orgName, onClose }: SidebarProps) {
  const pathname = usePathname();
  const base = `/dashboard/${orgSlug}`;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
        <span className="font-semibold text-sidebar-foreground truncate">{orgName}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded-md p-1 hover:bg-sidebar-accent text-sidebar-foreground md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const href = `${base}${item.href}`;
          const isActive =
            item.href === "" ? pathname === base : pathname.startsWith(href);

          return (
            <Link
              key={item.label}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
