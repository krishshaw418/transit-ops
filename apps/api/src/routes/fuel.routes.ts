import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import { createFuelLog, listFuelLogs } from "../services/fuel.service";
import { createFuelLogSchema } from "../validators/fuel.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const fuelLogs = await listFuelLogs();
    res.json(fuelLogs);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"),
  async (req, res, next) => {
    try {
      const input = createFuelLogSchema.parse(req.body);
      const fuelLog = await createFuelLog(input);
      res.status(201).json(fuelLog);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
