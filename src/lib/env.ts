const REQUIRED_SERVER_VARS = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_ENTERPRISE_PRICE_ID",
] as const;

const REQUIRED_PUBLIC_VARS = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
] as const;

function validateEnv() {
  const missing: string[] = [];

  for (const key of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  for (const key of REQUIRED_PUBLIC_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nAdd them to .env.local and restart the server.`
    );
  }
}

if (process.env.NODE_ENV !== "test") {
  validateEnv();
}
