import { createClient } from "redis";

const url = process.env.REDIS_URL || "redis://default:XWZK931LIqOIxrOvP2Bru7ILMiuLvRfS@redis-16129.c281.us-east-1-2.ec2.cloud.redislabs.com:16129";
export const redisClient = createClient({ url });

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("✓ Redis connected successfully");
  } catch (err) {
    console.error("✗ Redis connection failed:", err);
  }
}

export async function disconnectRedis() {
  try {
    await redisClient.quit();
    console.log("✓ Redis disconnected");
  } catch (err) {
    console.error("✗ Redis disconnection failed:", err);
  }
}
