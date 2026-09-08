export type PlanLimits = { maxMembers: number };

export function getPlanLimits(plan: string): PlanLimits {
  switch (plan) {
    case "PRO":        return { maxMembers: 20 };
    case "ENTERPRISE": return { maxMembers: Infinity };
    default:           return { maxMembers: 3 };
  }
}
