import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { IAuthPayload } from "../entities/User.js";

export class JwtUtil {
  static generateAccessToken(payload: IAuthPayload): string {
    const options: any = {
      expiresIn: (process.env.JWT_EXPIRE as string) || "7d"
    };
    return jwt.sign(payload, process.env.JWT_SECRET as string, options);
  }

  static generateRefreshToken(payload: IAuthPayload): string {
    const options: any = {
      expiresIn: (process.env.JWT_REFRESH_EXPIRE as string) || "30d"
    };
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, options);
  }

  static verifyAccessToken(token: string): IAuthPayload | null {
    try {
      const options: VerifyOptions = {};
      return jwt.verify(token, process.env.JWT_SECRET as string, options) as IAuthPayload;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): IAuthPayload | null {
    try {
      const options: VerifyOptions = {};
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, options) as IAuthPayload;
    } catch (error) {
      return null;
    }
  }
}
