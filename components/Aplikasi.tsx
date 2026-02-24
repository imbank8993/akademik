'use client';
import Reveal from "./Reveal";
import Image from "next/image";

export default function Aplikasi() {
    const apps = [
        {
            id: 'acca',
            name: 'ACCA',
            desc: 'Academic Center & Access MAN Insan Cendekia Gowa.',
            logo: '/logo-acca.png',
            url: 'https://acca.icgowa.sch.id',
            btnText: 'Buka'
        },
        {
            id: 'rdm',
            name: 'RDM',
            desc: 'Raport Digital Madrasah.',
            logo: '/logo-rdm.png',
            url: 'https://rdm.icgowa.sch.id',
            btnText: 'Buka'
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
                    grid-template-columns: repeat(auto-fit, minmax(320px, 400px));
                    gap: 32px;
                    margin-top: 40px;
                    justify-content: center;
                }
                .appCard {
                    background: white;
                    padding: 40px 32px;
                    border-radius: 28px;
                    border: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    height: 100%;
                    position: relative;
                }
                .appCard:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px -12px rgba(0, 56, 168, 0.15);
                    border-color: rgba(0, 56, 168, 0.3);
                }
                .appLogoWrapper {
                    width: 90px;
                    height: 90px;
                    background: #f8fafc;
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    padding: 16px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(0,0,0,0.03);
                }
                .appCard:hover .appLogoWrapper {
                    background: #f0f4ff;
                    transform: scale(1.05);
                    border-color: rgba(0, 56, 168, 0.1);
                }
                .appLogo {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                .appInfo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    flex: 1;
                }
                .appDesc {
                    color: var(--text-dim);
                    font-size: 1rem;
                    line-height: 1.6;
                    margin-bottom: 32px;
                    flex-grow: 1;
                    max-width: 260px;
                }
                .appActions {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                }
                .appActions :global(.btn) {
                    width: auto;
                    min-width: 160px;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                }

                @media (max-width: 768px) {
                    .appsGrid {
                        grid-template-columns: 1fr;
                        max-width: 400px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                }
            `}</style>
        </section>
    );
}
