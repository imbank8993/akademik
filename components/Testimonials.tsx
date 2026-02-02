import Reveal from "./Reveal";

const testimonials = [
    {
        name: "Raka — Product Lead",
        quote:
            "Tampilannya clean dan premium. Hero section-nya langsung jualan, animasi juga smooth.",
    },
    {
        name: "Nadia — Founder",
        quote:
            "Header + section layout sangat rapi. Tinggal ganti copywriting dan warna brand.",
    },
];

export default function Testimonials() {
    return (
        <section id="testimonials" className="section alt">
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Dipercaya Tim Modern</h2>
                        <p className="muted">Testimoni contoh untuk memperkuat kredibilitas.</p>
                    </div>
                </Reveal>

                <div className="grid2">
                    {testimonials.map((t, i) => (
                        <Reveal key={t.name} delay={i * 100}>
                            <div className="card">
                                <p className="quote">“{t.quote}”</p>
                                <div className="quoteBy">{t.name}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
