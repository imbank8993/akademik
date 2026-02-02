import Reveal from "./Reveal";

export default function Hero() {
    return (
        <section id="home" className="section hero">
            <div className="container heroGrid">
                <div className="heroLeft">
                    <Reveal>
                        <div className="badge">Denim Blue • Modern • Fast</div>
                    </Reveal>

                    <Reveal delay={80}>
                        <h1 className="h1">
                            Landing Page Profesional <span className="accent">Nuansa Denim Blue</span>
                        </h1>
                    </Reveal>

                    <Reveal delay={160}>
                        <p className="lead">
                            Template Next.js yang clean, responsif, dan siap dipakai untuk SaaS, agency,
                            produk digital, atau company profile.
                        </p>
                    </Reveal>

                    <Reveal delay={240}>
                        <div className="heroCtas">
                            <a className="btn primary" href="#contact">
                                Mulai Sekarang
                            </a>
                            <a className="btn ghost" href="#features">
                                Lihat Fitur
                            </a>
                        </div>
                    </Reveal>

                    <Reveal delay={320}>
                        <div className="heroStats">
                            <div className="stat">
                                <div className="statNum">99.9%</div>
                                <div className="statLabel">Uptime</div>
                            </div>
                            <div className="stat">
                                <div className="statNum">&lt; 1s</div>
                                <div className="statLabel">Fast load</div>
                            </div>
                            <div className="stat">
                                <div className="statNum">A+</div>
                                <div className="statLabel">Design polish</div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                <div className="heroRight">
                    <Reveal>
                        <div className="heroCard">
                            <div className="heroCardTop">
                                <div className="dots">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className="pill">Live Preview</div>
                            </div>

                            <div className="heroMock">
                                <div className="mockLine w80" />
                                <div className="mockLine w60" />
                                <div className="mockLine w90" />
                                <div className="mockChart">
                                    <span style={{ height: "45%" }} />
                                    <span style={{ height: "70%" }} />
                                    <span style={{ height: "55%" }} />
                                    <span style={{ height: "85%" }} />
                                    <span style={{ height: "62%" }} />
                                </div>
                                <div className="mockLine w70" />
                                <div className="mockLine w50" />
                            </div>
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
