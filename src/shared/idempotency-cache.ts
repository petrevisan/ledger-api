import { redisClient } from "../infra/redis/client.js";

const TTL_SECONDS = 5 * 60;
const IN_PROGRESS = "in-progress";

const buildKey = (idempotencyKey: string) => `idempotency:${idempotencyKey}`;

export type CachedResponse = {
  status: number;
  body: unknown;
};

export type ClaimResult =
  | { outcome: "claimed" }
  | { outcome: "in_progress" }
  | { outcome: "cached"; response: CachedResponse };

export async function claim(idempotencyKey: string): Promise<ClaimResult> {
  const wasClaimed = await redisClient.set(
    buildKey(idempotencyKey),
    IN_PROGRESS,
    { NX: true, EX: TTL_SECONDS },
  );

  if (wasClaimed === "OK") {
    return { outcome: "claimed" };
  }

  const stored = await redisClient.get(buildKey(idempotencyKey));

  if (stored === null || stored === IN_PROGRESS) {
    return { outcome: "in_progress" };
  }

  return { outcome: "cached", response: JSON.parse(stored) as CachedResponse };
}

export async function store(
  idempotencyKey: string,
  response: CachedResponse,
): Promise<void> {
  await redisClient.set(buildKey(idempotencyKey), JSON.stringify(response), {
    EX: TTL_SECONDS,
  });
}

export async function release(idempotencyKey: string): Promise<void> {
  await redisClient.del(buildKey(idempotencyKey));
}
