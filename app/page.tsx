import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Informasi from "@/components/Informasi";
import Testimonials from "@/components/Testimonials";
import Laporan from "@/components/Laporan";
import Aplikasi from "@/components/Aplikasi";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Informasi />
        <Laporan />
        <Testimonials />
        <Aplikasi />
        <Footer />
      </main>
      <FloatingWhatsApp />
    </>
  );
}