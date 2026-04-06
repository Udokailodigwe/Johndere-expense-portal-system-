import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected successfully");
  } catch (error) {
    //   console.error("MongoDB connection error:", error.message);
    //   process.exit(1);
    throw error;
  }
};

export default connectDB;
