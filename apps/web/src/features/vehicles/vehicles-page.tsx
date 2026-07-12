import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createVehicle, getVehicles, type CreateVehicleInput } from "./api";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function getVehicleStatusBadge(status: string) {
  switch (status) {
    case "AVAILABLE":
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-md px-1">Available</Badge>;
    case "ON_TRIP":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-md px-1">On Trip</Badge>;
    case "IN_SHOP":
      return <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 rounded-md px-1">In Shop</Badge>;
    case "RETIRED":
      return <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 rounded-md px-1">Retired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

const initialForm: CreateVehicleInput = {
  registrationNo: "",
  name: "",
  model: "",
  type: "",
  maxLoadCapacityKg: 5,
  odometerKm: 5,
  acquisitionCost: 5,
  status: "AVAILABLE",
  isActive: true,
};

export function VehiclesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateVehicleInput>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  });

  const mutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle created successfully");
      setOpen(false);
      setForm(initialForm);
      setError(null);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to create vehicle";
      setError(message);
      toast.error(message);
    },
  });

  function updateField<K extends keyof CreateVehicleInput>(
    key: K,
    value: CreateVehicleInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    mutation.mutate(form);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">
            Manage the transport fleet registry and status lifecycle.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Vehicle</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                placeholder="Registration Number"
                value={form.registrationNo}
                onChange={(e) => updateField("registrationNo", e.target.value)}
              />
              <Input
                placeholder="Vehicle Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
              <Input
                placeholder="Model"
                value={form.model ?? ""}
                onChange={(e) => updateField("model", e.target.value)}
              />
              <Input
                placeholder="Type"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              />
              <div className="space-y-2">
                <Label htmlFor="maxLoadCapacityKg">
                  Max Load Capacity (kg)
                </Label>
                <Input
                  id="maxLoadCapacityKg"
                  type="number"
                  value={form.maxLoadCapacityKg}
                  min={5}
                  onChange={(e) =>
                    updateField("maxLoadCapacityKg", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odometerKm">Odometer (km)</Label>
                <Input
                  id="odometerKm"
                  type="number"
                  value={form.odometerKm ?? 0}
                  min={5}
                  onChange={(e) =>
                    updateField("odometerKm", Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisitionCost">Acquisition Cost</Label>
                <Input
                  id="acquisitionCost"
                  type="number"
                  value={form.acquisitionCost}
                  min={5}
                  onChange={(e) =>
                    updateField("acquisitionCost", Number(e.target.value))
                  }
                />
              </div>

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}

              <Button
                className="w-full"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? "Creating..." : "Create Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading vehicles...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Odometer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">
                      {vehicle.registrationNo}
                    </TableCell>
                    <TableCell>
                      <div>{vehicle.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {vehicle.model ?? "No model"}
                      </div>
                    </TableCell>
                    <TableCell>{vehicle.type}</TableCell>
                    <TableCell>{getVehicleStatusBadge(vehicle.status)}</TableCell>
                    <TableCell>{vehicle.maxLoadCapacityKg} kg</TableCell>
                    <TableCell>{vehicle.odometerKm} km</TableCell>
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
