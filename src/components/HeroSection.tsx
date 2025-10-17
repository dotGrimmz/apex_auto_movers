import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { QuoteForm } from "./QuoteForm";
import mapImage from "figma:asset/1225499557b8013009f2c1abae96d833956cf5ef.png";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effect - slower movement for background
  const y = useTransform(scrollY, [0, 1000], [0, 300]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Parallax Background */}
      <motion.div
        style={{ y: mounted ? y : 0, opacity: mounted ? opacity : 1 }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${mapImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1020]/80 via-[#0A1020]/90 to-[#0A1020]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white space-y-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl lg:text-6xl leading-tight"
            >
              Move Your Vehicle{" "}
              <span className="text-[#00FFB0]">Anywhere</span> — Fast & Secure
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-lg sm:text-xl text-white/80"
            >
              Nationwide auto transport with door-to-door service. Trusted by thousands of customers across all 50 states.
            </motion.p>

            {/* Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00FFB0] rounded-full" />
                <span className="text-white/70">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00FFB0] rounded-full" />
                <span className="text-white/70">Instant Quotes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00FFB0] rounded-full" />
                <span className="text-white/70">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Quote Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <QuoteForm />
          </motion.div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A1020] to-transparent z-[5]" />
    </section>
  );
}
