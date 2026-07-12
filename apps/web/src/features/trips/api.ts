import { apiFetch } from "@/lib/api-client";

export type TripStatus = "DRAFT" | "DISPATCHED" | "COMPLETED" | "CANCELLED";

export type Trip = {
  id: string;
  tripCode: string;
  source: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm: number | null;
  revenue: string | number | null;
  fuelConsumedLiters: number | null;
  status: TripStatus;
  dispatchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  notes: string | null;
  vehicleId: string;
  driverId: string;
  createdById: string;
  vehicle: {
    id: string;
    registrationNo: string;
    name: string;
    type: string;
    status: string;
    maxLoadCapacityKg: number;
  };
  driver: {
    id: string;
    name: string;
    licenseNumber: string;
    status: string;
  };
};

export type CreateTripInput = {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  revenue?: number;
  notes?: string;
};

export type CompleteTripInput = {
  actualDistanceKm: number;
  fuelConsumedLiters: number;
  revenue?: number;
  notes?: string;
};

export function getTrips() {
  return apiFetch<Trip[]>("/trips");
}

export function createTrip(payload: CreateTripInput) {
  return apiFetch<Trip>("/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function dispatchTrip(tripId: string) {
  return apiFetch<Trip>(`/trips/${tripId}/dispatch`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function completeTrip(tripId: string, payload: CompleteTripInput) {
  return apiFetch<Trip>(`/trips/${tripId}/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function cancelTrip(tripId: string, notes?: string) {
  return apiFetch<Trip>(`/trips/${tripId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}
