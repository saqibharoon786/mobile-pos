import crypto from "crypto";
import { config } from "../config/index.js";
import { AppError } from "../utils/AppError.js";

function sign(payload) {
  return crypto.createHmac("sha256", config.authSecret).update(payload).digest("hex");
}

export function createSessionToken(email) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${email}:${exp}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifySessionToken(token) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split(":");
    if (parts.length !== 3) return null;
    const [email, exp, signature] = parts;
    const payload = `${email}:${exp}`;
    if (sign(payload) !== signature) return null;
    if (Date.now() > Number(exp)) return null;
    return { email };
  } catch {
    return null;
  }
}

export const authService = {
  login(email, password) {
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const adminEmail = config.adminEmail.trim().toLowerCase();

    if (normalizedEmail !== adminEmail || password !== config.adminPassword) {
      throw new AppError("Email ya password ghalat hai", 401);
    }

    return {
      token: createSessionToken(config.adminEmail),
      user: { email: config.adminEmail, name: "Gul Battery House" },
    };
  },

  verify(token) {
    const user = verifySessionToken(token);
    if (!user) throw new AppError("Session expire ho gaya", 401);
    return { user: { email: user.email, name: "Gul Battery House" } };
  },
};
