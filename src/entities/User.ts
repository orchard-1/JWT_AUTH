export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator"
}

export interface IUser {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  refreshTokens: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}
