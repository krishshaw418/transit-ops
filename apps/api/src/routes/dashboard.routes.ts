import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  getDashboardReports,
  getDashboardSummary,
} from "../services/dashboard.service";

const router = Router();

router.get("/summary", requireAuth, async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/reports", requireAuth, async (_req, res, next) => {
  try {
    const reports = await getDashboardReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
});

export default router;
