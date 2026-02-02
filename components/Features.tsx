import Reveal from "./Reveal";

const features = [
    {
        title: "Desain Marine Premium",
        desc: "Palet biru marine + gradien modern, cocok untuk brand yang elegan.",
    },
    {
        title: "Animasi Reveal",
        desc: "Elemen muncul saat discroll dengan transisi halus (tanpa library berat).",
    },
    {
        title: "Header Sticky + Mobile Menu",
        desc: "Navigasi jelas, responsif, dan nyaman dipakai di semua device.",
    },
];

export default function Features() {
    return (
        <section id="features" className="section">
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Fitur Utama</h2>
                        <p className="muted">
                            Layout rapi, animasi halus, dan komponen yang gampang di-custom.
                        </p>
                    </div>
                </Reveal>

                <div className="grid3">
                    {features.map((f, i) => (
                        <Reveal key={f.title} delay={i * 90}>
                            <div className="card featureCard">
                                <div className="iconCircle">{i + 1}</div>
                                <h3 className="h3">{f.title}</h3>
                                <p className="muted">{f.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
