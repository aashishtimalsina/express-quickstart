require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// MongoDB connection string - use the one from your .env file
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://aashishdai404:Mdt5TKpC1PyaDFbz@aashish.kxrekft.mongodb.net/test?retryWrites=true&w=majority";

// Connect to MongoDB
console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
    serverSelectionTimeoutMS: 60000,
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    // Create a User schema
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      lastLogin: { type: Date, default: null },
    });

    // Create a User model
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    try {
      // User data
      const userData = {
        name: "Test User",
        email: "hello@gmail.com",
        password: "hello1234", // Will be hashed
        isActive: true,
      };

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log("User already exists. Updating...");

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Update user
        await User.updateOne(
          { email: userData.email },
          {
            $set: {
              password: hashedPassword,
              name: userData.name,
              isActive: userData.isActive,
              updatedAt: new Date(),
            },
          }
        );

        console.log("User updated successfully");
      } else {
        console.log("Creating new user...");

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const newUser = new User({
          ...userData,
          password: hashedPassword,
        });

        await newUser.save();
        console.log("User created successfully");
      }

      // Verify user in database
      const user = await User.findOne({ email: userData.email });
      console.log("User in database:", user ? "Found" : "Not found");
    } catch (error) {
      console.error("Error creating/updating user:", error);
    } finally {
      // Close MongoDB connection
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    }
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
