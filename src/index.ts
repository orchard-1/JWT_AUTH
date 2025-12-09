import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";
import { DatabaseConfig } from "./config/database.js";
import { MongoUserRepository } from "./repositories/implementations/MongoUserRepository.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { AuthMiddleware } from "./middleware/AuthMiddleware.js";
import { ErrorMiddleware } from "./middleware/ErrorMiddleware.js";
import { setupSwagger } from "./swagger.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Setup Swagger
setupSwagger(app);

// Initialize repositories
const userRepository = new MongoUserRepository();

// Routes
app.use("/api/auth", createAuthRoutes(userRepository));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  ErrorMiddleware.handle(err, req, res, next);
});



// Start server
async function startServer() {
  try {
    // connect to Redis first
    await connectRedis();

    // connect to database
    await DatabaseConfig.connect();

    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api/auth\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await disconnectRedis();
  await DatabaseConfig.disconnect();
  process.exit(0);
});

startServer();
