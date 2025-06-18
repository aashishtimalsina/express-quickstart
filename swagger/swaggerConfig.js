const swaggerJsdoc = require("swagger-jsdoc");
require("dotenv").config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: process.env.APP_NAME || "API Documentation",
      version: "1.1.0",
      description: "API documentation for the application",
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Scans for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
