import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PopularServices from '@/components/home/PopularServices';
import FeaturedClinics from '@/components/home/FeaturedClinics';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import EmergencyCta from '@/components/home/EmergencyCta';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-palette-cream font-sans antialiased text-palette-charcoal selection:bg-palette-primary selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PopularServices />
        <FeaturedClinics />
        <WhyChooseUs />
        <EmergencyCta />
      </main>
      <Footer />
    </div>
  );
}