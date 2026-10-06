const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MarketFlow",
    });

    console.log("Database connected successfully");
  } catch (error) {
    throw error;
  }
};

module.exports = connectDB;