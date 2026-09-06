import { RateLimiterMemory } from "rate-limiter-flexible";

export const onboardingLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
});

export const inviteLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 60,
});
