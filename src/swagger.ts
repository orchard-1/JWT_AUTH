import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

export function setupSwagger(app: import("express").Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
