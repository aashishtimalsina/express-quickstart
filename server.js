const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swaggerConfig");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const { connectDB } = require("./config/db");
require("dotenv").config();
const app = express();
app.use(express.json());
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
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API is running. Visit /api-docs for documentation",
    dbStatus: global.dbConnected ? "connected" : "disconnected",
  });
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
global.dbConnected = false;
let connectionAttempts = 0;
const maxAttempts = 3;

function attemptConnection() {
  connectionAttempts++;
  connectDB()
    .then((connection) => {
      if (connection) {
        global.dbConnected = true;
      } else {
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

attemptConnection();

const dbCheckMiddleware = (req, res, next) => {
  if (!global.dbConnected) {
    return res.status(503).json({
      message: "Database is currently unavailable. Please try again later.",
    });
  }
  next();
};

app.use("/api/users", dbCheckMiddleware, userRoutes);
app.use("/api/auth", dbCheckMiddleware, authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
