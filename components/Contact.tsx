import Reveal from "./Reveal";

export default function Contact() {
    return (
        <section id="contact" className="section cta">
            <div className="container">
                <Reveal>
                    <div className="ctaBox">
                        <div>
                            <h2 className="h2">Siap Launch Landing Page-mu?</h2>
                            <p className="muted">
                                Tinggal ganti konten, logo, dan warna brand. Bisa juga saya bantu tambah section.
                            </p>
                        </div>
                        <div className="ctaActions">
                            <a className="btn primary" href="mailto:hello@yourdomain.com">
                                Email Saya
                            </a>
                            <a className="btn ghost" href="#home">
                                Kembali ke Atas
                            </a>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
