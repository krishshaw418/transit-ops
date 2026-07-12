import { apiFetch } from "@/lib/api-client";

export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";

export type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateDriverInput = {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore?: number;
  status?: DriverStatus;
};

export function getDrivers() {
  return apiFetch<Driver[]>("/drivers");
}

export function createDriver(payload: CreateDriverInput) {
  return apiFetch<Driver>("/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
