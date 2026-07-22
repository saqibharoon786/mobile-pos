import { authService } from "../services/auth.service.js";

export const authController = {
  async login(req, res) {
    const { email, password } = req.body;
    res.json(await authService.login(email, password));
  },

  async me(req, res) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.body?.token;
    res.json(authService.verify(token));
  },
};
