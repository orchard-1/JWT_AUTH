import { Router, Request, Response } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { AuthMiddleware } from "../middleware/AuthMiddleware.js";
import { UserRole } from "../entities/User.js";
import { IUserRepository } from "../repositories/IUserRepository.js";

export function createAuthRoutes(userRepository: IUserRepository): Router {
  const router = Router();
  const authController = new AuthController(userRepository);

  // Public routes
  router.post("/register", (req, res) => authController.register(req, res));
  router.post("/login", (req, res) => authController.login(req, res));
  router.post("/refresh", (req, res) => authController.refreshToken(req, res));

  // Protected routes
  router.post(
    "/logout",
    (req, res, next) => AuthMiddleware.authenticate(req, res, next),
    (req, res) => authController.logout(req, res)
  );

  router.get(
    "/me",
    (req, res, next) => AuthMiddleware.authenticate(req, res, next),
    (req, res) => authController.getUser(req, res)
  );

  // Admin only route example
  router.get(
    "/admin/users",
    (req, res, next) => AuthMiddleware.authenticate(req, res, next),
    AuthMiddleware.authorize(UserRole.ADMIN),
    (req, res) => {
      res.json({
        success: true,
        message: "Admin only endpoint - requires ADMIN role"
      });
    }
  );

  return router;
}
