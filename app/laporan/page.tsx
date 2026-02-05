'use client';

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./laporan.css";

export default function LaporanPage() {
    const forms = [
        {
            title: "Jurnal Pembelajaran",
            description: "Catat kegiatan belajar mengajar harian, kehadiran siswa, dan progress materi secara real-time.",
            icon: "bi-journal-check",
            href: "/laporan/jurnal-pembelajaran",
            badge: "Harian"
        },
        {
            title: "Laporan Piket",
            description: "Laporan harian petugas piket terkait kejadian penting, keterlambatan, dan situasi sekolah.",
            icon: "bi-shield-check",
            href: "/laporan/piket",
            badge: "Harian"
        },
        {
            title: "Unggah Dokumen",
            description: "Simpan dokumen akademik, sertifikat, atau file penting lainnya ke cloud storage.",
            icon: "bi-cloud-arrow-up",
            href: "/upload",
            badge: "Cloud"
        },
        {
            title: "Laporan Wali Kelas",
            description: "Monitoring kehadiran dan perkembangan siswa perwalian (Tahap Pengembangan).",
            icon: "bi-people",
            href: "#",
            locked: true
        }
    ];

    return (
        <>
            <Header />
            <main className="laporan-page">
                <header className="laporan-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <i className="bi bi-grid-fill"></i>
                        </div>
                        <h1>Pusat Laporan</h1>
                        <p>Portal Pelaporan Digital MAN Insan Cendekia Gowa</p>
                    </div>
                </header>

                <div className="laporan-grid-premium">
                    {forms.map((form, index) => (
                        <Link
                            key={index}
                            href={form.locked ? '#' : form.href}
                            className={`report-card-premium ${form.locked ? 'locked' : ''}`}
                        >
                            <div className="card-top">
                                <div className="card-icon-box-premium">
                                    <i className={`bi ${form.icon}`}></i>
                                </div>
                                {form.badge && <span className="card-badge">{form.badge}</span>}
                            </div>

                            <div className="card-info">
                                <h3 className="card-title-premium">
                                    {form.title}
                                    {form.locked && <i className="bi bi-lock-fill lock-icon-small"></i>}
                                </h3>
                                <p className="card-desc-premium">{form.description}</p>
                            </div>

                            <div className="card-footer-premium">
                                {form.locked ? (
                                    <span className="text-muted-premium">Segera Hadir</span>
                                ) : (
                                    <span className="text-accent-premium">
                                        Buka Formulir <i className="bi bi-arrow-right"></i>
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />

            <style jsx>{`
                .laporan-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 2rem;
                    margin-top: 1rem;
                }

                .report-card-premium {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    padding: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .report-card-premium:hover:not(.locked) {
                    transform: translateY(-8px);
                    border-color: var(--primary);
                    box-shadow: 0 20px 25px -5px rgba(30, 64, 175, 0.1);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .card-icon-box-premium {
                    width: 56px;
                    height: 56px;
                    background: #eff6ff;
                    color: #2563eb;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                }

                .card-badge {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .card-title-premium {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 0.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .card-desc-premium {
                    color: #64748b;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    margin: 0;
                }

                .card-footer-premium {
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                    font-weight: 700;
                    font-size: 0.8rem;
                }

                .text-accent-premium { color: #1e40af; display: flex; align-items: center; gap: 8px; }
                .text-muted-premium { color: #94a3b8; font-style: italic; }

                .report-card-premium.locked {
                    background: #f8fafc;
                    border-style: dashed;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .lock-icon-small { font-size: 0.8rem; color: #94a3b8; }
            `}</style>
        </>
    );
}
