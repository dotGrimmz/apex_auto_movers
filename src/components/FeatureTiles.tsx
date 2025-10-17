import { motion } from "motion/react";
import { Truck, Shield, MapPin } from "lucide-react";
import carHaulerImage from "figma:asset/f4310fbe11264a0db393297d1908e925bb8d8f5b.png";

const features = [
  {
    icon: Truck,
    title: "Door to Door Delivery",
    description: "We pick up from your location and deliver directly to your destination. No need to visit a terminal.",
  },
  {
    icon: Shield,
    title: "Fully Insured Carriers",
    description: "Every vehicle is protected with comprehensive insurance coverage during the entire transport process.",
  },
  {
    icon: MapPin,
    title: "Nationwide Coverage",
    description: "We service all 50 states with a network of trusted carriers and logistics partners.",
  },
];

export function FeatureTiles() {
  return (
    <section id="services" className="relative py-20 sm:py-32 bg-[#0A1020]">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: `url(${carHaulerImage})`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white">
            Why Choose <span className="text-[#00FFB0]">Apex Auto Movers</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Professional vehicle transport with unmatched service quality
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 hover:border-[#00FFB0]/50">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 bg-[#00FFB0]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#00FFB0]/30 transition-colors"
                >
                  <feature.icon className="w-8 h-8 text-[#00FFB0]" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl text-white mb-4">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
