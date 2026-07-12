import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "./api";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-6">No dashboard data available.</div>;
  }

  const cards = [
    { label: "Active Vehicles", value: data.activeVehicles },
    { label: "Available Vehicles", value: data.availableVehicles },
    { label: "In Maintenance", value: data.vehiclesInMaintenance },
    { label: "Active Trips", value: data.activeTrips },
    { label: "Pending Trips", value: data.pendingTrips },
    { label: "Drivers On Duty", value: data.driversOnDuty },
    { label: "Fleet Utilization", value: `${data.fleetUtilization}%` },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Live operational summary for TransitOps.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
