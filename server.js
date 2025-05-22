const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());

// Add CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

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
console.log("Attempting to connect to MongoDB...");
console.log("MongoDB URI:", process.env.MONGODB_URI ? "Configured" : "Missing");

// Multiple connection attempts with a delay between them
let connectionAttempts = 0;
const maxAttempts = 3;

function attemptConnection() {
  connectionAttempts++;
  console.log(`Connection attempt ${connectionAttempts} of ${maxAttempts}`);

  connectDB()
    .then((connection) => {
      if (connection) {
        console.log("MongoDB connected successfully!");
        global.dbConnected = true;
      } else {
        console.log("Failed to connect to MongoDB");
        retryConnection();
      }
    })
    .catch((err) => {
      console.error("Database connection error:", err);
      retryConnection();
    });
}

function retryConnection() {
  if (connectionAttempts < maxAttempts) {
    console.log(`Retrying connection in 5 seconds...`);
    setTimeout(attemptConnection, 5000);
  } else {
    console.log(
      "All connection attempts failed, starting server without database connection"
    );
  }
}

// Start the first connection attempt
attemptConnection();

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
