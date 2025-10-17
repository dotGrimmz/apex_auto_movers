import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Menu, X, User } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "./RouterContext";
import { getCurrentUser } from "../utils/auth";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { navigate } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    
    // Check login status
    checkLoginStatus();
  }, []);

  async function checkLoginStatus() {
    try {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    } catch {
      setIsLoggedIn(false);
    }
  }

  const scrollToQuote = () => {
    const quoteSection = document.getElementById("quote-form");
    quoteSection?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#0A1020]/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-[#00FFB0] rounded-lg flex items-center justify-center">
              <span className="text-[#0A1020] font-bold text-xl">A</span>
            </div>
            <span className="text-white text-xl tracking-tight">
              Apex Auto Movers
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white/80 hover:text-[#00FFB0] transition-colors">
              Home
            </a>
            <a href="#services" className="text-white/80 hover:text-[#00FFB0] transition-colors">
              Services
            </a>
            <a href="#about" className="text-white/80 hover:text-[#00FFB0] transition-colors">
              About
            </a>
            <a href="#contact" className="text-white/80 hover:text-[#00FFB0] transition-colors">
              Contact
            </a>
            {isLoggedIn ? (
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-[#00FFB0]/50 text-[#00FFB0] hover:bg-[#00FFB0]/10"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            )}
            <Button
              onClick={scrollToQuote}
              className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90"
            >
              Get a Quote
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-white/80 hover:text-[#00FFB0] transition-colors">
                Home
              </a>
              <a href="#services" className="text-white/80 hover:text-[#00FFB0] transition-colors">
                Services
              </a>
              <a href="#about" className="text-white/80 hover:text-[#00FFB0] transition-colors">
                About
              </a>
              <a href="#contact" className="text-white/80 hover:text-[#00FFB0] transition-colors">
                Contact
              </a>
              {isLoggedIn ? (
                <Button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="border-[#00FFB0]/50 text-[#00FFB0] hover:bg-[#00FFB0]/10 w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 w-full"
                >
                  Sign In
                </Button>
              )}
              <Button
                onClick={scrollToQuote}
                className="bg-[#00FFB0] text-[#0A1020] hover:bg-[#00FFB0]/90 w-full"
              >
                Get a Quote
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
