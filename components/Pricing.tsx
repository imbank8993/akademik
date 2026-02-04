import Reveal from "./Reveal";

const plans = [
    { name: "Starter", price: "Gratis", perks: ["1 halaman", "CTA + section", "Responsif"] },
    {
        name: "Pro",
        price: "Rp149k",
        perks: ["Semua Starter", "Animasi reveal", "SEO-ready struktur"],
        highlight: true,
    },
    { name: "Business", price: "Rp399k", perks: ["Semua Pro", "Custom section", "Support"] },
];

export default function Pricing() {
    return (
        <section id="reports" className="section">
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Laporan & Statistik</h2>
                        <p className="muted">Pantau perkembangan akademik siswa secara transparan dan akurat.</p>
                    </div>
                </Reveal>

                <div className="grid3">
                    {plans.map((p, i) => (
                        <Reveal key={p.name} delay={i * 90}>
                            <div className={`card priceCard ${p.highlight ? "highlight" : ""}`}>
                                <div className="priceTop">
                                    <h3 className="h3">{p.name}</h3>
                                    <div className="price">{p.price}</div>
                                </div>
                                <ul className="list">
                                    {p.perks.map((x) => (
                                        <li key={x}>{x}</li>
                                    ))}
                                </ul>
                                <a className={`btn ${p.highlight ? "primary" : "ghost"}`} href="#contact">
                                    Pilih {p.name}
                                </a>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
