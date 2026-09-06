"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface ShellProps {
  children: React.ReactNode;
  orgSlug: string;
  orgName: string;
}

export function DashboardShell({ children, orgSlug, orgName }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 border-r border-sidebar-border transition-transform duration-200 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          orgSlug={orgSlug}
          orgName={orgName}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar orgSlug={orgSlug} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
