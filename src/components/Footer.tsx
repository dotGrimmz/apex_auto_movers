import { motion } from "motion/react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

const footerLinks = {
  Company: [
    { label: "About Us", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Careers", href: "#careers" },
    { label: "Blog", href: "#blog" },
  ],
  Support: [
    { label: "Help Center", href: "#help" },
    { label: "Contact Us", href: "#contact" },
    { label: "FAQs", href: "#faq" },
    { label: "Track Shipment", href: "#track" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Cookie Policy", href: "#cookies" },
    { label: "GDPR", href: "#gdpr" },
  ],
};

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0A1020] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-[#00FFB0] rounded-lg flex items-center justify-center">
                <span className="text-[#0A1020] font-bold text-xl">A</span>
              </div>
              <span className="text-white text-xl tracking-tight">
                Apex Auto Movers
              </span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Professional vehicle transport services across all 50 states. Trust us to move your vehicle safely and efficiently.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/70">
                <Phone className="w-5 h-5 text-[#00FFB0]" />
                <span>(800) 555-APEX</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <Mail className="w-5 h-5 text-[#00FFB0]" />
                <span>info@apexautomovers.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/70">
                <MapPin className="w-5 h-5 text-[#00FFB0]" />
                <span>Nationwide Service</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-white/5 hover:bg-[#00FFB0]/20 border border-white/10 hover:border-[#00FFB0]/50 rounded-lg flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-white/70 hover:text-[#00FFB0]" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-white">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-[#00FFB0] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Apex Auto Movers LLC. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#privacy" className="text-white/50 hover:text-[#00FFB0] text-sm transition-colors">
                Privacy
              </a>
              <a href="#terms" className="text-white/50 hover:text-[#00FFB0] text-sm transition-colors">
                Terms
              </a>
              <a href="#cookies" className="text-white/50 hover:text-[#00FFB0] text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
