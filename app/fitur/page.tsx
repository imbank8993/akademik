"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const fiturData = [
    {
        title: "Dashboard Utama ACCA",
        description: "Pusat kendali informasi akademik yang menampilkan statistik dan ringkasan data penting secara visual dan real-time.",
        image: "/acca 1.png",
        icon: "bi-speedometer2"
    },
    {
        title: "Pengaturan Data Strategis",
        description: "Kelola konfigurasi sistem dan parameter akademik dengan mudah untuk menyesuaikan kebutuhan operasional sekolah.",
        image: "/acca 2.png",
        icon: "bi-gear-wide-connected"
    },
    {
        title: "Sistem Absensi Kehadiran",
        description: "Pencatatan kehadiran siswa secara digital yang terintegrasi langsung dengan laporan wali kelas dan jurnal guru.",
        image: "/acca 3.png",
        icon: "bi-person-check"
    },
    {
        title: "Manajemen Master Data",
        description: "Pusat penyimpanan data guru, siswa, kelas, dan mata pelajaran yang terorganisir untuk konsistensi data seluruh sistem.",
        image: "/acca 4.png",
        icon: "bi-database-fill-gear"
    }
];

export default function FiturPage() {
    return (
        <>
            <Header />
            <main className="fitur-page-container">
                {/* Background Blobs */}
                <div className="blob blob1"></div>
                <div className="blob blob2"></div>

                <section className="fitur-hero">
                    <div className="container">
                        <Reveal>
                            <div className="badge" style={{ marginBottom: '1rem' }}>Eksplorasi Fitur</div>
                            <h1 className="h1">Fitur Unggulan <span className="accent">ACCA</span></h1>
                            <p className="lead" style={{ margin: '20px auto', maxWidth: '700px' }}>
                                Jelajahi berbagai kemudahan yang ditawarkan oleh ACCA dalam mendukung efisiensi pendidikan.
                            </p>
                        </Reveal>
                    </div>
                </section>

                <section className="fitur-grid-section">
                    <div className="container">
                        <div className="fitur-grid">
                            {fiturData.map((fitur, index) => (
                                <Reveal key={index} delay={index * 150}>
                                    <div className="fitur-card">
                                        <div className="fitur-image-wrapper">
                                            <img
                                                src={fitur.image}
                                                alt={fitur.title}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "https://placehold.co/600x400/1e40af/ffffff?text=Preview+Gambar";
                                                }}
                                            />
                                        </div>
                                        <div className="fitur-content">
                                            <div className="fitur-icon">
                                                <i className={`bi ${fitur.icon}`}></i>
                                            </div>
                                            <h3 className="h3">{fitur.title}</h3>
                                            <p className="muted">{fitur.description}</p>
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <FloatingWhatsApp />

            <style jsx>{`
                .fitur-page-container {
                    padding-top: 140px;
                    min-height: 100vh;
                    position: relative;
                }

                .fitur-hero {
                    text-align: center;
                    padding-bottom: 60px;
                }

                .fitur-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(45%, 1fr));
                    gap: 40px;
                    padding-bottom: 100px;
                }

                .fitur-card {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                    transition: all 0.3s ease;
                }

                .fitur-card:hover {
                    transform: translateY(-10px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--primary);
                }

                .fitur-image-wrapper {
                    width: 100%;
                    height: 300px;
                    overflow: hidden;
                    background: var(--bg-alt);
                    border-bottom: 1px solid var(--border);
                }

                .fitur-image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .fitur-card:hover .fitur-image-wrapper img {
                    transform: scale(1.05);
                }

                .fitur-content {
                    padding: 32px;
                    position: relative;
                }

                .fitur-icon {
                    position: absolute;
                    top: -15px;
                    right: 20px;
                    width: 30px;
                    height: 30px;
                    background: var(--primary);
                    color: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 15px;
                    box-shadow: 0 6px 12px rgba(30, 64, 175, 0.2);
                }

                .fitur-content .h3 {
                    margin-bottom: 12px;
                    font-size: 22px;
                }

                .fitur-content .muted {
                    font-size: 15px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .fitur-grid {
                        grid-template-columns: 1fr;
                        gap: 30px;
                    }
                    .fitur-image-wrapper {
                        height: 200px;
                    }
                    .fitur-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 20px;
                        top: -25px;
                        right: 20px;
                    }
                }
            `}</style>
        </>
    );
}
