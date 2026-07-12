import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
