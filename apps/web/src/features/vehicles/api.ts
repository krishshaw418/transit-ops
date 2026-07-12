import { apiFetch } from "@/lib/api-client";

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";

export type Vehicle = {
  id: string;
  registrationNo: string;
  name: string;
  model: string | null;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: string | number;
  status: VehicleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateVehicleInput = {
  registrationNo: string;
  name: string;
  model?: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm?: number;
  acquisitionCost: number;
  status?: VehicleStatus;
  isActive?: boolean;
};

export function getVehicles() {
  return apiFetch<Vehicle[]>("/vehicles");
}

export function createVehicle(payload: CreateVehicleInput) {
  return apiFetch<Vehicle>("/vehicles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}