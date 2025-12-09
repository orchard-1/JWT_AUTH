import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../../entities/User.js";

interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshTokens: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);
export type { IUserDocument };
