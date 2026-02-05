import Reveal from "./Reveal";

export default function Hero() {
    return (
        <section id="home" className="section hero">
            <div className="container heroGrid">
                <div className="heroLeft">
                    <Reveal>
                        <div className="badge">Tahun 2025/2026</div>
                    </Reveal>

                    <Reveal delay={80}>
                        <h1 className="h1">
                            Selamat Datang di Laman Akademik <span className="accent">MAN Insan Cendekia Gowa</span>
                        </h1>
                    </Reveal>

                    <Reveal delay={160}>
                        <p className="lead">
                            Menampilkan berbagai layanan, program, dan informasi terkini seputar Akademik MAN Insan Cendekia Gowa.
                        </p>
                    </Reveal>

                    <Reveal delay={240}>
                        <div className="heroCtas">
                            <a className="btn primary" href="https://acca.icgowa.sch.id" target="_blank" rel="noopener noreferrer">
                                Mulai Sekarang
                            </a>
                            <a className="btn ghost" href="/fitur">
                                Lihat Fitur
                            </a>
                        </div>
                    </Reveal>


                </div>


            </div>

            {/* animated background blobs */}
            <div className="blob blob1" />
            <div className="blob blob2" />
        </section>
    );
}
