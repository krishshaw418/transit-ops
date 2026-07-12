import { apiFetch } from "@/lib/api-client";

export type ExpenseType = "FUEL" | "MAINTENANCE" | "TOLL" | "REPAIR" | "OTHER";

export type Expense = {
  id: string;
  type: ExpenseType;
  amount: string | number;
  description: string | null;
  expenseDate: string;
  vehicleId: string;
  tripId: string | null;
  vehicle: {
    id: string;
    registrationNo: string;
    name: string;
    type: string;
  };
  trip: {
    id: string;
    tripCode: string;
    source: string;
    destination: string;
  } | null;
};

export type CreateExpenseInput = {
  vehicleId: string;
  tripId?: string;
  type: ExpenseType;
  amount: number;
  description?: string;
  expenseDate: string;
};

export function getExpenses() {
  return apiFetch<Expense[]>("/expenses");
}

export function createExpense(payload: CreateExpenseInput) {
  return apiFetch<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
