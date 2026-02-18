'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Swal from 'sweetalert2'

interface DokumenSiswa {
    id: string;
    judul: string;
    file_url: string;
    created_at: string;
    file_path: string;
    source: 'official' | 'student';
}

export default function CekDokumenPage() {
    const [nisn, setNisn] = useState('')
    const [namaIbu, setNamaIbu] = useState('')
    const [loading, setLoading] = useState(false)
    const [documents, setDocuments] = useState<DokumenSiswa[] | null>(null)
    const [studentName, setStudentName] = useState('')
    const [searched, setSearched] = useState(false)
    const [animateBg, setAnimateBg] = useState(false)

    useEffect(() => {
        setAnimateBg(true)
    }, [])

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nisn || !namaIbu) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Mohon lengkapi NISN dan Nama Ibu',
                showConfirmButton: false,
                timer: 3000
            })
            return
        }

        setLoading(true)
        setDocuments(null)
        setSearched(true)

        // Simulate a minimum loading time for better UX feeling
        const minLoad = new Promise(resolve => setTimeout(resolve, 800));

        try {
            const [res] = await Promise.all([
                fetch('/api/cek-dokumen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nisn, nama_ibu: namaIbu })
                }),
                minLoad
            ]);

            const json = await res.json()

            if (!res.ok) {
                throw new Error(json.error || 'Gagal memverifikasi data')
            }

            if (json.data) {
                setDocuments(json.data)
                setStudentName(json.siswa_nama)
                if (json.data.length === 0) {
                    Swal.fire({
                        title: 'Identitas Terverifikasi!',
                        text: 'Namun saat ini belum ada dokumen digital yang tersedia untuk Anda.',
                        icon: 'info',
                        confirmButtonColor: '#3b82f6'
                    })
                }
            }

        } catch (err: any) {
            setDocuments(null)
            setStudentName('')
            Swal.fire({
                title: 'Verifikasi Gagal',
                text: err.message || 'Pastikan NISN dan Ejaan Nama Ibu sesuai.',
                icon: 'error',
                confirmButtonColor: '#d33',
                background: '#fff',
                color: '#333'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden font-[family-name:var(--font-outfit)] bg-[#0f172a] text-white flex flex-col pt-24">
            <Header />

            <div className={`absolute inset-0 transition-opacity duration-1000 ${animateBg ? 'opacity-100' : 'opacity-0'}`}>
                {/* ... (background elements) */}
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 items-stretch min-h-[600px]">
                {/* ... (rest of the content) */}

                {/* Left Panel: Form */}
                <div className="w-full md:w-[450px] flex-shrink-0 animate-fade-in-left">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden group">
                        {/* Decorative border gradient */}
                        <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 mask-border"></div>

                        <div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <i className="bi bi-file-earmark-lock-fill text-2xl text-white"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight">Dokumen Siswa</h2>
                                    <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold">MAN IC GOWA</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                        Verifikasi Identitas
                                    </h1>
                                    <p className="text-blue-100/70 text-sm leading-relaxed">
                                        Masukkan NISN dan Nama Ibu Kandung untuk mengakses dokumen akademik Anda secara aman.
                                    </p>
                                </div>

                                <form onSubmit={handleCheck} className="flex flex-col gap-5 mt-4">
                                    <div className="group/input">
                                        <label className="text-xs font-semibold text-blue-200 ml-1 mb-1 block uppercase tracking-wide">NISN</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="bi bi-hash text-blue-300/50 group-focus-within/input:text-blue-400 transition-colors"></i>
                                            </div>
                                            <input
                                                type="text"
                                                value={nisn}
                                                onChange={(e) => setNisn(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 focus:border-blue-500/50 hover:bg-black/30 rounded-xl outline-none transition-all font-mono text-lg tracking-wider text-white placeholder-white/20"
                                                placeholder="00xxxxxx"
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>

                                    <div className="group/input">
                                        <label className="text-xs font-semibold text-blue-200 ml-1 mb-1 block uppercase tracking-wide">Nama Ibu Kandung</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="bi bi-person-heart text-blue-300/50 group-focus-within/input:text-pink-400 transition-colors"></i>
                                            </div>
                                            <input
                                                type="text"
                                                value={namaIbu}
                                                onChange={(e) => setNamaIbu(e.target.value)}
                                                className="w-full pl-11 pr-4 py-4 bg-black/20 border border-white/10 focus:border-blue-500/50 hover:bg-black/30 rounded-xl outline-none transition-all text-lg text-white placeholder-white/20"
                                                placeholder="Nama Lengkap"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-4 w-full relative overflow-hidden bg-white text-blue-900 font-bold py-4 rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                                    >
                                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-shine"></div>
                                        <span className="relative flex justify-center items-center gap-2">
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></div>
                                                    <span>Memproses...</span>
                                                </>
                                            ) : (
                                                <>
                                                    Cek Dokumen
                                                    <i className="bi bi-arrow-right-short text-xl group-hover/btn:translate-x-1 transition-transform"></i>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-center">
                            <p className="text-xs text-blue-200/50 flex items-center justify-center gap-2">
                                <i className="bi bi-shield-check"></i>
                                Sistem Informasi Akademik Terintegrasi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content / Results */}
                <div className="flex-1 flex flex-col justify-center animate-fade-in-right delay-100">
                    {loading ? (
                        // LOADING SKELETON STATE
                        <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col gap-6 animate-pulse">
                            <div className="h-8 w-1/3 bg-white/10 rounded-lg mb-4"></div>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5"></div>
                                ))}
                            </div>
                        </div>
                    ) : !searched ? (
                        // ILLUSTRATION STATE https://storyset.com/illustration/folder/rafiki
                        <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

                            <div className="relative z-10 p-8 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 mb-6 animate-pulse-slow">
                                <i className="bi bi-cloud-arrow-down-fill text-6xl text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"></i>
                            </div>

                            <h3 className="relative z-10 text-2xl font-bold text-white mb-2">Area Unduh Digital</h3>
                            <p className="relative z-10 text-blue-100/60 max-w-sm">
                                Dokumen seperti Rapor, Surat Keterangan Lulus, dan Transkrip Nilai dapat diunduh setelah verifikasi berhasil.
                            </p>
                        </div>
                    ) : documents && documents.length > 0 ? (
                        // SUCCESS RESULTS STATE
                        <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                            <div className="p-6 md:p-8 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-white/10 flex justify-between items-end">
                                <div className="animate-slide-down">
                                    <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Hasil Pencarian</p>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                        Halo, {studentName}
                                    </h2>
                                </div>
                                <div className="text-right hidden md:block">
                                    <span className="text-4xl font-bold text-white/20">{documents.length}</span>
                                    <span className="text-xs text-white/40 block uppercase">Files</span>
                                </div>
                            </div>

                            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {documents.map((doc, idx) => (
                                        <div
                                            key={doc.id}
                                            className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl p-3 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20 hover:-translate-y-1"
                                            style={{ animation: `fadeInUp 0.5s ease-out forwards ${idx * 100}ms`, opacity: 0 }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform duration-300 shrink-0">
                                                    {doc.judul.toLowerCase().endsWith('.pdf') ? (
                                                        <i className="bi bi-file-earmark-pdf-fill text-red-500"></i>
                                                    ) : (
                                                        <i className="bi bi-file-earmark-text-fill text-blue-400"></i>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white mb-0.5 truncate group-hover:text-blue-300 transition-colors">
                                                        {doc.judul}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-[10px] text-blue-200/50 font-mono">
                                                        <span className="flex items-center gap-1">
                                                            <i className="bi bi-calendar-event"></i>
                                                            {new Date(doc.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric', month: 'short', year: 'numeric'
                                                            })}
                                                        </span>

                                                        {doc.source === 'official' ? (
                                                            <span className="flex items-center gap-1 border-l border-white/10 pl-3 text-cyan-400">
                                                                <i className="bi bi-patch-check-fill"></i>
                                                                Akademik
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 border-l border-white/10 pl-3 text-emerald-400">
                                                                <i className="bi bi-person-badge-fill"></i>
                                                                Siswa
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-900/50 hover:shadow-blue-500/30 transition-all active:scale-95"
                                                >
                                                    <i className="bi bi-cloud-arrow-down-fill"></i>
                                                    <span className="hidden sm:inline">Unduh</span>
                                                </a>
                                            </div>

                                            {/* Shine effect */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 border-t border-white/5 text-center">
                                <button
                                    onClick={() => {
                                        setDocuments(null);
                                        setSearched(false);
                                    }}
                                    className="text-sm text-blue-200/60 hover:text-white transition-colors flex items-center justify-center gap-2 w-full py-2"
                                >
                                    <i className="bi bi-arrow-left"></i> Kembali ke Pencarian
                                </button>
                            </div>
                        </div>
                    ) : (
                        // EMPTY RESULTS STATE
                        <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full animate-pulse"></div>
                                <i className="bi bi-file-earmark-x relative z-10 text-6xl text-red-400"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Dokumen Tidak Ditemukan</h3>
                                <p className="text-white/60 max-w-md mx-auto">
                                    Sistem tidak menemukan dokumen untuk siswa <b>{studentName}</b>. <br />
                                    Mohon hubungi bagian Tata Usaha jika Anda yakin dokumen seharusnya ada.
                                </p>
                            </div>
                            <button
                                onClick={() => { setDocuments(null); setSearched(false); }}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition-all"
                            >
                                Coba Cari Lagi
                            </button>
                        </div>
                    )}
                </div>

            </div>

            <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        .animate-shine {
            animation: shine 1.5s infinite;
        }
        
        @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
            100% { transform: translateX(100%); }
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
        }
      `}</style>
        </div>
    )
}
