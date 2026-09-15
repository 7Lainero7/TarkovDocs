import { createHash, timingSafeEqual } from "crypto";

interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
  lockLevel: number;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const CLEANUP_THRESHOLD = 100;
const LOCK_DURATIONS_MS = [
  60 * 1000,            // 1 минута
  5 * 60 * 1000,        // 5 минут
  15 * 60 * 1000,       // 15 минут
  60 * 60 * 1000,       // 1 час
  24 * 60 * 60 * 1000,  // 24 часа
];

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function cleanupExpired(now: number): void {
  if (store.size < CLEANUP_THRESHOLD) return;
  for (const [key, entry] of store.entries()) {
    if (entry.lockedUntil <= now && entry.attempts === 0) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);
  const entry = store.get(key);
  if (!entry) return { allowed: true, retryAfterSeconds: 0 };
  if (entry.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = store.get(key) ?? { attempts: 0, lockedUntil: 0, lockLevel: 0 };
  entry.attempts += 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    const duration =
      LOCK_DURATIONS_MS[Math.min(entry.lockLevel, LOCK_DURATIONS_MS.length - 1)];
    entry.lockedUntil = now + duration;
    entry.lockLevel += 1;
    entry.attempts = 0;
  }
  store.set(key, entry);
}

export function recordSuccess(key: string): void {
  store.delete(key);
}

export function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}