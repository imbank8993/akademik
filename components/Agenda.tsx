"use client";

import { useEffect, useState, useRef } from "react";
import Reveal from "./Reveal";

interface AgendaItem {
    id: number;
    judul: string;
    deskripsi: string | null;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    lokasi: string | null;
    kategori: string;
    warna: string;
}

const KATEGORI_CONFIG: Record<string, { icon: string; emoji: string }> = {
    Umum: { icon: "📅", emoji: "📅" },
    Ujian: { icon: "✏️", emoji: "✏️" },
    Libur: { icon: "🌴", emoji: "🌴" },
    Rapat: { icon: "👥", emoji: "👥" },
    Kegiatan: { icon: "⭐", emoji: "⭐" },
    Penerimaan: { icon: "🎓", emoji: "🎓" },
    Lainnya: { icon: "📌", emoji: "📌" },
};

const BULAN_LABELS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatShortDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return { day: d.getDate(), month: BULAN_LABELS[d.getMonth()].slice(0, 3).toUpperCase(), year: d.getFullYear() };
}

function formatWaktu(w: string | null) {
    return w ? w.slice(0, 5) : "";
}

function getDaysLeft(dateStr: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + "T00:00:00"); target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export default function Agenda() {
    const [agendas, setAgendas] = useState<AgendaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterBulan, setFilterBulan] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<string>("Mendatang");
    const scrollRef = useRef<HTMLDivElement>(null);

    const today = new Date().toISOString().slice(0, 10);
    const thisYear = new Date().getFullYear();

    const bulanOptions = Array.from({ length: 12 }, (_, i) => ({
        label: BULAN_LABELS[i].slice(0, 3),
        value: `${thisYear}-${String(i + 1).padStart(2, "0")}`,
        full: BULAN_LABELS[i],
    }));

    useEffect(() => {
        const fetchAgenda = async () => {
            setLoading(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://acca.icgowa.sch.id";
                const params = new URLSearchParams();
                if (filterBulan) params.append("bulan", filterBulan);
                const res = await fetch(`${baseUrl}/api/agenda-akademik/public?${params}`);
                if (!res.ok) throw new Error("Gagal mengambil data");
                const json = await res.json();
                setAgendas(json.data || []);
            } catch (e) {
                console.warn("Gagal ambil agenda:", e);
                setAgendas([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAgenda();
    }, [filterBulan]);

    const filtered = agendas.filter(a => {
        if (activeFilter === "Mendatang") return a.tanggal_mulai >= today;
        if (activeFilter === "Berlangsung") {
            const end = a.tanggal_selesai || a.tanggal_mulai;
            return a.tanggal_mulai <= today && end >= today;
        }
        return true;
    });

    const handleBulanSelect = (val: string) => {
        setFilterBulan(prev => prev === val ? "" : val);
        setActiveFilter("Semua");
    };

    const scrollBulan = (dir: "left" | "right") => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === "left" ? -150 : 150, behavior: "smooth" });
        }
    };

    // Group by month
    const grouped: Record<string, AgendaItem[]> = {};
    filtered.forEach(a => {
        const key = a.tanggal_mulai.slice(0, 7);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(a);
    });

    return (
        <section id="agenda" className="agenda-section">
            {/* Background decoration */}
            <div className="ag-bg-blob ag-blob1" />
            <div className="ag-bg-blob ag-blob2" />

            <div className="container">
                <Reveal>
                    <div className="sectionHead">
                        <div className="section-badge">
                            <span>📅</span> Jadwal Kegiatan
                        </div>
                        <h2 className="h2">
                            Agenda <span className="ag-accent">Akademik</span>
                        </h2>
                        <p className="muted">
                            Pantau seluruh agenda dan kegiatan sekolah agar tidak melewatkan momen penting.
                        </p>
                    </div>
                </Reveal>

                {/* Filter tabs */}
                <Reveal delay={100}>
                    <div className="ag-filter-bar">
                        <div className="ag-filter-tabs">
                            {["Mendatang", "Berlangsung", "Semua"].map(f => (
                                <button
                                    key={f}
                                    className={`ag-tab ${activeFilter === f ? "ag-tab-active" : ""}`}
                                    onClick={() => { setActiveFilter(f); setFilterBulan(""); }}
                                >
                                    {f === "Mendatang" && "🔜 "}
                                    {f === "Berlangsung" && "🟢 "}
                                    {f === "Semua" && "📋 "}
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Month scroller */}
                        <div className="ag-month-scroller-wrap">
                            <button className="ag-scroll-btn" onClick={() => scrollBulan("left")}>‹</button>
                            <div className="ag-month-scroller" ref={scrollRef}>
                                {bulanOptions.map(b => (
                                    <button
                                        key={b.value}
                                        className={`ag-month-chip ${filterBulan === b.value ? "ag-month-active" : ""}`}
                                        onClick={() => handleBulanSelect(b.value)}
                                    >
                                        {b.label}
                                    </button>
                                ))}
                            </div>
                            <button className="ag-scroll-btn" onClick={() => scrollBulan("right")}>›</button>
                        </div>
                    </div>
                </Reveal>

                {/* Content area */}
                {loading ? (
                    <div className="ag-loading">
                        <div className="ag-spinner" />
                        <p>Memuat agenda...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <Reveal>
                        <div className="ag-empty">
                            <div className="ag-empty-icon">🗓️</div>
                            <h3>Belum ada agenda</h3>
                            <p>Tidak ada kegiatan untuk filter yang dipilih.</p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="ag-timeline">
                        {Object.entries(grouped).map(([monthKey, items], gIdx) => {
                            const [y, m] = monthKey.split("-");
                            const monthLabel = `${BULAN_LABELS[Number(m) - 1]} ${y}`;
                            return (
                                <div key={monthKey} className="ag-month-group">
                                    <Reveal delay={gIdx * 80}>
                                        <div className="ag-month-label">
                                            <div className="ag-month-line" />
                                            <span>{monthLabel}</span>
                                            <div className="ag-month-line" />
                                        </div>
                                    </Reveal>

                                    <div className="ag-cards">
                                        {items.map((a, idx) => {
                                            const daysLeft = getDaysLeft(a.tanggal_mulai);
                                            const isToday = a.tanggal_mulai === today;
                                            const isPast = daysLeft < 0;
                                            const isSoon = daysLeft >= 0 && daysLeft <= 7;
                                            const dateInfo = formatShortDate(a.tanggal_mulai);
                                            const katConf = KATEGORI_CONFIG[a.kategori] || KATEGORI_CONFIG["Lainnya"];
                                            const hasMultiDay = a.tanggal_selesai && a.tanggal_selesai !== a.tanggal_mulai;

                                            return (
                                                <Reveal key={a.id} delay={gIdx * 80 + idx * 60}>
                                                    <div className={`ag-card ${isToday ? "ag-card-today" : ""} ${isPast ? "ag-card-past" : ""}`}>
                                                        {/* Timeline dot */}
                                                        <div className="ag-dot" style={{ background: a.warna }}>
                                                            <span>{katConf.emoji}</span>
                                                        </div>

                                                        {/* Date block */}
                                                        <div className="ag-date-block" style={{ borderLeftColor: a.warna }}>
                                                            <div className="ag-day" style={{ color: a.warna }}>{dateInfo.day}</div>
                                                            <div className="ag-month-sm">{dateInfo.month}</div>
                                                        </div>

                                                        {/* Content */}
                                                        <div className="ag-content">
                                                            <div className="ag-tags">
                                                                <span className="ag-kat" style={{ background: a.warna + "1A", color: a.warna }}>
                                                                    {katConf.emoji} {a.kategori}
                                                                </span>
                                                                {isToday && <span className="ag-badge ag-today">Hari Ini</span>}
                                                                {!isPast && !isToday && isSoon && (
                                                                    <span className="ag-badge ag-soon">{daysLeft} hari lagi</span>
                                                                )}
                                                                {isPast && <span className="ag-badge ag-past">Selesai</span>}
                                                            </div>

                                                            <h3 className="ag-title">{a.judul}</h3>

                                                            {a.deskripsi && (
                                                                <p className="ag-desc">{a.deskripsi}</p>
                                                            )}

                                                            <div className="ag-meta">
                                                                <span className="ag-meta-item">
                                                                    📅 {formatDate(a.tanggal_mulai)}
                                                                    {hasMultiDay && ` – ${formatDate(a.tanggal_selesai!)}`}
                                                                </span>
                                                                {(a.waktu_mulai || a.waktu_selesai) && (
                                                                    <span className="ag-meta-item">
                                                                        🕐 {formatWaktu(a.waktu_mulai)}{a.waktu_selesai ? ` – ${formatWaktu(a.waktu_selesai)}` : ""}
                                                                    </span>
                                                                )}
                                                                {a.lokasi && (
                                                                    <span className="ag-meta-item">📍 {a.lokasi}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right accent bar */}
                                                        <div className="ag-right-bar" style={{ background: `linear-gradient(to bottom, ${a.warna}, ${a.warna}80)` }} />
                                                    </div>
                                                </Reveal>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                /* ── SECTION ── */
                .agenda-section {
                    padding: 100px 0;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg);
                }
                .ag-bg-blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(100px);
                    pointer-events: none;
                    z-index: 0;
                }
                .ag-blob1 {
                    width: 500px; height: 500px;
                    top: -10%; left: -10%;
                    background: radial-gradient(circle, rgba(0,56,168,0.08) 0%, transparent 70%);
                }
                .ag-blob2 {
                    width: 400px; height: 400px;
                    bottom: -5%; right: -5%;
                    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
                }
                .container { position: relative; z-index: 1; }

                /* ── SECTION HEADER ── */
                .section-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 18px;
                    background: rgba(0,56,168,0.08);
                    color: #0038A8;
                    border-radius: 999px;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    margin-bottom: 14px;
                    border: 1px solid rgba(0,56,168,0.15);
                }
                .ag-accent { color: #0038A8; }

                /* ── FILTER BAR ── */
                .ag-filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                    background: white;
                    padding: 14px 20px;
                    border-radius: 20px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .ag-filter-tabs {
                    display: flex;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .ag-tab {
                    padding: 7px 16px;
                    border-radius: 999px;
                    border: 1.5px solid var(--border);
                    background: transparent;
                    font-size: 0.82rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }
                .ag-tab:hover { border-color: #0038A8; color: #0038A8; }
                .ag-tab-active {
                    background: #0038A8;
                    border-color: #0038A8;
                    color: white;
                }

                /* ── MONTH SCROLLER ── */
                .ag-month-scroller-wrap {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex: 1;
                    min-width: 0;
                }
                .ag-scroll-btn {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    border: 1px solid var(--border);
                    background: white;
                    cursor: pointer;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    color: #0038A8;
                    transition: all 0.2s;
                }
                .ag-scroll-btn:hover { background: #0038A8; color: white; border-color: #0038A8; }
                .ag-month-scroller {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    flex: 1;
                }
                .ag-month-scroller::-webkit-scrollbar { display: none; }
                .ag-month-chip {
                    padding: 5px 14px;
                    border-radius: 999px;
                    border: 1.5px solid var(--border);
                    background: transparent;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                    color: var(--text-muted);
                    transition: all 0.15s;
                }
                .ag-month-chip:hover { border-color: #0038A8; color: #0038A8; }
                .ag-month-active {
                    background: #0038A8;
                    border-color: #0038A8;
                    color: white;
                }

                /* ── TIMELINE ── */
                .ag-timeline { display: flex; flex-direction: column; gap: 36px; }
                .ag-month-group { display: flex; flex-direction: column; gap: 14px; }
                .ag-month-label {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 4px;
                }
                .ag-month-label span {
                    font-size: 0.82rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-muted);
                    white-space: nowrap;
                }
                .ag-month-line { flex: 1; height: 1px; background: var(--border); }
                .ag-cards { display: flex; flex-direction: column; gap: 12px; }

                /* ── CARD ── */
                .ag-card {
                    display: flex;
                    align-items: stretch;
                    background: white;
                    border-radius: 20px;
                    border: 1.5px solid var(--border);
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
                }
                .ag-card:hover {
                    transform: translateX(6px) translateY(-2px);
                    box-shadow: 0 12px 32px rgba(0,56,168,0.1);
                    border-color: rgba(0,56,168,0.25);
                }
                .ag-card-today {
                    border-color: #22C55E;
                    box-shadow: 0 0 0 2px rgba(34,197,94,0.15), 0 4px 20px rgba(34,197,94,0.08);
                }
                .ag-card-past { opacity: 0.55; filter: grayscale(0.3); }
                .ag-card-past:hover { opacity: 0.75; }

                /* Dot */
                .ag-dot {
                    width: 52px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                }

                /* Date block */
                .ag-date-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 16px 14px;
                    border-left: 3px solid;
                    min-width: 64px;
                    flex-shrink: 0;
                    background: #fafbff;
                }
                .ag-day { font-size: 1.8rem; font-weight: 800; line-height: 1; }
                .ag-month-sm {
                    font-size: 0.7rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                /* Content */
                .ag-content {
                    flex: 1;
                    padding: 16px 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    min-width: 0;
                }
                .ag-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
                .ag-kat {
                    padding: 3px 10px;
                    border-radius: 999px;
                    font-size: 0.73rem;
                    font-weight: 700;
                }
                .ag-badge {
                    padding: 2px 9px;
                    border-radius: 999px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }
                .ag-today { background: #dcfce7; color: #166534; }
                .ag-soon { background: #ede9fe; color: #5b21b6; }
                .ag-past { background: #f1f5f9; color: #64748b; }

                .ag-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1.4;
                    margin: 0;
                }
                .ag-desc {
                    font-size: 0.83rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .ag-meta {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-top: 4px;
                }
                .ag-meta-item {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* Right accent bar */
                .ag-right-bar {
                    width: 5px;
                    flex-shrink: 0;
                }

                /* ── EMPTY / LOADING ── */
                .ag-loading, .ag-empty {
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }
                .ag-spinner {
                    width: 44px; height: 44px;
                    border: 3px solid var(--border);
                    border-top-color: #0038A8;
                    border-radius: 50%;
                    animation: ag-spin 0.8s linear infinite;
                }
                @keyframes ag-spin { to { transform: rotate(360deg); } }
                .ag-empty-icon { font-size: 3.5rem; }
                .ag-empty h3 { font-size: 1.1rem; font-weight: 700; color: var(--text); margin: 0; }
                .ag-empty p { font-size: 0.9rem; margin: 0; }

                /* ── RESPONSIVE ── */
                @media (max-width: 768px) {
                    .agenda-section { padding: 60px 0; }
                    .ag-filter-bar { flex-direction: column; align-items: flex-start; gap: 12px; }
                    .ag-month-scroller-wrap { width: 100%; }
                    .ag-dot { width: 40px; font-size: 1.1rem; }
                    .ag-date-block { padding: 12px 10px; min-width: 52px; }
                    .ag-day { font-size: 1.4rem; }
                    .ag-content { padding: 12px 14px; }
                    .ag-card:hover { transform: none; }
                }
            `}</style>
        </section>
    );
}
