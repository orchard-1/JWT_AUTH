import { IUserRepository } from "../repositories/IUserRepository.js";
import { IAuthResponse, IAuthPayload } from "../entities/User.js";
import { PasswordUtil } from "../utils/PasswordUtil.js";
import { JwtUtil } from "../utils/JwtUtil.js";

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(email: string, password: string): Promise<IAuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is not active");
    }

    // Compare passwords
    const isPasswordValid = await PasswordUtil.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const payload: IAuthPayload = {
      userId: user._id!,
      email: user.email,
      role: user.role
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // Save refresh token to database
    await this.userRepository.addRefreshToken(user._id!, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id!,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}
