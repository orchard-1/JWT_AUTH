import { IUserRepository } from "../repositories/IUserRepository.js";
import { IAuthResponse, IAuthPayload } from "../entities/User.js";
import { JwtUtil } from "../utils/JwtUtil.js";
import { TokenBlacklist } from "../utils/TokenBlacklist.js";

export class RefreshTokenUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(refreshToken: string): Promise<IAuthResponse> {
    // Check if the refresh token was blacklisted (logged out)
    const isBlacklisted = await TokenBlacklist.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new Error("Refresh token is revoked");
    }

    // Verify refresh token
    const payload = JwtUtil.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("Invalid refresh token");
    }

    // Get user
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if refresh token exists in user's tokens
    const tokens = await this.userRepository.getRefreshTokens(user._id!);
    if (!tokens.includes(refreshToken)) {
      throw new Error("Refresh token not found or expired");
    }

    // Generate new tokens
    const newPayload: IAuthPayload = {
      userId: user._id!,
      email: user.email,
      role: user.role
    };

    const accessToken = JwtUtil.generateAccessToken(newPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(newPayload);

    // Update refresh token in database
    await this.userRepository.removeRefreshToken(user._id!, refreshToken);
    await this.userRepository.addRefreshToken(user._id!, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id!,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}
