const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Add a basic homepage route first, so the app can start even without DB
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API is running. Visit /api-docs for documentation",
    dbStatus: global.dbConnected ? "connected" : "disconnected",
  });
});

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Try to connect to MongoDB but continue if it fails
global.dbConnected = false;
connectDB()
  .then((connection) => {
    if (connection) {
      console.log("MongoDB connected successfully");
      global.dbConnected = true;
    } else {
      console.log("Running without database connection");
    }
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    console.log("Starting server without database connection");
  });

// Routes - with DB connection check middleware
const dbCheckMiddleware = (req, res, next) => {
  if (!global.dbConnected) {
    return res.status(503).json({
      message: "Database is currently unavailable. Please try again later.",
    });
  }
  next();
};

// Use the middleware for database-dependent routes
app.use("/api/users", dbCheckMiddleware, userRoutes);
app.use("/api/auth", dbCheckMiddleware, authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
