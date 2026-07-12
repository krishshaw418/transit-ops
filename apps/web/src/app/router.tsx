import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/auth/login-page";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { VehiclesPage } from "@/features/vehicles/vehicles-page";
import { DriversPage } from "@/features/drivers/drivers-page";
import { TripsPage } from "@/features/trips/trips-page";
import { MaintenancePage } from "@/features/maintenance/maintenance-page";
import { FuelLogsPage } from "@/features/fuel-logs/fuel-logs-page";
import { ExpensesPage } from "@/features/expenses/expenses-page";
import { ReportsPage } from "@/features/reports/reports-page";

function PlaceholderPage({ title }: { title: string }) {
  return <div className="p-6 text-lg">{title} page coming next.</div>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/vehicles", element: <VehiclesPage /> },
          { path: "/drivers", element: <DriversPage /> },
          { path: "/trips", element: <TripsPage /> },
          {
            path: "/maintenance",
            element: <MaintenancePage />,
          },
          {
            path: "/fuel-logs",
            element: <FuelLogsPage />,
          },
          { path: "/expenses", element: <ExpensesPage /> },
          { path: "/reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
]);
