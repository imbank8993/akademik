import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Informasi from "@/components/Informasi";
import Agenda from "@/components/Agenda";
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
        <Agenda />
        <Laporan />
        <Testimonials />
        <Aplikasi />
        <Footer />
      </main>
      <FloatingWhatsApp />
    </>
  );
}