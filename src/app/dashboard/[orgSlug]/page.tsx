import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberGrowthChart } from "@/components/dashboard/member-growth-chart";
import { Users, CreditCard, Calendar, Link } from "lucide-react";

interface PageProps {
  params: { orgSlug: string };
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

function buildGrowthData(memberships: { createdAt: Date }[]) {
  if (memberships.length === 0) return [];

  const weekMap = new Map<string, number>();
  for (const m of memberships) {
    const week = getWeekStart(new Date(m.createdAt));
    weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
  }

  let total = 0;
  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => {
      total += count;
      return { week, members: total };
    });
}

function formatPlan(plan: string) {
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

export default async function DashboardPage({ params }: PageProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const org = await db.organization.findUnique({
    where: { slug: params.orgSlug },
    include: {
      memberships: {
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      },
    },
  });

  if (!org) redirect("/onboarding");

  const chartData = buildGrowthData(org.memberships);

  const metrics = [
    {
      title: "Total Members",
      value: org.memberships.length.toString(),
      icon: Users,
    },
    {
      title: "Active Plan",
      value: formatPlan(org.plan),
      icon: CreditCard,
    },
    {
      title: "Account Created",
      value: new Date(org.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      icon: Calendar,
    },
    {
      title: "Organisation Slug",
      value: org.slug,
      icon: Link,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {m.title}
              </CardTitle>
              <m.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold truncate">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <MemberGrowthChart data={chartData} />
    </div>
  );
}
