import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Editor from "@/components/Editor";
import Examples from "@/components/Examples";
import CommunityGallery from "@/components/CommunityGallery";
import WhyChoose from "@/components/WhyChoose";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import PricingCards from "@/components/PricingCards";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Editor />
      <Examples />
      <CommunityGallery />
      <WhyChoose />
      <Stats />
      <Testimonials />
      <PricingCards />
      <FAQ />
      <Footer />
    </main>
  );
}
