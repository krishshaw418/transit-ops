import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { getDrivers } from "@/features/drivers/api";
import { getVehicles } from "@/features/vehicles/api";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  getTrips,
  type CreateTripInput,
  type Trip,
} from "./api";

const initialForm: CreateTripInput = {
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeightKg: 0,
  plannedDistanceKm: 0,
  revenue: 0,
  notes: "",
};

function getTripStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 px-1 rounded-md">
          Draft
        </Badge>
      );
    case "DISPATCHED":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-1 rounded-md">
          Dispatched
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 px-1 rounded-md">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-1 rounded-md">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function TripsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateTripInput>(initialForm);

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: getTrips,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const driversQuery = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const createMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip created successfully");
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create trip",
      );
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: dispatchTrip,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["drivers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
      toast.success("Trip dispatched successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to dispatch trip",
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({
      tripId,
      payload,
    }: {
      tripId: string;
      payload: { actualDistanceKm: number; fuelConsumedLiters: number };
    }) => completeTrip(tripId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["drivers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
      toast.success("Trip completed successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to complete trip",
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ tripId, notes }: { tripId: string; notes?: string }) =>
      cancelTrip(tripId, notes),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["drivers"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
      toast.success("Trip cancelled successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel trip",
      );
    },
  });

  const availableVehicles = useMemo(
    () => vehiclesQuery.data ?? [],
    [vehiclesQuery.data],
  );

  const availableDrivers = useMemo(
    () => driversQuery.data ?? [],
    [driversQuery.data],
  );

  function updateField<K extends keyof CreateTripInput>(
    key: K,
    value: CreateTripInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCreateTrip(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  function handleQuickComplete(trip: Trip) {
    completeMutation.mutate({
      tripId: trip.id,
      payload: {
        actualDistanceKm: trip.plannedDistanceKm,
        fuelConsumedLiters: 10,
      },
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Trips</h1>
          <p className="text-muted-foreground">
            Create, dispatch, complete, and cancel operational trips.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trip</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreateTrip}>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={form.source}
                  onChange={(e) => updateField("source", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={form.destination}
                  onChange={(e) => updateField("destination", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle ID</Label>
                <select
                  id="vehicleId"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.vehicleId}
                  onChange={(e) => updateField("vehicleId", e.target.value)}
                >
                  <option value="">Select vehicle</option>
                  {availableVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNo} - {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverId">Driver ID</Label>
                <select
                  id="driverId"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={form.driverId}
                  onChange={(e) => updateField("driverId", e.target.value)}
                >
                  <option value="">Select driver</option>
                  {availableDrivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargoWeightKg">Cargo Weight (kg)</Label>
                <Input
                  id="cargoWeightKg"
                  type="number"
                  value={form.cargoWeightKg}
                  onChange={(e) =>
                    updateField("cargoWeightKg", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedDistanceKm">Planned Distance (km)</Label>
                <Input
                  id="plannedDistanceKm"
                  type="number"
                  value={form.plannedDistanceKm}
                  onChange={(e) =>
                    updateField("plannedDistanceKm", Number(e.target.value))
                  }
                />
              </div>

              <Button
                className="w-full"
                disabled={createMutation.isPending}
                type="submit"
              >
                {createMutation.isPending ? "Creating..." : "Create Trip"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          {tripsQuery.isLoading ? (
            <p>Loading trips...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripsQuery.data?.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="font-medium">{trip.tripCode}</div>
                      <div className="text-xs text-muted-foreground">
                        {trip.plannedDistanceKm} km planned
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{trip.source}</div>
                      <div className="text-xs text-muted-foreground">
                        {trip.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{trip.vehicle.registrationNo}</div>
                      <div className="text-xs text-muted-foreground">
                        {trip.vehicle.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{trip.driver.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {trip.driver.licenseNumber}
                      </div>
                    </TableCell>
                    <TableCell>{getTripStatusBadge(trip.status)}</TableCell>
                    <TableCell>{trip.cargoWeightKg} kg</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {trip.status === "DRAFT" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => dispatchMutation.mutate(trip.id)}
                              variant="default"
                            >
                              Dispatch
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                cancelMutation.mutate({ tripId: trip.id })
                              }
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : null}

                        {trip.status === "DISPATCHED" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleQuickComplete(trip)}
                              variant="default"
                            >
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                cancelMutation.mutate({ tripId: trip.id })
                              }
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : null}
                      </div>
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
