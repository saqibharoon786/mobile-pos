import mongoose from "mongoose";
import { config } from "../config/index.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${config.mongoUri}`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}

export { mongoose };
