require("dotenv").config();
const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Explicitly force IPv4
      family: 4,
      // Increased timeouts for cloud environment
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
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
