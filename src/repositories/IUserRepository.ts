import { IUser } from "../entities/User.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(user: IUser): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  addRefreshToken(userId: string, token: string): Promise<void>;
  removeRefreshToken(userId: string, token: string): Promise<void>;
  getRefreshTokens(userId: string): Promise<string[]>;
  findAll(): Promise<IUser[]>;
}
