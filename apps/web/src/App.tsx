import { RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppProviders } from "./app/providers";
import { router } from "./app/router";

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppProviders>
  );
}