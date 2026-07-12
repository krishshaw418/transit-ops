import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import {
  createDriver,
  listDrivers,
  updateDriver,
} from "../services/driver.service";
import {
  createDriverSchema,
  updateDriverSchema,
} from "../validators/driver.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const drivers = await listDrivers();
    res.json(drivers);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"),
  async (req, res, next) => {
    try {
      const input = createDriverSchema.parse(req.body);
      const driver = await createDriver(input);
      res.status(201).json(driver);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"),
  async (req, res, next) => {
    try {
      const input = updateDriverSchema.parse(req.body);
      const driver = await updateDriver(req.params.id as string, input);
      res.json(driver);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
