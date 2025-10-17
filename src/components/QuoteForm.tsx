import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../utils/api";
import { useRouter } from "./RouterContext";

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    pickup: "",
    delivery: "",
    make: "",
    model: "",
    transport_type: "" as '' | 'open' | 'enclosed',
    pickup_date: "",
    name: "",
    email: "",
    phone: "",
  });
  const { navigate } = useRouter();
  // No auth requirement for quote submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Build payload matching API typings
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        pickup: formData.pickup,
        delivery: formData.delivery,
        make: formData.make,
        model: formData.model,
        transport_type: formData.transport_type as 'open' | 'enclosed',
        pickup_date: formData.pickup_date || undefined,
      };
      await api.submitQuote(payload);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          pickup: "",
          delivery: "",
          make: "",
          model: "",
          transport_type: "",
          pickup_date: "",
          name: "",
          email: "",
          phone: "",
        });
      }, 5000);
    } catch (err: any) {
      console.error("Error submitting quote:", err);
      setError(err.message || "Failed to submit quote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-16 h-16 text-[#00FFB0] mx-auto" />
          </motion.div>
          <h3 className="text-2xl text-[#0A1020]">Quote Request Received!</h3>
          <p className="text-gray-600">
            Our team will contact you within 30 minutes with your personalized quote.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90 mt-4"
          >
            Login to View Your Quotes
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <Card id="quote-form" className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl text-[#0A1020]">Get Your Free Quote</h2>
          <p className="text-gray-600">Fill out the form and get an instant estimate</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pickup Location */}
          <div className="space-y-2">
            <Label htmlFor="pickup" className="text-[#0A1020]">
              Pickup Location
            </Label>
            <Input
              id="pickup"
              placeholder="City, State or ZIP"
              className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
              value={formData.pickup}
              onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
              required
            />
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <Label htmlFor="delivery" className="text-[#0A1020]">
              Delivery Location
            </Label>
            <Input
              id="delivery"
              placeholder="City, State or ZIP"
              className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
              value={formData.delivery}
              onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
              required
            />
          </div>

          {/* Vehicle Make & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make" className="text-[#0A1020]">
                Vehicle Make
              </Label>
              <Input
                id="make"
                placeholder="e.g., Toyota"
                className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-[#0A1020]">
                Vehicle Model
              </Label>
              <Input
                id="model"
                placeholder="e.g., Camry"
                className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Transport Type */}
          <div className="space-y-2">
            <Label htmlFor="transport-type" className="text-[#0A1020]">
              Transport Type
            </Label>
            <Select 
              required
              value={formData.transport_type}
              onValueChange={(value) => setFormData({ ...formData, transport_type: value as 'open' | 'enclosed' })}
            >
              <SelectTrigger className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]">
                <SelectValue placeholder="Select transport type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open Transport</SelectItem>
                <SelectItem value="enclosed">Enclosed Transport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Pickup Date */}
          <div className="space-y-2">
            <Label htmlFor="pickup_date" className="text-[#0A1020]">
              Preferred Pickup Date (optional)
            </Label>
            <Input
              id="pickup_date"
              type="date"
              className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
              value={formData.pickup_date}
              onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#0A1020]">
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0A1020]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#0A1020]">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                className="border-gray-300 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90 h-12 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Get My Quote"}
          </Button>
        </form>

        <p className="text-xs text-center text-gray-500">
          By submitting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </Card>
  );
}
