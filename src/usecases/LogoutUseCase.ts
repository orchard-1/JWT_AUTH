import { IUserRepository } from "../repositories/IUserRepository.js";
import { TokenBlacklist } from "../utils/TokenBlacklist.js";

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, refreshToken: string): Promise<void> {
    // remove refresh token from persistent store
    await this.userRepository.removeRefreshToken(userId, refreshToken);
    // add refresh token to Redis blacklist for immediate invalidation
    await TokenBlacklist.add(refreshToken);
  }
}
