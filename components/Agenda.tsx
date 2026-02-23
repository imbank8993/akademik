"use client";

import { useEffect, useState, useMemo } from "react";
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

interface HolidayItem {
    tanggal: string;
    nama: string;
}

const BULAN_LABELS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const HARI_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const KATEGORI_CONFIG: Record<string, { emoji: string }> = {
    Umum: { emoji: "📅" },
    Ujian: { emoji: "✏️" },
    Libur: { emoji: "🌴" },
    Rapat: { emoji: "👥" },
    Kegiatan: { emoji: "⭐" },
    Penerimaan: { emoji: "🎓" },
    Lainnya: { emoji: "📌" },
};

function toDateStr(y: number, m: number, d: number) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatWaktu(w: string | null) {
    return w ? w.slice(0, 5) : "";
}

function formatDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function Agenda() {
    const [agendas, setAgendas] = useState<AgendaItem[]>([]);
    const [holidays, setHolidays] = useState<HolidayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const now = new Date();
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

    const todayStr = now.toISOString().slice(0, 10);

    // Fetch academic agenda
    useEffect(() => {
        const fetchAgenda = async () => {
            setLoading(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://acca.icgowa.sch.id";
                const res = await fetch(`${baseUrl}/api/agenda-akademik/public`);
                if (!res.ok) throw new Error("Gagal ambil agenda");
                const json = await res.json();
                setAgendas(json.data || []);
            } catch (e) {
                console.warn("Gagal ambil agenda:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAgenda();
    }, []);

    // Fetch national holidays independently (does not block agenda)
    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const res = await fetch(`https://api-harilibur.vercel.app/api?year=${viewYear}`);
                if (!res.ok) return;
                const json = await res.json();
                const mapped: HolidayItem[] = (json || []).map((h: any) => ({
                    tanggal: h.holiday_date,
                    nama: h.holiday_name,
                }));
                setHolidays(mapped);
            } catch {
                // Silently ignore - holidays are optional
            }
        };
        fetchHolidays();
    }, [viewYear]);

    // Build event map: dateStr -> agenda items
    const eventMap = useMemo(() => {
        const map: Record<string, AgendaItem[]> = {};
        agendas.forEach(a => {
            // Span multi-day events
            const start = new Date(a.tanggal_mulai + "T00:00:00");
            const end = a.tanggal_selesai ? new Date(a.tanggal_selesai + "T00:00:00") : start;
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const key = d.toISOString().slice(0, 10);
                if (!map[key]) map[key] = [];
                map[key].push(a);
            }
        });
        return map;
    }, [agendas]);

    // Build holiday set for current view year
    const holidayMap = useMemo(() => {
        const map: Record<string, string> = {};
        holidays.forEach(h => { map[h.tanggal] = h.nama; });
        return map;
    }, [holidays]);

    // Calendar grid calculation
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const goToday = () => {
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        setSelectedDay(todayStr);
    };

    // Events for selected day or today
    const displayDay = selectedDay || todayStr;
    const dayEvents = eventMap[displayDay] || [];
    const [displayY, displayM, displayD] = displayDay.split("-").map(Number);

    // Upcoming events (next 5 from today, for the sidebar fallback)
    const upcomingEvents = agendas
        .filter(a => a.tanggal_mulai >= todayStr)
        .sort((a, b) => a.tanggal_mulai.localeCompare(b.tanggal_mulai))
        .slice(0, 5);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <section id="agenda" className="agenda-section">
            <div className="ag-bg-blob ag-blob1" />
            <div className="ag-bg-blob ag-blob2" />

            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                <Reveal>
                    <div className="sectionHead">
                        <div className="section-badge">
                            <span>📅</span> Agenda Akademik
                        </div>
                        <h2 className="h2">
                            Kalender <span className="ag-accent">Kegiatan</span>
                        </h2>
                        <p className="muted">
                            Akses cepat jadwal akademik dan kegiatan penting sekolah dalam satu tampilan elegan.
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={100}>
                    <div className="ag-calendar-card">
                        {/* Left: Calendar Grid */}
                        <div className="ag-cal-left">
                            {/* Calendar Header */}
                            <div className="ag-cal-header">
                                <button className="ag-nav-btn" onClick={prevMonth}>‹</button>
                                <div className="ag-cal-title">
                                    <span className="ag-cal-month">{BULAN_LABELS[viewMonth]}</span>
                                    <span className="ag-cal-year">{viewYear}</span>
                                </div>
                                <button className="ag-nav-btn" onClick={nextMonth}>›</button>
                                <button className="ag-today-btn" onClick={goToday}>Hari Ini</button>
                            </div>

                            {/* Weekday labels */}
                            <div className="ag-weekdays">
                                {HARI_LABELS.map(d => (
                                    <div key={d} className={`ag-weekday ${d === "Min" ? "ag-sunday" : ""}`}>{d}</div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="ag-grid">
                                {/* Empty cells for alignment */}
                                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                    <div key={`e-${i}`} className="ag-cell ag-empty-cell" />
                                ))}

                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = toDateStr(viewYear, viewMonth + 1, day);
                                    const isToday = dateStr === todayStr;
                                    const isSelected = dateStr === selectedDay;
                                    const hasEvent = !!eventMap[dateStr];
                                    const isHoliday = !!holidayMap[dateStr];
                                    const dow = (firstDayOfWeek + i) % 7;
                                    const isSunday = dow === 0;

                                    return (
                                        <button
                                            key={day}
                                            className={[
                                                "ag-cell",
                                                isToday ? "ag-cell-today" : "",
                                                isSelected ? "ag-cell-selected" : "",
                                                isHoliday ? "ag-cell-holiday" : "",
                                                isSunday ? "ag-cell-sunday" : "",
                                                hasEvent ? "ag-cell-has-event" : "",
                                            ].join(" ").trim()}
                                            onClick={() => setSelectedDay(dateStr)}
                                        >
                                            <span className="ag-day-num">{day}</span>
                                            {hasEvent && (
                                                <div className="ag-event-dots">
                                                    {(eventMap[dateStr] || []).slice(0, 3).map((ev, ei) => (
                                                        <span key={ei} className="ag-dot-sm" style={{ background: ev.warna }} />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="ag-legend">
                                <div className="ag-legend-item"><span className="ag-legend-dot ag-ld-today" />Hari Ini</div>
                                <div className="ag-legend-item"><span className="ag-legend-dot ag-ld-event" />Kegiatan</div>
                                <div className="ag-legend-item"><span className="ag-legend-dot ag-ld-holiday" />Libur Nasional</div>
                            </div>
                        </div>

                        {/* Right: Event Detail */}
                        <div className="ag-cal-right">
                            <div className="ag-detail-header">
                                <div className="ag-detail-date">
                                    <span className="ag-detail-day">{displayD}</span>
                                    <div>
                                        <div className="ag-detail-month">{BULAN_LABELS[displayM - 1]}</div>
                                        <div className="ag-detail-year">{displayY}</div>
                                    </div>
                                </div>
                                {holidayMap[displayDay] && (
                                    <div className="ag-holiday-tag">🏖️ {holidayMap[displayDay]}</div>
                                )}
                            </div>

                            {loading ? (
                                <div className="ag-loading">
                                    <div className="ag-spinner" />
                                    <p>Memuat agenda...</p>
                                </div>
                            ) : dayEvents.length > 0 ? (
                                <div className="ag-event-list">
                                    {dayEvents.map((ev) => (
                                        <div key={ev.id} className="ag-event-item" style={{ borderLeftColor: ev.warna }}>
                                            <div className="ag-ev-kat" style={{ color: ev.warna }}>
                                                {(KATEGORI_CONFIG[ev.kategori] || KATEGORI_CONFIG["Lainnya"]).emoji} {ev.kategori}
                                            </div>
                                            <div className="ag-ev-title">{ev.judul}</div>
                                            {ev.deskripsi && <div className="ag-ev-desc">{ev.deskripsi}</div>}
                                            <div className="ag-ev-meta">
                                                {ev.waktu_mulai && <span>🕐 {formatWaktu(ev.waktu_mulai)}{ev.waktu_selesai ? ` – ${formatWaktu(ev.waktu_selesai)}` : ""}</span>}
                                                {ev.lokasi && <span>📍 {ev.lokasi}</span>}
                                                {ev.tanggal_selesai && ev.tanggal_selesai !== ev.tanggal_mulai && (
                                                    <span>📅 s/d {formatDate(ev.tanggal_selesai)}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="ag-no-event">
                                    <div className="ag-no-event-icon">🗓️</div>
                                    <p>Tidak ada kegiatan</p>
                                    <span>Pilih tanggal lain untuk melihat agenda</span>
                                    {upcomingEvents.length > 0 && (
                                        <div className="ag-upcoming">
                                            <div className="ag-upcoming-title">Kegiatan Mendatang</div>
                                            {upcomingEvents.map(ev => (
                                                <button
                                                    key={ev.id}
                                                    className="ag-upcoming-item"
                                                    onClick={() => setSelectedDay(ev.tanggal_mulai)}
                                                >
                                                    <span className="ag-up-dot" style={{ background: ev.warna }} />
                                                    <div>
                                                        <div className="ag-up-title">{ev.judul}</div>
                                                        <div className="ag-up-date">{formatDate(ev.tanggal_mulai)}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>

            <style jsx>{`
                /* Section */
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
                    background: radial-gradient(circle, rgba(0,56,168,0.07) 0%, transparent 70%);
                }
                .ag-blob2 {
                    width: 400px; height: 400px;
                    bottom: -5%; right: -5%;
                    background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
                }

                /* Section badge & accent */
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

                /* Main calendar card */
                .ag-calendar-card {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 0;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    box-shadow: var(--shadow-md);
                    overflow: hidden;
                    margin-top: 40px;
                    min-height: 500px;
                }

                /* Left: Calendar */
                .ag-cal-left {
                    padding: 32px;
                    border-right: 1px solid var(--border);
                }
                .ag-cal-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .ag-cal-title {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    flex: 1;
                    text-align: center;
                    justify-content: center;
                }
                .ag-cal-month {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: var(--text);
                }
                .ag-cal-year {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .ag-nav-btn {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    background: white;
                    font-size: 1.3rem;
                    cursor: pointer;
                    color: var(--text);
                    transition: all 0.2s;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .ag-nav-btn:hover { background: #f0f4ff; border-color: #0038A8; color: #0038A8; }
                .ag-today-btn {
                    padding: 7px 14px;
                    border-radius: 10px;
                    border: 1px solid #0038A8;
                    background: #f0f4ff;
                    color: #0038A8;
                    font-size: 0.78rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .ag-today-btn:hover { background: #0038A8; color: white; }

                /* Weekday headers */
                .ag-weekdays {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    margin-bottom: 8px;
                }
                .ag-weekday {
                    text-align: center;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    padding: 6px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .ag-sunday { color: #ef4444; }

                /* Calendar grid */
                .ag-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }
                .ag-cell {
                    aspect-ratio: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.18s;
                    padding: 2px;
                    gap: 2px;
                    position: relative;
                }
                .ag-empty-cell { cursor: default; }
                .ag-cell:not(.ag-empty-cell):hover { background: #f0f4ff; }
                .ag-day-num {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text);
                    line-height: 1;
                }
                .ag-cell-sunday .ag-day-num { color: #ef4444; }
                .ag-cell-holiday .ag-day-num { color: #ef4444; }
                .ag-cell-today {
                    background: #0038A8 !important;
                }
                .ag-cell-today .ag-day-num { color: white; }
                .ag-cell-selected:not(.ag-cell-today) {
                    background: #f0f4ff;
                    box-shadow: 0 0 0 2px #0038A8;
                }
                .ag-event-dots {
                    display: flex;
                    gap: 2px;
                    justify-content: center;
                }
                .ag-dot-sm {
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    display: block;
                    flex-shrink: 0;
                }
                .ag-cell-today .ag-dot-sm { opacity: 0.8; }

                /* Legend */
                .ag-legend {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid var(--border);
                    flex-wrap: wrap;
                }
                .ag-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .ag-legend-dot {
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    display: block;
                }
                .ag-ld-today { background: #0038A8; }
                .ag-ld-event { background: #10b981; }
                .ag-ld-holiday { background: #ef4444; }

                /* Right: Detail Panel */
                .ag-cal-right {
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: #fafbff;
                }
                .ag-detail-header {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border);
                }
                .ag-detail-date {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .ag-detail-day {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #0038A8;
                    line-height: 1;
                    font-variant-numeric: tabular-nums;
                }
                .ag-detail-month {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text);
                }
                .ag-detail-year {
                    font-size: 0.82rem;
                    color: var(--text-muted);
                }
                .ag-holiday-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 5px 12px;
                    background: #fef2f2;
                    color: #dc2626;
                    border-radius: 8px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    border: 1px solid #fecaca;
                }

                /* Event list */
                .ag-event-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                    max-height: 380px;
                }
                .ag-event-item {
                    background: white;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    border-left: 4px solid;
                    padding: 14px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    transition: box-shadow 0.2s;
                }
                .ag-event-item:hover { box-shadow: var(--shadow-sm); }
                .ag-ev-kat {
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .ag-ev-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1.3;
                }
                .ag-ev-desc {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }
                .ag-ev-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .ag-ev-meta span {
                    font-size: 0.73rem;
                    color: var(--text-muted);
                }

                /* No event panel */
                .ag-no-event {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 8px;
                    flex: 1;
                    justify-content: flex-start;
                }
                .ag-no-event-icon { font-size: 2.5rem; margin-bottom: 4px; }
                .ag-no-event p {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0;
                }
                .ag-no-event span {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }

                /* Upcoming events */
                .ag-upcoming {
                    width: 100%;
                    margin-top: 16px;
                    text-align: left;
                    border-top: 1px solid var(--border);
                    padding-top: 16px;
                }
                .ag-upcoming-title {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    font-weight: 800;
                    color: var(--text-muted);
                    margin-bottom: 10px;
                }
                .ag-upcoming-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    width: 100%;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 10px 12px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }
                .ag-upcoming-item:hover { background: #f0f4ff; border-color: #0038A8; }
                .ag-up-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-top: 5px;
                }
                .ag-up-title {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--text);
                    line-height: 1.3;
                }
                .ag-up-date {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                /* Loading */
                .ag-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    padding: 40px 0;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                }
                .ag-spinner {
                    width: 28px; height: 28px;
                    border: 3px solid var(--border);
                    border-top-color: #0038A8;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Responsive */
                @media (max-width: 900px) {
                    .ag-calendar-card {
                        grid-template-columns: 1fr;
                    }
                    .ag-cal-left {
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                }
                @media (max-width: 480px) {
                    .ag-cal-left, .ag-cal-right { padding: 20px; }
                    .ag-day-num { font-size: 0.72rem; }
                }
            `}</style>
        </section>
    );
}
