import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
    console.log(`Database : ${connection.connection.name}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;