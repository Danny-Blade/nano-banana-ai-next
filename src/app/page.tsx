import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Editor from "@/components/Editor";
import Examples from "@/components/Examples";
import CommunityGallery from "@/components/CommunityGallery";
import WhyChoose from "@/components/WhyChoose";
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
      <PricingCards />
      <FAQ />
      <Footer />
    </main>
  );
}
