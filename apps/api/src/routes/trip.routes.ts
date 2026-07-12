import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  listTrips,
} from "../services/trip.service";
import {
  cancelTripSchema,
  completeTripSchema,
  createTripSchema,
} from "../validators/trip.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const trips = await listTrips();
    res.json(trips);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "DRIVER"),
  async (req, res, next) => {
    try {
      const input = createTripSchema.parse(req.body);
      const trip = await createTrip({
        ...input,
        createdById: req.user!.id,
      });
      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/dispatch",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "DRIVER"),
  async (req, res, next) => {
    try {
      const trip = await dispatchTrip(req.params.id as string);
      res.json(trip);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/complete",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "DRIVER"),
  async (req, res, next) => {
    try {
      const input = completeTripSchema.parse(req.body);
      const trip = await completeTrip(req.params.id as string, input);
      res.json(trip);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/cancel",
  requireAuth,
  requireRole("ADMIN", "FLEET_MANAGER", "DRIVER"),
  async (req, res, next) => {
    try {
      const input = cancelTripSchema.parse(req.body);
      const trip = await cancelTrip(req.params.id as string, input);
      res.json(trip);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
