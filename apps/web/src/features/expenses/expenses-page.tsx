import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getTrips } from "@/features/trips/api";
import { getVehicles } from "@/features/vehicles/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createExpense,
  getExpenses,
  type CreateExpenseInput,
  type ExpenseType,
} from "./api";

const initialForm: CreateExpenseInput = {
  vehicleId: "",
  tripId: "",
  type: "OTHER",
  amount: 0,
  description: "",
  expenseDate: "",
};

function getExpenseBadge(type: ExpenseType) {
  switch (type) {
    case "FUEL":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-1 rounded-md">
          Fuel
        </Badge>
      );
    case "MAINTENANCE":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 px-1 rounded-md">
          Maintenance
        </Badge>
      );
    case "TOLL":
      return (
        <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 px-1 rounded-md">
          Toll
        </Badge>
      );
    case "REPAIR":
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-1 rounded-md">
          Repair
        </Badge>
      );
    case "OTHER":
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 px-1 rounded-md">
          Other
        </Badge>
      );
    default:
      return <Badge variant="secondary">{type}</Badge>;
  }
}

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateExpenseInput>(initialForm);

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["expenses"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] }),
      ]);
      toast.success("Expense created successfully");
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create expense",
      );
    },
  });

  function updateField<K extends keyof CreateExpenseInput>(
    key: K,
    value: CreateExpenseInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createMutation.mutate({
      ...form,
      tripId: form.tripId || undefined,
      expenseDate: new Date(form.expenseDate).toISOString(),
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track operational spending across vehicles and trips.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Expense</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <select
                  id="vehicleId"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.vehicleId}
                  onChange={(e) => updateField("vehicleId", e.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {vehiclesQuery.data?.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNo} - {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripId">Trip (optional)</Label>
                <select
                  id="tripId"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.tripId}
                  onChange={(e) => updateField("tripId", e.target.value)}
                >
                  <option value="">No trip</option>
                  {tripsQuery.data?.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.tripCode} - {trip.source} to {trip.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Expense Type</Label>
                <select
                  id="type"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) =>
                    updateField("type", e.target.value as ExpenseType)
                  }
                >
                  <option value="FUEL">Fuel</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="TOLL">Toll</option>
                  <option value="REPAIR">Repair</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    updateField("amount", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date</Label>
                <Input
                  id="expenseDate"
                  type="datetime-local"
                  value={form.expenseDate}
                  onChange={(e) => updateField("expenseDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description ?? ""}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={createMutation.isPending}
                type="submit"
              >
                {createMutation.isPending ? "Creating..." : "Create Expense"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesQuery.isLoading ? (
            <p>Loading expenses...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesQuery.data?.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="font-medium">
                        {expense.vehicle.registrationNo}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {expense.vehicle.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.trip ? (
                        <div>
                          <div>{expense.trip.tripCode}</div>
                          <div className="text-xs text-muted-foreground">
                            {expense.trip.source} to {expense.trip.destination}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No trip</span>
                      )}
                    </TableCell>
                    <TableCell>{getExpenseBadge(expense.type)}</TableCell>
                    <TableCell>{expense.amount}</TableCell>
                    <TableCell>{expense.description ?? "-"}</TableCell>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
