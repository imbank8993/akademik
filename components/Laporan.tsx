"use client";

import Reveal from "./Reveal";
import Link from "next/link";

const forms = [
    {
        title: "Jurnal Pembelajaran",
        description: "Catat kegiatan belajar mengajar harian, kehadiran siswa, dan progress materi.",
        icon: "bi-journal-check",
        href: "/laporan/jurnal-pembelajaran",
        active: true,
        locked: false
    },
    {
        title: "Laporan Piket",
        description: "Laporan harian petugas piket terkait kejadian penting, keterlambatan, dan sarpras.",
        icon: "bi-clipboard-data-fill",
        href: "/laporan/piket",
        active: true,
        highlight: true,
        locked: false
    },
];

export default function Laporan() {
    return (
        <section id="laporan" className="section">
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Pusat Laporan</h2>
                        <p className="muted">Pilih formulir laporan digital yang ingin Anda isi secara mudah dan cepat.</p>
                    </div>
                </Reveal>

                <div className="reports-grid">
                    {forms.map((form, i) => (
                        <Reveal key={form.title} delay={i * 90}>
                            <Link
                                href={form.locked ? '#' : form.href}
                                className={`report-card ${form.highlight ? "highlight" : ""} ${form.locked ? "locked" : ""}`}
                            >
                                <div className="card-icon">
                                    <i className={`bi ${form.icon}`}></i>
                                </div>
                                <h3 className="h3">
                                    {form.title}
                                    {form.locked && <i className="bi bi-lock-fill" style={{ fontSize: '0.7em', marginLeft: '8px', opacity: 0.5 }}></i>}
                                </h3>
                                <p className="muted">{form.description}</p>

                                <div className="btn-container">
                                    <div className={`btn ${form.highlight ? "primary" : "ghost"}`}>
                                        {form.locked ? "Segera Hadir" : "Buka Formulir"}
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>

            <style jsx>{`
                /* Grid Layout */
                .reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 32px;
                    width: 100%;
                }

                /* Card Styles */
                .report-card {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    height: 100%;
                    min-height: 480px; /* Taller card to prevent cutoff */
                    text-decoration: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 32px;
                    background: white; /* Explicit white background */
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* Subtle base shadow */
                }
                
                .report-card:hover {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    transform: translateY(-8px);
                    border-color: var(--primary);
                }
                
                .report-card.highlight {
                    border-color: var(--primary);
                    background: #f8fafc;
                    background: linear-gradient(to bottom right, #ffffff, #eff6ff);
                    box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.1);
                    z-index: 2;
                }
                
                .report-card.locked {
                    opacity: 0.8;
                    cursor: not-allowed;
                    background: #f1f5f9;
                    border-color: var(--border);
                }

                .report-card.locked .btn {
                    border-color: #cbd5e1;
                    color: #94a3b8;
                    background: transparent;
                    box-shadow: none;
                }
                
                /* Icon Styles */
                .card-icon {
                    width: 64px;
                    height: 64px;
                    background: #f1f5f9;
                    color: var(--primary);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px; /* Font size for Bootstrap icons */
                    margin-bottom: 24px;
                    transition: all 0.3s ease;
                }

                .report-card.highlight .card-icon {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 20px -10px rgba(30, 64, 175, 0.5);
                }
                
                .report-card:hover .card-icon {
                   transform: scale(1.1) rotate(5deg);
                }
                
                /* Typography */
                .h3 {
                    margin: 0 0 12px 0;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.2;
                }

                .muted {
                    margin: 0 0 32px 0;
                    line-height: 1.6;
                    color: #64748b;
                    font-size: 1rem;
                }

                /* Button Styles */
                .btn-container {
                    margin-top: auto; /* Push button to bottom */
                    width: 100%;
                }

                .btn {
                    width: 100%;
                    padding: 14px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    text-align: center;
                    transition: all 0.2s;
                    display: block; /* Ensure block level */
                }

                .btn.ghost {
                    background: white;
                    border: 1.5px solid var(--primary);
                    color: var(--primary);
                }
                
                .btn.ghost:hover {
                    background: #eff6ff;
                }

                .btn.primary {
                    background: var(--primary);
                    color: white;
                    border: 1.5px solid var(--primary);
                    box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.3);
                }

                .btn.primary:hover {
                    background: #1e3a8a;
                    border-color: #1e3a8a;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 12px -2px rgba(30, 64, 175, 0.4);
                }
            `}</style>
        </section>
    );
}
