import { RouterProvider, useRouter } from "./components/RouterContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminSetupPage } from "./pages/AdminSetupPage";

function Router() {
  const { currentPath } = useRouter();

  if (currentPath === "/login") {
    return <LoginPage />;
  }

  if (currentPath === "/signup") {
    return <SignupPage />;
  }

  if (currentPath === "/admin-setup") {
    return <AdminSetupPage />;
  }

  if (currentPath === "/dashboard") {
    return (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === "/admin") {
    return (
      <ProtectedRoute requireAdmin>
        <AdminPage />
      </ProtectedRoute>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <RouterProvider>
      <Router />
    </RouterProvider>
  );
}
