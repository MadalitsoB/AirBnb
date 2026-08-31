const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.log("MongoDB URI not provided, continuing with demo mode");
      return false;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");
    return true;
  } catch (error) {
    console.log(
      "MongoDB connection failed, continuing in demo mode:",
      error.message,
    );
    return false;
  }
};

module.exports = connectDB;
