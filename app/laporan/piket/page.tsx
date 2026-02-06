'use client';

import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../laporan.css'; // We'll keep general styles but override for specific UI

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acca.icgowa.sch.id';
const PHP_HANDLER_URL = process.env.NEXT_PUBLIC_PHP_HANDLER_URL || 'https://icgowa.sch.id/akademik.icgowa.sch.id/upload_handler.php';

export default function LaporanPiketPage() {
    // Master Data
    const [guruList, setGuruList] = useState<any[]>([]);
    const [kelasList, setKelasList] = useState<string[]>([]);
    const [kehadiranOptions, setKehadiranOptions] = useState<any[]>([]);
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
    const [uploadProgress, setUploadProgress] = useState(0);

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
                    setKelasList(dataKelas.data.map((k: any) => k.nama));
                }

                // Fetch Dropdown Status Kehadiran
                try {
                    const resDrop = await fetch(`${API_URL}/api/master/dropdown`);
                    if (resDrop.ok) {
                        const dataDrop = await resDrop.json();
                        setKehadiranOptions(dataDrop.data.kategori_kehadiran || []);
                    } else {
                        // Fallback jika API return error (404/500)
                        setKehadiranOptions(['Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Tugas', 'Kelas Kosong'].map(k => ({ value: k, label: k })));
                    }
                } catch (err) {
                    console.warn("Dropdown API not ready or blocked, using fallback", err);
                    setKehadiranOptions(['Hadir', 'Sakit', 'Izin', 'Tanpa Keterangan', 'Tugas', 'Kelas Kosong'].map(k => ({ value: k, label: k })));
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

    // File Upload Handler - Bypassing API to avoid 413 error
    const handleFileUploadDirect = async (kelas: string, file: File) => {
        if (!file) return;

        // Validasi ukuran file (Maks 10MB)
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire('File Terlalu Besar', 'Ukuran foto maksimal adalah 10 MB.', 'error');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);

            const result = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                    }
                });

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try { resolve(JSON.parse(xhr.responseText)); }
                            catch (e) { reject(new Error('Format respons server tidak valid')); }
                        } else {
                            let errMsg = 'Gagal mengunggah file';
                            try {
                                const res = JSON.parse(xhr.responseText);
                                if (res.message) errMsg = res.message;
                                else if (res.error) errMsg = res.error;
                            } catch (e) { }
                            reject(new Error(errMsg + (xhr.status ? ` (Status: ${xhr.status})` : '')));
                        }
                    }
                };

                // Create FormData for direct PHP upload
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', 'piket');
                formData.append('kelas', kelas);

                xhr.open('POST', PHP_HANDLER_URL);
                xhr.send(formData);
            });

            if (result.status === 'success' || result.ok) {
                const finalUrl = result.file_url || result.publicUrl;
                updateClassData(kelas, 'dokumentasi_url', finalUrl);
                Swal.fire({
                    icon: 'success',
                    title: 'Foto Terupload',
                    text: `Dokumentasi untuk ${kelas} berhasil diunggah.`,
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                throw new Error(result.message || result.error || 'Gagal mengunggah file ke hosting');
            }
        } catch (err: any) {
            Swal.fire('Gagal Upload', err.message, 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
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
            })).filter(d => d.guru || d.status);

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
                                        style={{ height: '42px' }}
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
                                            options={kehadiranOptions}
                                            onChange={(opt: any) => updateClassData(currentClass, 'status', opt?.value)}
                                            value={kehadiranOptions.find(k => k.value === currentData.status)}
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
                                                    onChange={(e) => e.target.files?.[0] && handleFileUploadDirect(currentClass, e.target.files[0])}
                                                    className="hidden-input"
                                                />
                                                <label htmlFor={`file-upload-${currentClass}`} className={`upload-zone ${uploading ? 'uploading' : ''} ${currentData.dokumentasi_url ? 'success' : ''}`}>
                                                    <div className="upload-content">
                                                        {uploading ? (
                                                            <>
                                                                <div className="spinner-border"></div>
                                                                <span className="font-bold text-primary">{uploadProgress}%</span>
                                                                <span className="text-xs text-gray-500">Mengunggah...</span>
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
                                                                    <span className="text-xs text-gray-400">Pilih file (Maks. 10MB)</span>
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
                </div>
            </div>
            <Footer />

            <style jsx>{`
                .laporan-page { 
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }
                .laporan-banner {
                    background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
                    padding: 40px;
                    border-radius: 24px;
                    color: white;
                    margin-bottom: 40px;
                }
                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .header-icon {
                    width: 60px;
                    height: 60px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                }
                .laporan-banner h1 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                }
                .laporan-banner p {
                    margin: 5px 0 0;
                    opacity: 0.8;
                }
                .laporan-card {
                    background: white;
                    padding: 30px;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                }
                .form-section {
                    margin-bottom: 40px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
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
                    min-width: 120px;
                    padding: 12px 20px;
                    border-radius: 16px;
                    background: white;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 1px solid #e2e8f0;
                    text-align: center;
                    color: #64748b;
                }
                .class-card.center {
                    background: #1e3a8a;
                    color: white;
                    transform: scale(1.1);
                    z-index: 2;
                }
                .class-card.left, .class-card.right {
                    opacity: 0.5;
                    transform: scale(0.9);
                }
                .class-form-area {
                    background: #f8fafc;
                    padding: 24px;
                    border-radius: 20px;
                    border: 1px dashed #cbd5e1;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-weight: 600;
                    color: #334155;
                    margin-bottom: 8px;
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
                    transition: all 0.2s;
                    min-height: 100px;
                }
                .upload-zone:hover {
                    border-color: #1e3a8a;
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
                .spinner-border {
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #1e3a8a;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                .preview-link {
                    margin-top: 10px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #1e3a8a;
                    font-weight: 600;
                    text-decoration: none;
                }
                .form-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1.5px solid #f1f5f9;
                }
                .submit-btn {
                    background: #1e3a8a;
                    color: white;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }
                .submit-btn:hover:not(:disabled) {
                    background: #1e40af;
                    transform: translateY(-2px);
                }
                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: wait;
                }
                .hidden-input { display: none; }
                .form-input {
                    padding: 10px 15px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    outline: none;
                    width: 100%;
                }
                .form-input:focus { border-color: #1e3a8a; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </>
    );
}

const customSelectStyles = {
    control: (base: any) => ({ ...base, borderRadius: '12px', border: '1.5px solid #e2e8f0', padding: '2px', fontSize: '14px', '&:hover': { borderColor: '#1e3a8a' } }),
    option: (base: any, state: any) => ({ ...base, backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#eff6ff' : 'white', color: state.isSelected ? 'white' : '#1e293b', fontSize: '14px' }),
};