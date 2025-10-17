import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import blueTruckImage from "figma:asset/67c84d6153f87213610be578e9b4e694c7cf10c5.png";

const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "Los Angeles, CA",
    avatar: "SM",
    rating: 5,
    text: "Apex Auto Movers made my cross-country move stress-free. My car arrived on time and in perfect condition. The communication throughout was excellent!",
  },
  {
    name: "Michael Chen",
    location: "Miami, FL",
    avatar: "MC",
    rating: 5,
    text: "Professional service from start to finish. They handled my classic car with extreme care. I wouldn't trust anyone else with my vehicles.",
  },
  {
    name: "Jennifer Lopez",
    location: "Austin, TX",
    avatar: "JL",
    rating: 5,
    text: "Great pricing and even better service. The driver was courteous and kept me updated every step of the way. Highly recommend!",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-b from-[#0A1020] to-[#0f1830]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: `url(${blueTruckImage})`,
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
            What Our <span className="text-[#00FFB0]">Customers Say</span>
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Trusted by thousands of satisfied customers nationwide
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full hover:bg-white/10 transition-all duration-300 hover:border-[#00FFB0]/50 relative">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-8 h-8 text-[#00FFB0]/20" />

                {/* Rating */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + i * 0.1 }}
                    >
                      <Star className="w-5 h-5 fill-[#00FFB0] text-[#00FFB0]" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-white/80 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="border-2 border-[#00FFB0]/30">
                    <AvatarFallback className="bg-[#00FFB0]/20 text-[#00FFB0]">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white">{testimonial.name}</p>
                    <p className="text-white/50 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
