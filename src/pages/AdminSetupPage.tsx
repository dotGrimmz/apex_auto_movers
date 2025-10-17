import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { useRouter } from "../components/RouterContext";
import { projectId, publicAnonKey } from "../utils/supabase/info";

export function AdminSetupPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { navigate } = useRouter();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f0a9c31f`;
      
      // This is a temporary setup endpoint - you would need to add this to your server
      // For now, we'll show instructions to the user
      setError("Please manually update the user profile in Supabase. See SETUP.md for instructions.");
      
      // In a real implementation, you would call an endpoint like:
      // await fetch(`${API_BASE_URL}/setup-admin`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${publicAnonKey}`,
      //   },
      //   body: JSON.stringify({ userId, setupKey: 'your-secret-setup-key' })
      // });
      
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "Failed to setup admin account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A1020] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-16 h-16 text-[#00FFB0] mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl text-white mb-2">Admin Setup Complete!</h3>
          <p className="text-white/70 mb-6">You can now access the admin dashboard</p>
          <Button
            onClick={() => navigate("/admin")}
            className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90"
          >
            Go to Admin Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1020] flex items-center justify-center px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #00FFB0 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-[#00FFB0] rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-[#0A1020]" />
            </div>
            <span className="text-white text-2xl tracking-tight">Admin Setup</span>
          </div>
          <p className="text-white/70">Setup your first admin account</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8">
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-400">
                <p className="font-semibold mb-2">Manual Setup Required</p>
                <p className="text-yellow-400/80 mb-3">
                  To create your first admin account, follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-yellow-400/80">
                  <li>Create a regular account using the signup page</li>
                  <li>Sign in and note your user email</li>
                  <li>
                    Update the <code className="bg-yellow-500/20 px-1 rounded">/supabase/functions/server/index.tsx</code> file
                  </li>
                  <li>
                    In the signup endpoint, temporarily change <code className="bg-yellow-500/20 px-1 rounded">role: 'user'</code> to{" "}
                    <code className="bg-yellow-500/20 px-1 rounded">role: 'admin'</code>
                  </li>
                  <li>Create a new account with your admin email</li>
                  <li>Change the role back to 'user' for subsequent signups</li>
                  <li>You can now access the admin dashboard!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-400">
                <p className="font-semibold mb-2">Alternative: Using Browser Console</p>
                <p className="text-blue-400/80">
                  After creating and logging into your account, you can check your user ID and profile in the browser console.
                  However, updating the role requires backend access or Supabase dashboard access.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-white/70 text-sm mb-4">
                For detailed instructions, please refer to the <code className="bg-white/10 px-2 py-1 rounded">SETUP.md</code> file
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90"
                >
                  Go to Signup
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            This setup page is only needed for the first admin account. Once you have an admin account, you can manage other users from the admin dashboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
