import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { useRouter } from "./RouterContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const { navigate } = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      if (requireAdmin) {
        // Check admin status
        const { api } = await import("../utils/api");
        const { profile } = await api.getProfile();
        
        if (profile.role !== "admin") {
          navigate("/dashboard");
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1020] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00FFB0] animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
