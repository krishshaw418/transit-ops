import { apiFetch } from "@/lib/api-client";

export type MaintenanceStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type MaintenanceLog = {
  id: string;
  title: string;
  description: string | null;
  status: MaintenanceStatus;
  openedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  cost: string | number | null;
  notes: string | null;
  vehicleId: string;
  createdById: string;
  vehicle: {
    id: string;
    registrationNo: string;
    name: string;
    type: string;
    status: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type CreateMaintenanceInput = {
  vehicleId: string;
  title: string;
  description?: string;
  notes?: string;
};

export function getMaintenanceLogs() {
  return apiFetch<MaintenanceLog[]>("/maintenance");
}

export function createMaintenanceLog(payload: CreateMaintenanceInput) {
  return apiFetch<MaintenanceLog>("/maintenance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function startMaintenanceLog(id: string, notes?: string) {
  return apiFetch<MaintenanceLog>(`/maintenance/${id}/start`, {
    method: "POST",
    body: JSON.stringify({ notes }),
  });
}

export function completeMaintenanceLog(
  id: string,
  payload: { cost?: number; notes?: string },
) {
  return apiFetch<MaintenanceLog>(`/maintenance/${id}/complete`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
