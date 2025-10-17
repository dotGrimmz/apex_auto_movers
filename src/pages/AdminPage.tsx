import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { LogOut, Search, Filter, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "../utils/api";
import { signOut } from "../utils/auth";
import { useRouter } from "../components/RouterContext";
import { api } from "../utils/api";

interface Quote {
  id: string;
  name: string;
  email: string;
  phone: string;
  pickup_location: string;
  delivery_location: string;
  vehicle: string;
  transport_type: string;
  status: string;
  created_at: string;
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "completed", label: "Completed" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  contacted: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  booked: "bg-green-500/20 text-green-400 border-green-500/50",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
};

export function AdminPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { navigate } = useRouter();

  useEffect(() => {
    // Ensure only admins can access
    (async () => {
      try {
        const res = await api.getProfile();
        if (!res?.profile || res.profile.role !== "admin") {
          navigate("/login");
          return;
        }
        loadQuotes();
      } catch (_) {
        navigate("/login");
      }
    })();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  async function loadQuotes() {
    try {
      const { quotes: allQuotes } = await api.getAllQuotes();
      setQuotes(allQuotes);
    } catch (err: any) {
      console.error("Error loading quotes:", err);
      setError(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }

  function filterQuotes() {
    let filtered = [...quotes];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.email.toLowerCase().includes(term) ||
          q.vehicle.toLowerCase().includes(term) ||
          q.pickup_location.toLowerCase().includes(term) ||
          q.delivery_location.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }

  async function handleStatusChange(quoteId: string, newStatus: string) {
    try {
      await api.updateQuoteStatus(quoteId, newStatus);

      // Update local state
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );
    } catch (err: any) {
      console.error("Error updating status:", err);
      alert("Failed to update quote status");
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#00FFB0] rounded-lg flex items-center justify-center">
                <span className="text-[#0A1020] font-bold text-xl">A</span>
              </div>
              <div>
                <span className="text-white text-xl tracking-tight">
                  Apex Auto Movers
                </span>
                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Admin
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl text-white mb-2">
            Quote Management
          </h1>
          <p className="text-white/70">Manage all customer transport quotes</p>
        </motion.div>

        {/* Filters */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                placeholder="Search by name, email, vehicle..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/50" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-[#00FFB0] focus:ring-[#00FFB0]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center space-x-6 text-sm">
            <div className="text-white/70">
              Total: <span className="text-[#00FFB0]">{quotes.length}</span>
            </div>
            <div className="text-white/70">
              Filtered:{" "}
              <span className="text-[#00FFB0]">{filteredQuotes.length}</span>
            </div>
          </div>
        </Card>

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
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 bg-white/10" />
              ))}
            </div>
          </Card>
        )}

        {/* Quotes Table */}
        {!loading && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/70">Customer</TableHead>
                    <TableHead className="text-white/70">Vehicle</TableHead>
                    <TableHead className="text-white/70">Route</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-white/50 py-8"
                      >
                        No quotes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuotes.map((quote) => (
                      <TableRow
                        key={quote.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell>
                          <div className="text-white">{quote.name}</div>
                          <div className="text-white/50 text-sm">
                            {quote.email}
                          </div>
                          <div className="text-white/50 text-sm">
                            {quote.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white">{quote.vehicle}</div>
                          <div className="text-white/50 text-sm capitalize">
                            {quote.transport_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-white/70 text-sm">
                            <span>{quote.pickup_location}</span>
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            <span>{quote.delivery_location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              statusColors[quote.status]
                            } border text-xs`}
                          >
                            {quote.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white/70 text-sm">
                          {new Date(quote.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={quote.status}
                            onValueChange={(value) =>
                              handleStatusChange(quote.id, value)
                            }
                          >
                            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-xs h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
