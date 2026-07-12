import { apiFetch } from "@/lib/api-client";

export type ReportsResponse = {
  totals: {
    totalFuelCost: number;
    totalExpenseCost: number;
    totalOperationalCost: number;
    totalDistance: number;
    totalFuelLiters: number;
    fuelEfficiency: number;
  };
  vehicles: Array<{
    vehicleId: string;
    registrationNo: string;
    name: string;
    status: string;
    revenue: number;
    fuelCost: number;
    otherCosts: number;
    totalOperationalCost: number;
    fuelEfficiency: number;
    roi: number;
  }>;
};

export function getReports() {
  return apiFetch<ReportsResponse>("/dashboard/reports");
}
