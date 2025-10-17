import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { FeatureTiles } from "../components/FeatureTiles";
import { Testimonials } from "../components/Testimonials";
import { Newsletter } from "../components/Newsletter";
import { Footer } from "../components/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A1020]">
      <Header />
      <main>
        <HeroSection />
        <FeatureTiles />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
