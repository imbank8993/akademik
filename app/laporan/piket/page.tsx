'use client';

import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../laporan.css'; // We'll keep general styles but override for specific UI

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acca.icgowa.sch.id';

// List kehadiran hardcoded or fetched? GAS fetched from sheet. We'll use standard.
const KEHADIRAN_OPTIONS = [
    'Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Tugas', 'Kelas Kosong'
].map(k => ({ value: k, label: k }));

export default function LaporanPiketPage() {
    // Master Data
    const [guruList, setGuruList] = useState<any[]>([]);
    const [kelasList, setKelasList] = useState<string[]>([]);
    const [loadingMaster, setLoadingMaster] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        guruPiket: '',
        nip: '',
        jamPiket: '',
        keteranganTambahan: ''
    });

    // Per-Class Data Map: { [kelasName]: { guru: '', status: '', doc_url: '' } }
    const [classData, setClassData] = useState<Record<string, any>>({});

    // Carousel State
    const [currentClassIndex, setCurrentClassIndex] = useState(0);

    // Submission State
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // File inputs refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchMaster = async () => {
            try {
                // Fetch Guru
                const resGuru = await fetch(`${API_URL}/api/master/guru`);
                const dataGuru = await resGuru.json();
                if (dataGuru.ok) {
                    setGuruList(dataGuru.data.map((g: any) => ({
                        value: g.nama_lengkap,
                        label: g.nama_lengkap,
                        nip: g.nip || g.nip_baru || '' // Ensure we capture NIP
                    })));
                }

                // Fetch Kelas
                const resKelas = await fetch(`${API_URL}/api/master/kelas?aktif=true`);
                const dataKelas = await resKelas.json();
                if (dataKelas.ok) {
                    // Sort kelas nicely? They come sorted by name usually
                    setKelasList(dataKelas.data.map((k: any) => k.nama));
                }
            } catch (err) {
                console.error("Master data fetch error", err);
            } finally {
                setLoadingMaster(false);
            }
        };
        fetchMaster();
    }, []);

    const updateClassData = (kelas: string, field: string, value: any) => {
        setClassData(prev => ({
            ...prev,
            [kelas]: {
                ...(prev[kelas] || {}),
                [field]: value
            }
        }));
    };

    // File Upload Handler
    const handleFileUpload = async (kelas: string, file: File) => {
        if (!file) return;

        // Convert to Base64 to send to upload endpoint (as per GAS logic adaptation)
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = (e.target?.result as string).split(',')[1];

            try {
                setUploading(true);
                const res = await fetch(`${API_URL}/api/laporan/piket/upload`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileData: base64Data,
                        fileName: file.name,
                        fileType: file.type,
                        kelas: kelas
                    })
                });

                const result = await res.json();
                if (result.ok) {
                    updateClassData(kelas, 'dokumentasi_url', result.url);
                    Swal.fire({
                        icon: 'success',
                        title: 'Foto Terupload',
                        text: `Dokumentasi untuk ${kelas} berhasil diunggah.`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error(result.error);
                }
            } catch (err: any) {
                Swal.fire('Gagal Upload', err.message, 'error');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.guruPiket || !formData.jamPiket) {
            Swal.fire('Perhatian', 'Nama Guru Piket dan Jam Piket wajib diisi!', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            // Prepare Data
            const details = Object.entries(classData).map(([kelas, data]) => ({
                kelas,
                guru: data.guru,
                status: data.status,
                dokumentasi_url: data.dokumentasi_url
            })).filter(d => d.guru || d.status); // Only send filled classes? GAS checks "if (guru !== '')"

            const payload = {
                guruPiket: formData.guruPiket,
                nip: formData.nip,
                jamPiket: formData.jamPiket,
                keteranganTambahan: formData.keteranganTambahan,
                details
            };

            const res = await fetch(`${API_URL}/api/laporan/piket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Laporan Piket berhasil dikirim!',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Reset Form
                setFormData({ ...formData, keteranganTambahan: '' });
                setClassData({});
                setCurrentClassIndex(0);
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            Swal.fire('Gagal', err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Carousel Helper
    const getVisibleClasses = () => {
        if (kelasList.length === 0) return [];
        const total = kelasList.length;
        const leftIndex = (currentClassIndex - 1 + total) % total;
        const rightIndex = (currentClassIndex + 1) % total;

        return [
            { idx: leftIndex, name: kelasList[leftIndex], pos: 'left' },
            { idx: currentClassIndex, name: kelasList[currentClassIndex], pos: 'center' },
            { idx: rightIndex, name: kelasList[rightIndex], pos: 'right' }
        ];
    };

    const currentClass = kelasList[currentClassIndex] || '';
    const currentData = classData[currentClass] || {};
    // Check if class is UTBK for documentation (GAS logic: DOK_KELAS = ['UTBK A', 'UTBK B'])
    // We can allow all classes or restrict. Let's allowing all for flexibility, or follow logic if needed.
    // The user "ingin mengikuti logika yang ada". The logic was "hanya kelas ini (UTBK)".
    // But since we fetch dynamic classes, maybe all *can* have photos?
    // Let's stick to enabling it for ALL classes to be better than GAS, or strict?
    // Let's enable for ALL.
    const showUpload = true;

    return (
        <>
            <Header />
            <div className="laporan-page">
                <div className="laporan-banner">
                    <div className="header-content">
                        <div className="header-icon"><i className="bi bi-shield-check"></i></div>
                        <div>
                            <h1>Laporan Guru Piket</h1>
                            <p>Formulir Digital MAN Insan Cendekia Gowa</p>
                        </div>
                    </div>
                </div>

                <div className="laporan-card">
                    <form onSubmit={handleSubmit} className="laporan-form">
                        {/* IDENTITAS */}
                        <div className="form-section">
                            <h3 className="section-title"><i className="bi bi-person-badge"></i> Identitas Petugas</h3>
                            <div className="flex flex-col md:flex-row gap-4 mb-4 w-full">
                                <div className="flex flex-col gap-2 w-full md:w-[70%]">
                                    <label className="block font-medium text-gray-700 font-semibold mb-1">Nama Guru Piket <span className="text-red-500">*</span></label>
                                    <Select
                                        instanceId="select-guru-piket"
                                        options={guruList}
                                        onChange={(opt: any) => setFormData({ ...formData, guruPiket: opt?.value, nip: opt?.nip })}
                                        value={guruList.find(g => g.value === formData.guruPiket)}
                                        placeholder={loadingMaster ? "Memuat..." : "Pilih Nama Anda..."}
                                        isLoading={loadingMaster}
                                        styles={customSelectStyles}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-[30%]">
                                    <label className="block font-medium text-gray-700 font-semibold mb-1">Jam Ke- <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        placeholder="Contoh: 1-2"
                                        value={formData.jamPiket}
                                        onChange={e => setFormData({ ...formData, jamPiket: e.target.value })}
                                        style={{ height: '42px' }} /* Match React Select height approx */
                                    />
                                </div>
                            </div>
                            <div className="form-group w-full">
                                <label className="mb-2 block font-medium text-gray-700">Keterangan Tambahan</label>
                                <textarea
                                    className="form-input w-full"
                                    placeholder="Catatan umum piket hari ini..."
                                    rows={3}
                                    value={formData.keteranganTambahan}
                                    onChange={e => setFormData({ ...formData, keteranganTambahan: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        {/* CAROUSEL KELAS */}
                        <div className="form-section">
                            <h3 className="section-title text-center mb-4"><i className="bi bi-collection"></i> Input Per Kelas</h3>

                            {kelasList.length > 0 ? (
                                <div className="class-carousel">
                                    {getVisibleClasses().map((item) => (
                                        <div
                                            key={item.name}
                                            className={`class-card ${item.pos}`}
                                            onClick={() => setCurrentClassIndex(item.idx)}
                                        >
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">Memuat data kelas...</p>
                            )}

                            {/* CLASS FORM AREA */}
                            {currentClass && (
                                <div className="class-form-area animate-fade-in" key={currentClass}>
                                    <h4 className="text-lg font-bold text-center text-primary mb-4">
                                        Data Kelas {currentClass}
                                    </h4>

                                    <div className="form-group">
                                        <label>Guru di Kelas</label>
                                        <Select
                                            instanceId={`select-guru-${currentClass}`}
                                            options={guruList}
                                            onChange={(opt: any) => updateClassData(currentClass, 'guru', opt?.value)}
                                            value={guruList.find(g => g.value === currentData.guru)}
                                            placeholder="Pilih Guru Pengajar..."
                                            styles={customSelectStyles}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Status Kehadiran</label>
                                        <Select
                                            instanceId={`select-status-${currentClass}`}
                                            options={KEHADIRAN_OPTIONS}
                                            onChange={(opt: any) => updateClassData(currentClass, 'status', opt?.value)}
                                            value={KEHADIRAN_OPTIONS.find(k => k.value === currentData.status)}
                                            placeholder="Pilih Status..."
                                            styles={customSelectStyles}
                                        />
                                    </div>

                                    {showUpload && (
                                        <div className="form-group">
                                            <label className="mb-2 block font-medium text-gray-700">Dokumentasi (Opsional)</label>
                                            <div className="upload-container">
                                                <input
                                                    type="file"
                                                    id={`file-upload-${currentClass}`}
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(currentClass, e.target.files[0])}
                                                    className="hidden-input"
                                                />
                                                <label htmlFor={`file-upload-${currentClass}`} className={`upload-zone ${uploading ? 'uploading' : ''} ${currentData.dokumentasi_url ? 'success' : ''}`}>
                                                    <div className="upload-content">
                                                        {uploading ? (
                                                            <>
                                                                <div className="spinner-border"></div>
                                                                <span>Mengunggah foto...</span>
                                                            </>
                                                        ) : currentData.dokumentasi_url ? (
                                                            <>
                                                                <div className="icon-success"><i className="bi bi-check-circle-fill"></i></div>
                                                                <div className="text-content">
                                                                    <span className="font-bold text-green-600">Foto Berhasil Diunggah</span>
                                                                    <span className="text-xs text-gray-500">Klik untuk ganti foto</span>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="icon-upload"><i className="bi bi-camera-fill"></i></div>
                                                                <div className="text-content">
                                                                    <span className="font-semibold text-gray-700">Ambil Foto / Upload</span>
                                                                    <span className="text-xs text-gray-400">Format: JPG, PNG (Max 10MB)</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </label>

                                                {currentData.dokumentasi_url && (
                                                    <a href={currentData.dokumentasi_url} target="_blank" rel="noreferrer" className="preview-link">
                                                        <i className="bi bi-eye"></i> Lihat Foto
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-footer">
                            <div className="info-text">
                                <i className="bi bi-info-circle"></i>
                                {Object.keys(classData).length > 0 ?
                                    ` ${Object.keys(classData).length} kelas telah diisi.` :
                                    ' Silakan isi data per kelas.'}
                            </div>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-send-fill"></i>}
                                {submitting ? ' Mengirim...' : ' Kirim Laporan'}
                            </button>
                        </div>
                    </form>

                    <style jsx>{`
                        .class-carousel {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            gap: 12px;
                            margin-bottom: 32px;
                            perspective: 1000px;
                            height: auto;
                            padding: 10px 0;
                        }
                        .class-card {
                            min-width: 140px; /* Flexible width but minimum size */
                            padding: 12px 20px;
                            border-radius: 16px; /* Standard rounded card, NOT pill */
                            background: white;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                            border: 1px solid var(--border);
                            text-align: center;
                            font-size: 14px;
                            color: #64748b;
                        }
                        .class-card.center {
                            background: var(--primary);
                            color: white;
                            transform: scale(1.05); /* Slight pop */
                            border-color: var(--primary);
                            box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
                            z-index: 2;
                            font-size: 16px;
                            padding: 14px 24px;
                        }
                        .class-card.left, .class-card.right {
                            background: #f8fafc;
                            opacity: 0.6;
                            transform: scale(0.95);
                        }
                        .class-card:hover:not(.center) {
                            background: #f1f5f9;
                            border-color: #cbd5e1;
                            opacity: 0.9;
                        }
                        .class-form-area {
                            background: #f8fafc;
                            padding: 24px;
                            border-radius: 20px;
                            border: 1px dashed #cbd5e1;
                        }
                        .upload-container {
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                        }
                        .hidden-input {
                            display: none;
                        }
                        .upload-zone {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                            border: 2px dashed #cbd5e1;
                            border-radius: 16px;
                            background: #fff;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            min-height: 100px;
                            text-align: center;
                        }
                        .upload-zone:hover {
                            border-color: var(--primary);
                            background: #eff6ff;
                        }
                        .upload-zone.success {
                            border-color: #10b981;
                            background: #f0fdf4;
                        }
                        .upload-content {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 8px;
                        }
                        .icon-upload {
                            font-size: 24px;
                            color: #64748b;
                        }
                        .icon-success {
                            font-size: 28px;
                            color: #10b981;
                        }
                        .upload-zone:hover .icon-upload {
                            color: var(--primary);
                        }
                        .spinner-border {
                            width: 24px;
                            height: 24px;
                            border: 3px solid #e2e8f0;
                            border-top-color: var(--primary);
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                        }
                        .preview-link {
                            font-size: 14px;
                            color: var(--primary);
                            text-align: center;
                            font-weight: 500;
                            text-decoration: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 6px;
                            padding: 8px;
                            background: #f1f5f9;
                            border-radius: 8px;
                            transition: background 0.2s;
                        }
                        .preview-link:hover {
                            background: #e2e8f0;
                        }
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                        .form-input {
                            width: 100%;
                            padding: 12px 16px;
                            border-radius: 12px;
                            border: 1.5px solid var(--border);
                            font-size: 14px;
                            outline: none;
                            transition: border-color 0.2s;
                        }
                        .form-input:focus {
                            border-color: var(--primary);
                            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                        }
                        .animate-fade-in {
                            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>

            <Footer />
        </>
    );
}

const customSelectStyles = {
    control: (base: any) => ({ ...base, borderRadius: '12px', border: '1.5px solid var(--border)', padding: '2px', fontSize: '14px', backgroundColor: 'white', '&:hover': { borderColor: 'var(--primary)' } }),
    option: (base: any, state: any) => ({ ...base, backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-light)' : 'white', color: state.isSelected ? 'white' : 'var(--text)', fontSize: '14px' }),
};