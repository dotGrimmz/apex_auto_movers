import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { LogOut, MapPin, ArrowRight, Package, AlertCircle } from "lucide-react";
import { api } from "../utils/api";
import { signOut, getCurrentUser } from "../utils/auth";
import { useRouter } from "../components/RouterContext";

type Quote = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone?: string | null;
  pickup: string;
  delivery: string;
  make: string;
  model: string;
  transport_type: "open" | "enclosed";
  pickup_date?: string | null;
  status:
    | "new"
    | "contacted"
    | "booked"
    | "completed"
    | "in_transit"
    | "cancelled";
  created_at: string;
  updated_at: string;
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  booked: "bg-green-500/20 text-green-400 border-green-500/50",
  in_transit: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
};

export function DashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { navigate } = useRouter();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const user = await getCurrentUser();
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      }
      if (user?.email) {
        setUserEmail(user.email);
      }

      console.log({ user });
      const { data: userQuotes } = await api.getMyQuotes();
      console.log("📦 Full API response:", userQuotes);
      setQuotes(userQuotes);
    } catch (err: any) {
      console.error("Error loading dashboard:", err);
      setError(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1020]">
      {/* Header */}
      <header className="bg-[#0A1020] border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#00FFB0] rounded-lg flex items-center justify-center">
                <span className="text-[#0A1020] font-bold text-xl">A</span>
              </div>
              <span className="text-white text-xl tracking-tight">
                Apex Auto Movers
              </span>
            </div>
            {userEmail && (
              <p className="text-white/50 text-sm hidden sm:block flex-1 text-right">
                {userEmail}
              </p>
            )}
            <Button
              onClick={handleSignOut}
              className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90 border-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl text-white mb-2">
            Welcome back{userName ? `, ${userName}` : ""}!
          </h1>
          <p className="text-white/70">
            Track and manage your vehicle transport quotes
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3 mb-8"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/3 bg-white/10" />
                  <Skeleton className="h-4 w-2/3 bg-white/10" />
                  <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && quotes?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl text-white mb-2">No Quotes Yet</h3>
            <p className="text-white/70 mb-8">
              Get started by requesting a vehicle transport quote
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90"
            >
              Request a Quote
            </Button>
          </motion.div>
        )}

        {/* Quotes List */}
        {!loading && quotes.length > 0 && (
          <div className="grid gap-6">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:bg-white/10 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      {/* Status + Created */}
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`${statusColors[quote.status]} border`}
                        >
                          {quote.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <p className="text-xs text-white/50">
                          Created: {new Date(quote.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Responsive grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Left column */}
                        <div className="space-y-4">
                          {/* Vehicle Info */}
                          <div>
                            <h3 className="text-xl text-white mb-1">
                              {quote.make} {quote.model}
                            </h3>
                            <p className="text-white/50 text-sm">
                              {quote.transport_type === "open"
                                ? "Open"
                                : "Enclosed"}{" "}
                              Transport
                            </p>
                          </div>

                          {/* Route */}
                          <div className="flex items-center space-x-3 text-white/70">
                            <MapPin className="w-4 h-4 text-[#00FFB0] flex-shrink-0" />
                            <span className="text-sm">{quote.pickup}</span>
                            <ArrowRight className="w-4 h-4 flex-shrink-0" />
                            <MapPin className="w-4 h-4 text-[#00FFB0] flex-shrink-0" />
                            <span className="text-sm">{quote.delivery}</span>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <p className="text-xs text-white/50">Make</p>
                              <p className="text-sm text-white">{quote.make}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">Model</p>
                              <p className="text-sm text-white">
                                {quote.model}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">
                                Pickup Date
                              </p>
                              <p className="text-sm text-white">
                                {quote.pickup_date
                                  ? new Date(
                                      quote.pickup_date
                                    ).toLocaleDateString()
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right column */}
                        <div className="space-y-4">
                          {/* Customer */}
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <p className="text-xs text-white/50">Customer</p>
                              <p className="text-sm text-white">{quote.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">Email</p>
                              <p className="text-sm text-white truncate">
                                {quote.email}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">Phone</p>
                              <p className="text-sm text-white">
                                {quote.phone || "—"}
                              </p>
                            </div>
                          </div>

                          {/* IDs */}
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <p className="text-xs text-white/50">Quote ID</p>
                              <p className="text-[11px] text-white/60 break-all">
                                {quote.id}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">User ID</p>
                              <p className="text-[11px] text-white/60 break-all">
                                {quote.user_id || "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        {!loading && quotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-[#00FFB0]/50 text-[#00FFB0] hover:bg-[#00FFB0]/10"
            >
              Request Another Quote
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
