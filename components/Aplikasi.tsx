import Reveal from "./Reveal";

export default function Aplikasi() {
    return (
        <section id="apps" className="section cta">
            <div className="container">
                <Reveal>
                    <div className="ctaBox">
                        <div>
                            <h2 className="h2">Akses Aplikasi Akademik</h2>
                            <p className="muted">
                                Masuk ke sistem informasi akademik terpadu MAN Insan Cendekia Gowa melalui portal ACCA.
                            </p>
                        </div>
                        <div className="ctaActions">
                            <a className="btn primary" href="https://acca.icgowa.sch.id">
                                Buka ACCA
                            </a>
                            <a className="btn ghost" href="#home">
                                Beranda
                            </a>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
