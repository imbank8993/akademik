"use client";

import { useState, useEffect } from "react";
import Reveal from "./Reveal";

interface Testimonial {
    name: string;
    quote: string;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [newName, setNewName] = useState("");
    const [newQuote, setNewQuote] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://acca.icgowa.sch.id") + "/api/testimonials";

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setError("");
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Gagal mengambil data dari server");

            const json = await res.json();
            if (json.ok) {
                setTestimonials(json.data);
            } else {
                throw new Error(json.error || "Terjadi kesalahan pada server");
            }
        } catch (e) {
            console.error("Gagal mengambil testimoni:", e);
            setError("Gagal memuat testimoni. Pastikan backend aktif.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuote.trim()) return;

        const entry = {
            name: newName.trim() || "Anonim",
            quote: newQuote,
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });

            const json = await res.json();

            if (res.ok && json.ok) {
                fetchTestimonials(); // Refresh data
                setNewName("");
                setNewQuote("");
                alert("Testimoni berhasil dikirim!");
            } else {
                throw new Error(json.error || "Gagal mengirim data");
            }
        } catch (e) {
            alert("Gagal mengirim testimoni. Pastikan backend aktif.");
        }
    };

    // Show only the latest 4
    const displayedTestimonials = testimonials.slice(0, 4);

    return (
        <section id="testimonials" className="section" style={{ backgroundColor: 'var(--bg)', position: 'relative', zIndex: 1 }}>
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Apa Kata Mereka?</h2>
                        <p className="muted">Pengalaman pengguna dalam menggunakan portal akademik ACCA.</p>
                    </div>
                </Reveal>

                <div className="grid2">
                    {loading && <p>Memuat testimoni...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && displayedTestimonials.length === 0 && <p>Belum ada testimoni.</p>}
                    {displayedTestimonials.map((t, i) => (
                        <Reveal key={i} delay={i * 100}>
                            <div className="card test-card">
                                <p className="quote">“{t.quote}”</p>
                                <div className="quoteBy">{t.name}</div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={300}>
                    <div className="testimonial-form-container">
                        <div className="form-card">
                            <h3 className="h3">Tulis Testimoni Anda</h3>
                            <form onSubmit={handleSubmit} className="test-form">
                                <input
                                    type="text"
                                    placeholder="Nama Anda (Opsional)"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="form-input"
                                />
                                <textarea
                                    placeholder="Bagikan pengalaman Anda menggunakan ACCA..."
                                    value={newQuote}
                                    onChange={(e) => setNewQuote(e.target.value)}
                                    required
                                    className="form-textarea"
                                />
                                <button type="submit" className="btn primary full-width">
                                    Kirim Testimoni
                                </button>
                            </form>
                        </div>
                    </div>
                </Reveal>
            </div>

            <style jsx>{`
                .test-card {
                    height: 100%;
                }
                .testimonial-form-container {
                    margin-top: 60px;
                    display: flex;
                    justify-content: center;
                }
                .form-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 600px;
                    box-shadow: var(--shadow-sm);
                }
                .form-card h3 {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .test-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .form-input, .form-textarea {
                    padding: 14px 18px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    background: var(--bg-alt);
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    font-family: inherit;
                }
                .form-input:focus, .form-textarea:focus {
                    border-color: var(--primary);
                    background: white;
                    box-shadow: 0 0 0 4px var(--primary-light);
                }
                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                }
                .full-width {
                    width: 100%;
                }
            `}</style>
        </section>
    );
}
