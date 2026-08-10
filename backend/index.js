import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./Config/db.js";

import authRoutes from "./Route/authRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());


app.use("/api/auth", authRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Server running on Port ${PORT}`);
});