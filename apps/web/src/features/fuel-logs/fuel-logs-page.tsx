import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getTrips } from "@/features/trips/api";
import { getVehicles } from "@/features/vehicles/api";
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
import { useAuthStore } from "@/stores/auth-store";
import { canManageFuelLogs } from "@/lib/permissions";
import { createFuelLog, getFuelLogs, type CreateFuelLogInput } from "./api";

const initialForm: CreateFuelLogInput = {
  vehicleId: "",
  tripId: "",
  liters: 0,
  cost: 0,
  odometerKm: 0,
  loggedAt: "",
  notes: "",
};

export function FuelLogsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateFuelLogInput>(initialForm);
  const user = useAuthStore((state) => state.user);
  const canCreate = canManageFuelLogs(user?.role);

  const fuelLogsQuery = useQuery({
    queryKey: ["fuel-logs"],
    queryFn: getFuelLogs,
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
    mutationFn: createFuelLog,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["fuel-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-reports"] }),
      ]);
      toast.success("Fuel log created successfully");
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create fuel log",
      );
    },
  });

  const isSubmitDisabled = useMemo(
    () =>
      !form.vehicleId ||
      form.liters <= 0 ||
      form.cost < 0 ||
      (form.odometerKm ?? 0) < 0 ||
      !form.loggedAt,
    [form],
  );

  function updateField<K extends keyof CreateFuelLogInput>(
    key: K,
    value: CreateFuelLogInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.loggedAt) {
      toast.error("Please select a valid logged date and time");
      return;
    }

    createMutation.mutate({
      ...form,
      tripId: form.tripId || undefined,
      loggedAt: new Date(form.loggedAt).toISOString(),
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Fuel Logs</h1>
          <p className="text-muted-foreground">
            Record fueling activity and support cost and efficiency reporting.
          </p>
        </div>

        {canCreate ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Fuel Log
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Fuel Log</DialogTitle>
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
                  <Label htmlFor="liters">Liters</Label>
                  <Input
                    id="liters"
                    type="number"
                    min={0.01}
                    value={form.liters}
                    onChange={(e) =>
                      updateField("liters", Number(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    min={0}
                    value={form.cost}
                    onChange={(e) =>
                      updateField("cost", Number(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="odometerKm">Odometer (km)</Label>
                  <Input
                    id="odometerKm"
                    type="number"
                    min={0}
                    value={form.odometerKm ?? 0}
                    onChange={(e) =>
                      updateField("odometerKm", Number(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loggedAt">Logged At</Label>
                  <Input
                    id="loggedAt"
                    type="datetime-local"
                    value={form.loggedAt ?? ""}
                    onChange={(e) => updateField("loggedAt", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={form.notes ?? ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>

                {isSubmitDisabled ? (
                  <p className="text-sm text-muted-foreground">
                    Select a vehicle, enter liters and cost, and choose a valid
                    date.
                  </p>
                ) : null}

                <Button
                  className="w-full"
                  disabled={createMutation.isPending || isSubmitDisabled}
                  type="submit"
                >
                  {createMutation.isPending ? "Creating..." : "Create Fuel Log"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuel Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {fuelLogsQuery.isLoading ? (
            <p>Loading fuel logs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Liters</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Logged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelLogsQuery.data?.length ? (
                  fuelLogsQuery.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">
                          {log.vehicle.registrationNo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.vehicle.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.trip ? (
                          <div>
                            <div>{log.trip.tripCode}</div>
                            <div className="text-xs text-muted-foreground">
                              {log.trip.source} to {log.trip.destination}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No trip</span>
                        )}
                      </TableCell>
                      <TableCell>{log.liters}</TableCell>
                      <TableCell>{log.cost}</TableCell>
                      <TableCell>{log.odometerKm ?? "-"}</TableCell>
                      <TableCell>
                        {new Date(log.loggedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No fuel logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
