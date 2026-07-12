import type { UserRole } from "@/features/auth/api";

export function canManageVehicles(role?: UserRole) {
  return role === "ADMIN" || role === "FLEET_MANAGER";
}

export function canManageDrivers(role?: UserRole) {
  return (
    role === "ADMIN" || role === "FLEET_MANAGER" || role === "SAFETY_OFFICER"
  );
}

export function canManageTrips(role?: UserRole) {
  return role === "ADMIN" || role === "FLEET_MANAGER" || role === "DRIVER";
}

export function canManageMaintenance(role?: UserRole) {
  return role === "ADMIN" || role === "FLEET_MANAGER";
}

export function canManageFuelLogs(role?: UserRole) {
  return (
    role === "ADMIN" || role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST"
  );
}

export function canManageExpenses(role?: UserRole) {
  return (
    role === "ADMIN" || role === "FLEET_MANAGER" || role === "FINANCIAL_ANALYST"
  );
}

export function canViewReports(role?: UserRole) {
  return !!role;
}

export function canViewDashboard(role?: UserRole) {
  return !!role;
}
