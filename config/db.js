require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      ssl: true,
      // Relaxed SSL settings for troubleshooting
      tlsInsecure: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      // Connection timeout settings
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Return null but don't throw error - let application continue
    return null;
  }
};

module.exports = { connectDB, mongoose };
