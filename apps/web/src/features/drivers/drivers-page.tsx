import { useState } from "react";
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
import { createDriver, getDrivers, type CreateDriverInput } from "./api";

const initialForm: CreateDriverInput = {
  name: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiryDate: "",
  contactNumber: "",
  safetyScore: 100,
  status: "AVAILABLE",
};

function getDriverStatusBadge(status: string) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 px-1 rounded-md">
          Available
        </Badge>
      );
    case "ON_TRIP":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-1 rounded-md">
          On Trip
        </Badge>
      );
    case "OFF_DUTY":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 px-1 rounded-md">
          Off Duty
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 px-1 rounded-md">
          Suspended
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function isExpired(date: string) {
  return new Date(date) < new Date();
}

export function DriversPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateDriverInput>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: getDrivers,
  });

  const mutation = useMutation({
    mutationFn: createDriver,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver created successfully");
      setOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create driver",
      );
    },
  });

  function updateField<K extends keyof CreateDriverInput>(
    key: K,
    value: CreateDriverInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">
            Manage driver profiles, license details, and operational status.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Driver</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Driver Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={form.licenseNumber}
                  onChange={(e) => updateField("licenseNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseCategory">License Category</Label>
                <Input
                  id="licenseCategory"
                  value={form.licenseCategory}
                  onChange={(e) =>
                    updateField("licenseCategory", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
                <Input
                  id="licenseExpiryDate"
                  type="datetime-local"
                  value={form.licenseExpiryDate}
                  onChange={(e) =>
                    updateField(
                      "licenseExpiryDate",
                      new Date(e.target.value).toISOString(),
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={form.contactNumber}
                  onChange={(e) => updateField("contactNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyScore">Safety Score</Label>
                <Input
                  id="safetyScore"
                  type="number"
                  value={form.safetyScore ?? 100}
                  onChange={(e) =>
                    updateField("safetyScore", Number(e.target.value))
                  }
                />
              </div>

              <Button
                className="w-full"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? "Creating..." : "Create Driver"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Registry</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading drivers...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Safety</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {driver.contactNumber}
                      </div>
                    </TableCell>
                    <TableCell>{driver.licenseNumber}</TableCell>
                    <TableCell>{driver.licenseCategory}</TableCell>
                    <TableCell>
                      <div>
                        {new Date(
                          driver.licenseExpiryDate,
                        ).toLocaleDateString()}
                      </div>
                      {isExpired(driver.licenseExpiryDate) ? (
                        <div className="text-xs text-rose-600">Expired</div>
                      ) : null}
                    </TableCell>
                    <TableCell>{getDriverStatusBadge(driver.status)}</TableCell>
                    <TableCell>{driver.safetyScore}</TableCell>
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
