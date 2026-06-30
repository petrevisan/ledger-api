import { createClient } from "redis";

export const redisClient = await createClient({ url: process.env.REDIS_URL })
  .on("error", (err) => console.error("Redis Client Error", err))
  .connect();
