import { apiFetch } from "@/lib/api-client";

export type FuelLog = {
  id: string;
  liters: number;
  cost: string | number;
  odometerKm: number | null;
  loggedAt: string;
  notes: string | null;
  vehicleId: string;
  tripId: string | null;
  vehicle: {
    id: string;
    registrationNo: string;
    name: string;
    type: string;
  };
  trip: {
    id: string;
    tripCode: string;
    source: string;
    destination: string;
  } | null;
};

export type CreateFuelLogInput = {
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  odometerKm?: number;
  loggedAt?: string;
  notes?: string;
};

export function getFuelLogs() {
  return apiFetch<FuelLog[]>("/fuel-logs");
}

export function createFuelLog(payload: CreateFuelLogInput) {
  return apiFetch<FuelLog>("/fuel-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
