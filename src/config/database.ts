import mongoose from "mongoose";

export class DatabaseConfig {
  static async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jwt-auth";
      
      await mongoose.connect(mongoUri);
      
      console.log("✓ MongoDB connected successfully");
    } catch (error) {
      console.error("✗ MongoDB connection failed:", error);
      process.exit(1);
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
    } catch (error) {
      console.error("✗ MongoDB disconnection failed:", error);
    }
  }
}
