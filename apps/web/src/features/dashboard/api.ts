import { apiFetch } from "@/lib/api-client";

export type DashboardSummary = {
  totalVehicles: number;
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilization: number;
};

export function getDashboardSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}
