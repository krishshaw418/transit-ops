import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import {
  completeMaintenanceLog,
  createMaintenanceLog,
  listMaintenanceLogs,
  startMaintenanceLog,
} from "../services/maintenance.service";
import {
  completeMaintenanceSchema,
  createMaintenanceSchema,
  startMaintenanceSchema,
} from "../validators/maintenance.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const maintenanceLogs = await listMaintenanceLogs();
    res.json(maintenanceLogs);
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
      const input = createMaintenanceSchema.parse(req.body);
      const maintenanceLog = await createMaintenanceLog({
        ...input,
        createdById: req.user!.id,
      });
      res.status(201).json(maintenanceLog);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/start",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER"),
  async (req, res, next) => {
    try {
      const input = startMaintenanceSchema.parse(req.body);
      const maintenanceLog = await startMaintenanceLog(
        req.params.id as string,
        input,
      );
      res.json(maintenanceLog);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/complete",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER"),
  async (req, res, next) => {
    try {
      const input = completeMaintenanceSchema.parse(req.body);
      const maintenanceLog = await completeMaintenanceLog(
        req.params.id as string,
        input,
      );
      res.json(maintenanceLog);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
