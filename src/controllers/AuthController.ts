import { Request, Response } from "express";
import { RegisterUseCase } from "../usecases/RegisterUseCase.js";
import { LoginUseCase } from "../usecases/LoginUseCase.js";
import { RefreshTokenUseCase } from "../usecases/RefreshTokenUseCase.js";
import { LogoutUseCase } from "../usecases/LogoutUseCase.js";
import { GetUserUseCase } from "../usecases/GetUserUseCase.js";
import { IUserRepository } from "../repositories/IUserRepository.js";

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;
  private refreshTokenUseCase: RefreshTokenUseCase;
  private logoutUseCase: LogoutUseCase;
  private getUserUseCase: GetUserUseCase;

  constructor(userRepository: IUserRepository) {
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.loginUseCase = new LoginUseCase(userRepository);
    this.refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
    this.logoutUseCase = new LogoutUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      const user = await this.registerUseCase.execute(email, password, name);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Missing email or password" });
        return;
      }

      const result = await this.loginUseCase.execute(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ message: "Missing refresh token" });
        return;
      }

      const result = await this.refreshTokenUseCase.execute(refreshToken);

      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!req.user || !refreshToken) {
        res.status(400).json({ message: "Missing user or refresh token" });
        return;
      }

      // If an access token was provided in the Authorization header, blacklist it immediately
      const authHeader = req.headers.authorization as string | undefined;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const accessToken = authHeader.substring(7);
        const { TokenBlacklist } = await import("../utils/TokenBlacklist.js");
        await TokenBlacklist.add(accessToken);
      }

      await this.logoutUseCase.execute(req.user.userId, refreshToken);

      res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await this.getUserUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
