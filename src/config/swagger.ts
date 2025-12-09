import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "JWT Auth API",
      version: "1.0.0",
      description: "API documentation for JWT Authentication Server (Express, MongoDB, TypeScript, Clean Architecture)",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: [
    "./src/swaggerDocs.ts",
    "./dist/swaggerDocs.js"
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
