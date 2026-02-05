"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./laporan.css";

export default function LaporanPage() {
    const forms = [
        {
            title: "Jurnal Pembelajaran",
            description: "Catat kegiatan belajar mengajar harian, kehadiran siswa, dan progress materi.",
            icon: "bi-journal-check",
            href: "/laporan/jurnal-pembelajaran",
            active: true
        },
        {
            title: "Laporan Piket",
            description: "Laporan harian petugas piket terkait kejadian penting, keterlambatan, dan sarpras.",
            icon: "bi-shield-check",
            href: "/laporan/piket",
            active: true
        },
        {
            title: "Laporan Wali Kelas",
            description: "Monitoring kehadiran dan perkembangan siswa perwalian (Segera Hadir).",
            icon: "bi-people",
            href: "#",
            locked: true
        }
    ];

    return (
        <>
            <Header />
            <main className="laporan-page">
                <div className="laporan-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <i className="bi bi-grid-fill"></i>
                        </div>
                        <div>
                            <h1>Pusat Laporan</h1>
                            <p>Pilih formulir laporan digital yang ingin Anda isi</p>
                        </div>
                    </div>
                </div>

                <div className="grid2" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {forms.map((form, index) => (
                        <Link
                            key={index}
                            href={form.locked ? '#' : form.href}
                            className={`card report-card ${form.locked ? 'locked' : ''}`}
                        >
                            <div className="card-icon">
                                <i className={`bi ${form.icon}`}></i>
                            </div>

                            <h3 className="card-title">
                                {form.title}
                                {form.locked && <i className="bi bi-lock-fill lock-icon"></i>}
                            </h3>

                            <p className="card-desc">
                                {form.description}
                            </p>

                            <div className="card-action">
                                {form.locked ? (
                                    <span className="muted">Belum Tersedia</span>
                                ) : (
                                    <span className="accent">Buka Formulir <i className="bi bi-arrow-right"></i></span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
            <Footer />

            <style jsx>{`
        .report-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          height: 100%;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
        }

        .report-card:hover {
          border-color: var(--primary);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .card-desc {
          color: var(--text-dim);
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }

        .card-action {
          margin-top: auto;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .lock-icon {
          font-size: 0.8em;
          color: var(--text-muted);
        }

        .report-card.locked {
          opacity: 0.7;
          cursor: not-allowed;
          background: var(--bg-alt);
        }
        
        .report-card.locked:hover {
          transform: none;
          box-shadow: var(--shadow-sm);
          border-color: var(--border);
        }
      `}</style>
        </>
    );
}
