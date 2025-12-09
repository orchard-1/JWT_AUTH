import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/JwtUtil.js";
import { UserRole } from "../entities/User.js";
import { TokenBlacklist } from "../utils/TokenBlacklist.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export class AuthMiddleware {
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid authorization header" });
        return;
      }

      const token = authHeader.substring(7);

      // Check if token is blacklisted (user logged out)
      const isBlacklisted = await TokenBlacklist.isBlacklisted(token);
      if (isBlacklisted) {
        res.status(401).json({ message: "Token has been revoked" });
        return;
      }

      const payload = JwtUtil.verifyAccessToken(token);

      if (!payload) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }

      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ message: "Authentication failed" });
    }
  }

  static authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      next();
    };
  }
}
