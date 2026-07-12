import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/rbac.middleware";
import { createExpense, listExpenses } from "../services/expense.service";
import { createExpenseSchema } from "../validators/expense.validator";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const expenses = await listExpenses();
    res.json(expenses);
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
      const input = createExpenseSchema.parse(req.body);
      const expense = await createExpense(input);
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
