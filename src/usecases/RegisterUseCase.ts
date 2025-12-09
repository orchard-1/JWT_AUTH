import { IUserRepository } from "../repositories/IUserRepository.js";
import { IUser, IAuthResponse, UserRole } from "../entities/User.js";
import { PasswordUtil } from "../utils/PasswordUtil.js";
import { JwtUtil } from "../utils/JwtUtil.js";

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    email: string,
    password: string,
    name: string
  ): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hashPassword(password);

    // Create new user
    const newUser: IUser = {
      email,
      password: hashedPassword,
      name,
      role: UserRole.USER,
      isActive: true,
      refreshTokens: []
    };

    return this.userRepository.create(newUser);
  }
}
