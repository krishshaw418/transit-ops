import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/drivers", label: "Drivers" },
  { to: "/trips", label: "Trips" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/fuel-logs", label: "Fuel Logs" },
  { to: "/expenses", label: "Expenses" },
  { to: "/reports", label: "Reports" },
];

export function AppShell() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSession();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r bg-muted/30 p-4">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            TransitOps
          </p>
          <h2 className="text-xl font-semibold">Operations Platform</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div>
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium">
              {user?.name} {user?.role ? `(${user.role})` : ""}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
