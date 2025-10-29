import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  LogOut,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  Eye,
} from "lucide-react";
import { api } from "../utils/api";
import { signOut } from "../utils/auth";
import { useRouter } from "../components/RouterContext";
import type { Quote, QuoteStatus } from "../types/quote";
import { QuoteDetailsDrawer } from "../components/QuoteDetailsDrawer";
import { toast } from "sonner";

const statusOptions: Array<{ value: QuoteStatus; label: string }> = [
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
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sendingQuote, setSendingQuote] = useState(false);
  const [savingQuote, setSavingQuote] = useState(false);
  const [tableBusy, setTableBusy] = useState(false);
  const [mutatingQuoteId, setMutatingQuoteId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const { navigate } = useRouter();
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    // Ensure only admins can access
    (async () => {
      try {
        const { data: profile } = await api.getProfile();
        if (!profile || profile.role !== "admin") {
          navigate("/login");
          return;
        }
        if (profile?.email) {
          setAdminEmail(profile.email);
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
      setTableBusy(true);
      const { data: allQuotes } = await api.getAllQuotes();
      setQuotes(allQuotes);
    } catch (err: any) {
      console.error("Error loading quotes:", err);
      setError(err.message || "Failed to load quotes");
      toast.error(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
      setTableBusy(false);
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
          `${q.make} ${q.model}`.toLowerCase().includes(term) ||
          q.pickup.toLowerCase().includes(term) ||
          q.delivery.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }

  async function handleStatusChange(quoteId: string, newStatus: QuoteStatus) {
    try {
      setTableBusy(true);
      setMutatingQuoteId(quoteId);
      await api.updateQuoteStatus(quoteId, newStatus);

      // Update local state
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );
      toast.success(`Status updated to ${newStatus.toUpperCase()}`);
      if (newStatus === "completed") {
        requestAnimationFrame(() => {
          const targetRow = rowRefs.current[quoteId];
          targetRow?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update quote status");
    } finally {
      setTableBusy(false);
      setMutatingQuoteId(null);
    }
  }

  async function handleSendQuote(
    quoteId: string,
    payload: { quote_amount: number; message?: string }
  ) {
    try {
      setSendingQuote(true);
      setTableBusy(true);
      const { data: updatedQuote } = await api.sendQuoteEmail(quoteId, payload);
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, ...updatedQuote } : q))
      );
      setSelectedQuote((current) =>
        current && current.id === quoteId
          ? { ...current, ...updatedQuote }
          : current
      );
      setDrawerOpen(false);
      toast.success("Quote email sent to customer");
    } catch (err: any) {
      console.error("Error sending quote email:", err);
      toast.error(err.message || "Failed to send quote email");
    } finally {
      setSendingQuote(false);
      setTableBusy(false);
    }
  }

  async function handleSaveQuoteDetails(
    quoteId: string,
    payload: Partial<Pick<Quote, "quote_amount" | "admin_notes">>
  ) {
    try {
      setSavingQuote(true);
      setTableBusy(true);
      const { data: updatedQuote } = await api.updateQuote(quoteId, payload);
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, ...updatedQuote } : q))
      );
      setSelectedQuote((current) =>
        current && current.id === quoteId
          ? { ...current, ...updatedQuote }
          : current
      );
      toast.success("Quote details saved");
    } catch (err: any) {
      console.error("Error saving quote details:", err);
      toast.error(err.message || "Failed to save quote details");
    } finally {
      setSavingQuote(false);
      setTableBusy(false);
    }
  }

  function handleOpenQuoteDetails(quote: Quote) {
    setSelectedQuote(quote);
    setDrawerOpen(true);
  }

  function handleDrawerToggle(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setSelectedQuote(null);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out");
    }
  }

  const summary = useMemo(() => {
    const total = quotes.length;
    const newQuotes = quotes.filter((q) => q.status === "new").length;
    const contacted = quotes.filter((q) => q.status === "contacted").length;
    const booked = quotes.filter((q) => q.status === "booked").length;
    const completed = quotes.filter((q) => q.status === "completed").length;
    return { total, newQuotes, contacted, booked, completed };
  }, [quotes]);

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
              <div>
                <span className="text-white text-xl tracking-tight">
                  Apex Auto Movers
                </span>
                <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Admin
                </Badge>
              </div>
            </div>
            {adminEmail && (
              <p className="text-white/50 text-sm hidden sm:block flex-1 text-right">
                {adminEmail}
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
          <Card className="relative bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
            {tableBusy && (
              <div className="absolute inset-0 z-10 bg-[#0A1020]/80 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#00FFB0] border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Updating quotes…</p>
              </div>
            )}
            <div
              className={`overflow-x-auto ${
                tableBusy ? "pointer-events-none opacity-70" : ""
              }`}
            >
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
                        ref={(node) => {
                          rowRefs.current[quote.id] = node;
                        }}
                        className={`border-white/10 hover:bg-white/5 transition-opacity ${
                          mutatingQuoteId === quote.id ? "opacity-70" : ""
                        }`}
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
                          <div className="text-white">
                            {`${quote.make} ${quote.model}`.trim()}
                          </div>
                          <div className="text-white/50 text-sm capitalize">
                            {quote.transport_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-white/70 text-sm">
                            <span>{quote.pickup}</span>
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            <span>{quote.delivery}</span>
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
                        <TableCell className="gap-2">
                          <Select
                            value={quote.status}
                            onValueChange={(value: QuoteStatus) =>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-white/80 hover:text-white hover:bg-white/10"
                            onClick={() => handleOpenQuoteDetails(quote)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
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
      <QuoteDetailsDrawer
        open={drawerOpen}
        quote={selectedQuote}
        onOpenChange={handleDrawerToggle}
        onSendQuote={handleSendQuote}
        onSaveDetails={handleSaveQuoteDetails}
        sending={sendingQuote}
        saving={savingQuote}
      />
    </div>
  );
}
