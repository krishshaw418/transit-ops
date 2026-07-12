import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { useAuthStore } from "@/stores/auth-store";
import { canManageMaintenance } from "@/lib/permissions";
import {
  completeMaintenanceLog,
  createMaintenanceLog,
  getMaintenanceLogs,
  startMaintenanceLog,
  type CreateMaintenanceInput,
} from "./api";

const initialForm: CreateMaintenanceInput = {
  vehicleId: "",
  title: "",
  description: "",
  notes: "",
};

function getMaintenanceBadge(status: string) {
  switch (status) {
    case "OPEN":
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100 rounded-md px-1">
          Open
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 rounded-md px-1">
          In Progress
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-md px-1">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 rounded-md px-1">
          Cancelled
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function MaintenancePage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateMaintenanceInput>(initialForm);
  const user = useAuthStore((state) => state.user);
  const canMaintenanceActions = canManageMaintenance(user?.role);

  const maintenanceQuery = useQuery({
    queryKey: ["maintenance"],
    queryFn: getMaintenanceLogs,
  });

  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const createMutation = useMutation({
    mutationFn: createMaintenanceLog,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
      toast.success("Maintenance record created");
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create maintenance record",
      );
    },
  });

  const startMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      startMaintenanceLog(id, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Maintenance started");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to start maintenance",
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, cost }: { id: string; cost?: number }) =>
      completeMaintenanceLog(id, { cost }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
        queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
      ]);
      toast.success("Maintenance completed");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete maintenance",
      );
    },
  });

  const selectableVehicles = useMemo(
    () =>
      (vehiclesQuery.data ?? []).filter(
        (vehicle) => vehicle.status !== "IN_SHOP",
      ),
    [vehiclesQuery.data],
  );

  const isCreateDisabled = useMemo(
    () => !form.vehicleId || !form.title.trim(),
    [form],
  );

  function updateField<K extends keyof CreateMaintenanceInput>(
    key: K,
    value: CreateMaintenanceInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Track shop activity and vehicle maintenance lifecycle.
          </p>
        </div>

        {canMaintenanceActions ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Maintenance Record</DialogTitle>
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
                    {selectableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNo} - {vehicle.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={form.notes ?? ""}
                    onChange={(e) => updateField("notes", e.target.value)}
                  />
                </div>

                {isCreateDisabled ? (
                  <p className="text-sm text-muted-foreground">
                    Select a vehicle and add a maintenance title.
                  </p>
                ) : null}

                <Button
                  className="w-full"
                  disabled={createMutation.isPending || isCreateDisabled}
                  type="submit"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create Maintenance"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceQuery.isLoading ? (
            <p>Loading maintenance logs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opened</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceQuery.data?.length ? (
                  maintenanceQuery.data.map((log) => (
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
                        <div>{log.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.description ?? "No description"}
                        </div>
                      </TableCell>
                      <TableCell>{getMaintenanceBadge(log.status)}</TableCell>
                      <TableCell>
                        {new Date(log.openedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{log.createdBy.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {log.status === "OPEN" && canMaintenanceActions ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                startMutation.mutate({ id: log.id })
                              }
                            >
                              Start
                            </Button>
                          ) : null}
                          {(log.status === "OPEN" ||
                            log.status === "IN_PROGRESS") &&
                          canMaintenanceActions ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                completeMutation.mutate({
                                  id: log.id,
                                  cost: 1500,
                                })
                              }
                            >
                              Complete
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground"
                    >
                      No maintenance logs found.
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
