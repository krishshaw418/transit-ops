import { Router } from "express";
import authRoutes from "./auth.routes";
import driverRoutes from "./driver.routes";
import expenseRoutes from "./expense.routes";
import fuelRoutes from "./fuel.routes";
import maintenanceRoutes from "./maintenance.routes";
import tripRoutes from "./trip.routes";
import vehicleRoutes from "./vehicle.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/fuel-logs", fuelRoutes);
router.use("/expenses", expenseRoutes);

export default router;
