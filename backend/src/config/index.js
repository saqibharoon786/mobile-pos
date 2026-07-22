import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.join(__dirname, "..", "..");

export const config = {
  port: Number(process.env.PORT) || 5050,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/charge-mart",
  adminEmail: process.env.ADMIN_EMAIL || "inzimam@gmail.com",
  adminPassword: process.env.ADMIN_PASSWORD || "786786",
  authSecret: process.env.AUTH_SECRET || "gul-battery-house-secret-key",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"],
};
