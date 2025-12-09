import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";

export class TokenBlacklist {
  static async add(token: string): Promise<void> {
    if (!token) return;
    try {
      const decoded: any = jwt.decode(token) as any;
      const exp = decoded?.exp as number | undefined;
      if (!exp) return;
      const now = Math.floor(Date.now() / 1000);
      const ttl = exp - now;
      if (ttl <= 0) return;
      // store token in redis with TTL (seconds)
      await redisClient.set(`blacklist:${token}`, "1", { EX: ttl });
    } catch (err) {
      console.error("TokenBlacklist.add error", err);
    }
  }

  static async isBlacklisted(token: string): Promise<boolean> {
    if (!token) return false;
    try {
      const v = await redisClient.get(`blacklist:${token}`);
      return !!v;
    } catch (err) {
      console.error("TokenBlacklist.isBlacklisted error", err);
      return false;
    }
  }
}
