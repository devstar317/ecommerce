import mongoose from "mongoose";

const connectDB = (handler) => async (req, res) => {
  try {
    if (mongoose.connections[0].readyState) {
      // Use current db connection
      return handler(req, res);
    }
    // Use new db connection
    mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    return handler(req, res);
  } catch (err) {
    console.log("DATABASE CONNETCTION FAILED");
    console.log(err.message);
  }
};

export default connectDB;
