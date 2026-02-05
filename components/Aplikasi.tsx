'use client';
import Reveal from "./Reveal";
import Image from "next/image";

export default function Aplikasi() {
    const apps = [
        {
            id: 'acca',
            name: 'ACCA Portal',
            desc: 'Sistem Informasi Akademik Terpadu untuk manajemen data nilai, absensi, dan administrasi sekolah.',
            logo: '/logo-acca.png',
            url: 'https://acca.icgowa.sch.id',
            btnText: 'Buka ACCA'
        },
        {
            id: 'rdm',
            name: 'RDM Madrasah',
            desc: 'Raport Digital Madrasah untuk penginputan nilai dan pengelolaan hasil belajar siswa secara digital.',
            logo: '/logo-rdm-madrasah-png.png',
            url: 'https://rdm.icgowa.sch.id', // Assuming logical URL, user can fix if different
            btnText: 'Buka RDM'
        }
    ];

    return (
        <section id="apps" className="section alt">
            <div className="container">
                <div className="sectionHead">
                    <Reveal>
                        <h2 className="h2">Akses Aplikasi Akademik</h2>
                        <p className="lead">Masuk ke ekosistem digital MAN Insan Cendekia Gowa melalui platform layanan terintegrasi.</p>
                    </Reveal>
                </div>

                <div className="appsGrid">
                    {apps.map((app) => (
                        <Reveal key={app.id}>
                            <div className="appCard">
                                <div className="appLogoWrapper">
                                    <img src={app.logo} alt={app.name} className="appLogo" />
                                </div>
                                <div className="appInfo">
                                    <h3 className="appTitle">{app.name}</h3>
                                    <p className="appDesc">{app.desc}</p>
                                    <div className="appActions">
                                        <a className="btn primary small" href={app.url} target="_blank" rel="noopener noreferrer">
                                            {app.btnText} <i className="bi bi-box-arrow-up-right ms-2" style={{ fontSize: '12px' }}></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .appsGrid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                    gap: 32px;
                    margin-top: 40px;
                }
                .appCard {
                    background: white;
                    padding: 32px;
                    border-radius: 24px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    height: 100%;
                }
                .appCard:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border-color: var(--primary);
                }
                .appLogoWrapper {
                    width: 70px;
                    height: 70px;
                    background: var(--bg-alt);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    padding: 12px;
                    transition: all 0.3s;
                }
                .appCard:hover .appLogoWrapper {
                    background: var(--primary-light);
                    transform: rotate(5deg);
                }
                .appLogo {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                .appTitle {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 12px;
                    color: var(--text);
                }
                .appDesc {
                    color: var(--text-dim);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 28px;
                    flex-grow: 1;
                }
                .appActions {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }
                .appActions :global(.btn) {
                    width: 100%;
                }

                @media (max-width: 768px) {
                    .appsGrid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </section>
    );
}
