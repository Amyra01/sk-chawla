import { createAdminSupabaseClient, isSupabaseAdminConfigured } from "./supabase/admin";

const localRateStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  limit = 20,
  windowSeconds = 60
): Promise<{ allowed: boolean; remaining: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken && !redisUrl.includes("your-upstash")) {
    try {
      const incrRes = await fetch(`${redisUrl}/incr/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${redisToken}` },
      });
      const incrData = (await incrRes.json()) as { result: number };
      const count = incrData.result ?? 1;
      if (count === 1) {
        await fetch(
          `${redisUrl}/expire/${encodeURIComponent(key)}/${windowSeconds}`,
          { headers: { Authorization: `Bearer ${redisToken}` } }
        );
      }
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
      };
    } catch {
      // Fall back to in-memory if Upstash unreachable
    }
  }

  const now = Date.now();
  const entry = localRateStore.get(key);
  if (!entry || entry.resetAt < now) {
    localRateStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  };
}

export async function verifyTurnstileToken(token?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.includes("your-cloudflare")) {
    // Allow local dev when Turnstile is not yet configured
    return true;
  }
  if (!token) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export async function logAuditEvent(params: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  if (!isSupabaseAdminConfigured()) return;
  try {
    const admin = createAdminSupabaseClient();
    await admin.from("audit_logs").insert({
      actor_id: params.actorId ?? null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      details: params.details ?? {},
      ip_address: params.ipAddress ?? null,
    });
  } catch {
    // Non-blocking audit log
  }
}
