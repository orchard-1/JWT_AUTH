import { IUserRepository } from "../repositories/IUserRepository.js";

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Return user without password
    const { password, refreshTokens, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
  }
}
