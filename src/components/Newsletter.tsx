import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Mail, CheckCircle2 } from "lucide-react";
import { api } from "../utils/api";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      try {
        await api.subscribeNewsletter(email);
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        console.error("Newsletter subscription error:", error);
        alert("Failed to subscribe. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-b from-[#0f1830] to-[#0A1020]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-[#00FFB0]/10 to-[#00FFB0]/5 border border-[#00FFB0]/20 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #00FFB0 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="inline-flex"
              >
                <div className="w-16 h-16 bg-[#00FFB0]/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#00FFB0]" />
                </div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white">
                  Join the <span className="text-[#00FFB0]">Drivers Circle</span>
                </h2>
                <p className="text-white/70 text-lg">
                  Get exclusive transport tips, seasonal deals, and industry insights delivered to your inbox
                </p>
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
                  >
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-14 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[#00FFB0] focus:ring-[#00FFB0]"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="h-14 px-8 bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90 disabled:opacity-50"
                    >
                      {loading ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-[#00FFB0]" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-2xl text-white">Welcome to the Circle!</h3>
                      <p className="text-white/70">
                        Check your inbox for a confirmation email
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Privacy Note */}
              <p className="text-white/50 text-sm">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
