import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import {
  createVehicle,
  listVehicles,
  updateVehicle,
} from "../services/vehicle.service";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../validators/vehicle.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const vehicles = await listVehicles();
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER"),
  async (req, res, next) => {
    try {
      const input = createVehicleSchema.parse(req.body);
      const vehicle = await createVehicle(input);
      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER"),
  async (req, res, next) => {
    try {
      const input = updateVehicleSchema.parse(req.body);
      const vehicle = await updateVehicle(req.params.id as string, input);
      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
