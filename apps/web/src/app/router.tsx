import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/app-shell";
import { LoginPage } from "@/features/auth/login-page";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { VehiclesPage } from "@/features/vehicles/vehicles-page";

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
          { path: "/drivers", element: <PlaceholderPage title="Drivers" /> },
          { path: "/trips", element: <PlaceholderPage title="Trips" /> },
          {
            path: "/maintenance",
            element: <PlaceholderPage title="Maintenance" />,
          },
          {
            path: "/fuel-logs",
            element: <PlaceholderPage title="Fuel Logs" />,
          },
          { path: "/expenses", element: <PlaceholderPage title="Expenses" /> },
          { path: "/reports", element: <PlaceholderPage title="Reports" /> },
        ],
      },
    ],
  },
]);
