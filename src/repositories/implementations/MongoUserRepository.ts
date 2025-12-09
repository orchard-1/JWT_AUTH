import { IUserRepository } from "../IUserRepository.js";
import { IUser, UserRole } from "../../entities/User.js";
import { UserModel } from "../models/UserModel.js";

export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return this.toDomain(user);
  }

  async create(user: IUser): Promise<IUser> {
    const newUser = new UserModel({
      email: user.email.toLowerCase(),
      password: user.password,
      name: user.name,
      role: user.role || UserRole.USER,
      isActive: user.isActive !== false
    });
    await newUser.save();
    return this.toDomain(newUser);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
      new: true
    });
    if (!updatedUser) return null;
    return this.toDomain(updatedUser);
  }

  async addRefreshToken(userId: string, token: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $push: { refreshTokens: token } }
    );
  }

  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $pull: { refreshTokens: token } }
    );
  }

  async getRefreshTokens(userId: string): Promise<string[]> {
    const user = await UserModel.findById(userId);
    return user?.refreshTokens || [];
  }

  async findAll(): Promise<IUser[]> {
    const users = await UserModel.find();
    return users.map((user: any) => this.toDomain(user));
  }

  private toDomain(user: any): IUser {
    return {
      _id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      refreshTokens: user.refreshTokens,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
