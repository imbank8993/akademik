"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

interface Document {
    id: string;
    title: string;
    category: string;
    file_url: string;
    show_on_landing: boolean;
    created_at: string;
}

export default function Informasi() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Kategori unik yang di-generate otomatis dari data
    const dynamicCategories = Array.from(new Set(docs.map(d => d.category))).sort();

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://acca.icgowa.sch.id";
                // Hanya ambil dokumen yang show_on_landing = true
                const API_URL = `${baseUrl}/api/informasi-akademik?show_on_landing=true`;

                console.log("Mencoba mengambil data dari:", API_URL);

                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText} (${API_URL})`);
                }

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("API tidak mengembalikan JSON. Pastikan URL benar dan sudah di-deploy.");
                }

                const json = await response.json();
                if (json.ok) {
                    setDocs(json.data);
                }
            } catch (error) {
                console.warn("Gagal mengambil data informasi (Backend mungkin offline/CORS belum diatur):", error);
                // Jangan throw error ke UI, cukup biarkan docs kosong agar menampilkan empty state
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, []);

    return (
        <section id="info" className="section" style={{ backgroundColor: 'var(--bg)', position: 'relative', zIndex: 1 }}>
            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <h2 className="h2">Informasi Akademik</h2>
                        <p className="muted">
                            Akses dokumen dan informasi terbaru seputar kegiatan akademik MAN Insan Cendekia Gowa secara real-time.
                        </p>
                    </div>
                </Reveal>

                <div className="infoGrid">
                    {dynamicCategories.length === 0 && !loading && (
                        <div className="infoPlaceholder" style={{ gridColumn: '1/-1' }}>
                            <div style={{ marginBottom: '1rem', fontSize: '2rem', opacity: 0.5 }}>📂</div>
                            <div>Belum ada informasi yang diunggah saat ini.</div>
                        </div>
                    )}

                    {dynamicCategories.map((cat, idx) => {
                        const catDocs = docs.filter(d => d.category === cat);

                        return (
                            <Reveal key={cat} delay={idx * 100}>
                                <div className="card folderCard">
                                    <div className="folderHeader">
                                        <div className="folderIcon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                                        </div>
                                        <h3 className="h3">{cat}</h3>
                                    </div>

                                    <div className="fileList">
                                        {loading ? (
                                            <div className="infoPlaceholder">Memuat...</div>
                                        ) : catDocs.length > 0 ? (
                                            catDocs.map((doc) => (
                                                <a key={doc.id} href={doc.file_url} target="_blank" rel="noopener noreferrer" className="fileItem">
                                                    <span className="fileIcon">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                                    </span>
                                                    <span className="fileTitle">{doc.title}</span>
                                                    <span className="fileAction">View</span>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="infoPlaceholder">Belum ada dokumen</div>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
                .infoGrid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 32px;
                    margin-top: 20px;
                }

                .folderCard {
                    padding: 0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    min-height: 300px;
                    border: 1px solid var(--border);
                    transition: transform 0.3s;
                }
                .folderCard:hover { transform: translateY(-5px); }

                .folderHeader {
                    padding: 16px 20px;
                    background: var(--primary-light);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 1px solid var(--border);
                }

                .folderIcon {
                    color: var(--primary);
                    background: white;
                    padding: 8px;
                    border-radius: 8px;
                    box-shadow: var(--shadow-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .folderIcon svg {
                    width: 20px;
                    height: 20px;
                }

                .fileList {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }

                .fileItem {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-radius: 8px;
                    background: var(--bg-alt);
                    transition: all 0.2s;
                    text-decoration: none;
                    color: var(--text);
                }

                .fileItem:hover {
                    background: white;
                    box-shadow: var(--shadow-sm);
                    transform: translateX(4px);
                    color: var(--primary);
                }

                .fileIcon {
                    margin-right: 12px;
                    color: var(--text-muted);
                    flex-shrink: 0;
                }

                .fileTitle {
                    flex: 1;
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1.4;
                    padding-right: 12px;
                    /* Hilangkan nowrap agar nama file muncul semua */
                    word-break: break-all;
                }

                @media (max-width: 768px) {
                    .fileTitle {
                        font-size: 12px;
                    }
                    .fileAction {
                        font-size: 10px;
                        padding: 3px 6px;
                    }
                }

                .fileAction {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 4px 8px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }

                .fileItem:hover .fileAction {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }

                .infoPlaceholder {
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 14px;
                    font-style: italic;
                }
            `}</style>
        </section>
    );
}
