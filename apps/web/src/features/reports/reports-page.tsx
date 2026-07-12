import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReports } from "./api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "AVAILABLE":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-md px-1">
          Available
        </Badge>
      );
    case "ON_TRIP":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-md px-1">
          On Trip
        </Badge>
      );
    case "IN_SHOP":
      return (
        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100 rounded-md px-1">
          In Shop
        </Badge>
      );
    case "RETIRED":
      return (
        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
          Retired
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function ReportsPage() {
  const reportsQuery = useQuery({
    queryKey: ["dashboard-reports"],
    queryFn: getReports,
  });

  useEffect(() => {
    if (reportsQuery.isError) {
      toast.error(
        reportsQuery.error instanceof Error
          ? reportsQuery.error.message
          : "Failed to load reports",
      );
    }
  }, [reportsQuery.isError, reportsQuery.error]);

  if (reportsQuery.isLoading) {
    return <div className="p-6">Loading reports...</div>;
  }

  if (!reportsQuery.data) {
    return <div className="p-6">No report data available.</div>;
  }

  const { totals, vehicles } = reportsQuery.data;

  const summaryCards = [
    {
      title: "Total Fuel Cost",
      value: formatCurrency(totals.totalFuelCost),
    },
    {
      title: "Other Expenses",
      value: formatCurrency(totals.totalExpenseCost),
    },
    {
      title: "Operational Cost",
      value: formatCurrency(totals.totalOperationalCost),
    },
    {
      title: "Fuel Efficiency",
      value: `${totals.fuelEfficiency.toFixed(2)} km/L`,
    },
    {
      title: "Distance Covered",
      value: `${totals.totalDistance} km`,
    },
    {
      title: "Fuel Consumed",
      value: `${totals.totalFuelLiters} L`,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Financial and operational analytics across the transport fleet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Fuel Cost</TableHead>
                <TableHead>Other Costs</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Fuel Efficiency</TableHead>
                <TableHead>ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.vehicleId}>
                  <TableCell>
                    <div className="font-medium">{vehicle.registrationNo}</div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>{formatCurrency(vehicle.revenue)}</TableCell>
                  <TableCell>{formatCurrency(vehicle.fuelCost)}</TableCell>
                  <TableCell>{formatCurrency(vehicle.otherCosts)}</TableCell>
                  <TableCell>
                    {formatCurrency(vehicle.totalOperationalCost)}
                  </TableCell>
                  <TableCell>
                    {vehicle.fuelEfficiency.toFixed(2)} km/L
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        vehicle.roi >= 0
                          ? "text-emerald-700 font-medium"
                          : "text-rose-700 font-medium"
                      }
                    >
                      {vehicle.roi.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
