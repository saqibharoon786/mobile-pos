import { AppError } from "../utils/AppError.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate record" });
  }

  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
}
