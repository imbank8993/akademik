'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Swal from 'sweetalert2'
import AsyncSelect from 'react-select/async'

import { supabase } from '@/lib/supabase'

export default function UploadPage() {
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [fetching, setFetching] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Form State
    const [selectedUploader, setSelectedUploader] = useState<any>(null)
    const [role, setRole] = useState('siswa')
    const [categoryId, setCategoryId] = useState('')
    const [files, setFiles] = useState<File[]>([])

    const PHP_HANDLER_URL = process.env.NEXT_PUBLIC_PHP_HANDLER_URL || 'https://icgowa.sch.id/akademik.icgowa.sch.id/upload_handler.php'
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acca.icgowa.sch.id'

    useEffect(() => {
        setMounted(true)
        fetchCategories()
    }, [])

    useEffect(() => {
        setSelectedUploader(null)
    }, [role])

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/api/upload-categories`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setCategories(data)
            } else {
                setCategories([])
            }
        } catch (err: any) {
            console.error('Gagal mengambil kategori:', err.message)
            setCategories([])
        } finally {
            setFetching(false)
        }
    }

    const loadOptions = async (inputValue: string) => {
        if (!inputValue) return []

        try {
            const res = await fetch(`${API_URL}/api/uploader-search?type=${role}&q=${inputValue}`)
            const data = await res.json()

            let results = []
            if (Array.isArray(data) && data.length > 0) {
                results = data
            } else if (role === 'siswa') {
                // Jalur cadangan (Direct)
                const { data: directData } = await supabase
                    .from('siswa_kelas')
                    .select('nisn, nama_siswa, kelas')
                    .ilike('nama_siswa', `%${inputValue}%`)
                    .eq('aktif', true)
                    .limit(20);

                if (directData) {
                    results = directData.map(s => ({
                        label: `${s.nama_siswa} (${s.kelas || '?'})`,
                        value: s.nama_siswa,
                        id: s.nisn
                    }))
                }
            }

            // Deduplikasi Akhir (Frontend Guarantee)
            const uniqueResults: any[] = []
            const seen = new Set()
            results.forEach((item: any) => {
                const key = item.label.toLowerCase().trim()
                if (!seen.has(key)) {
                    seen.add(key)
                    uniqueResults.push(item)
                }
            })

            return uniqueResults
        } catch (err) {
            console.error('Error loadOptions:', err)
            return []
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUploader || !categoryId || files.length === 0) {
            Swal.fire({
                title: 'Data Belum Lengkap',
                text: 'Pastikan nama pengunggah, kategori, dan berkas sudah terpilih.',
                icon: 'warning',
                confirmButtonColor: '#0038A8'
            })
            return
        }

        setLoading(true)
        const totalFiles = files.length
        let successCount = 0
        let failCount = 0

        const category = categories.find(c => c.id === categoryId)
        const categoryName = category?.name || 'General'

        for (let i = 0; i < totalFiles; i++) {
            const currentFile = files[i]
            setUploadProgress(0)

            try {
                const formPayload = new FormData()
                formPayload.append('category', categoryName)
                formPayload.append('file', currentFile)

                const uploadData = await new Promise<any>((resolve, reject) => {
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
                                catch (e) { reject(new Error('Invalid response')); }
                            } else {
                                reject(new Error('Upload failed'));
                            }
                        }
                    };

                    xhr.open('POST', PHP_HANDLER_URL);
                    xhr.send(formPayload);
                });

                if (uploadData.status === 'success') {
                    const metaRes = await fetch(`${API_URL}/api/uploaded-documents`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uploader_name: selectedUploader.value,
                            uploader_role: role,
                            category_id: categoryId,
                            category_name: categoryName,
                            file_name: uploadData.file_name,
                            file_url: uploadData.file_url,
                            file_path: uploadData.file_path,
                        })
                    })

                    if (metaRes.ok) successCount++
                    else failCount++
                } else {
                    failCount++
                }
            } catch (err: any) {
                console.error(`Gagal mengunggah ${currentFile.name}:`, err)
                failCount++
            }
        }

        if (failCount === 0) {
            Swal.fire({
                title: 'Unggah Berhasil',
                text: `${successCount} dokumen Anda telah aman tersimpan di sistem.`,
                icon: 'success',
                confirmButtonColor: '#0038A8'
            })
            setSelectedUploader(null)
            setCategoryId('')
            setFiles([])
            const fileInput = document.getElementById('file-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } else {
            Swal.fire({
                title: 'Hasil Unggahan',
                text: `${successCount} Berhasil, ${failCount} Gagal.`,
                icon: successCount > 0 ? 'warning' : 'error',
                confirmButtonColor: '#0038A8'
            })
        }

        setLoading(false)
        setUploadProgress(0)
    }

    return (
        <div className="upload-page">
            <Header />

            <main className="main-content">
                <div className="decor-blob-1"></div>
                <div className="decor-blob-2"></div>

                <div className="container content-grid">
                    <div className="info-panel">
                        <div className="badge">Portal Administrasi Digital</div>
                        <h1>E-Dokumen Akademik</h1>
                        <p className="subtitle">Layanan unggah mandiri untuk Guru dan Siswa MAN IC Gowa guna mendukung digitalisasi arsip sekolah.</p>

                        <div className="instruction-card">
                            <div className="step">
                                <span className="step-num">1</span>
                                <div className="step-text">
                                    <strong>Identifikasi Diri</strong>
                                    <p>Pilih status Anda dan ketik nama lengkap pada kolom pencarian.</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-num">2</span>
                                <div className="step-text">
                                    <strong>Klasifikasi Berkas</strong>
                                    <p>Tentukan kategori dokumen yang akan dikirim (Tugas, Sertifikat, dll).</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-num">3</span>
                                <div className="step-text">
                                    <strong>Sinkronisasi</strong>
                                    <p>Klik tombol unggah dan tunggu konfirmasi penyimpanan otomatis.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-panel">
                        <div className="upload-card">
                            <div className="card-inner">
                                <form onSubmit={handleSubmit} className="upload-form">
                                    <div className="form-group">
                                        <label>Saya adalah seorang:</label>
                                        <div className="role-selector">
                                            <button
                                                type="button"
                                                className={`role-btn ${role === 'siswa' ? 'active' : ''}`}
                                                onClick={() => setRole('siswa')}
                                            >
                                                <i className="bi bi-mortarboard-fill"></i> Siswa
                                            </button>
                                            <button
                                                type="button"
                                                className={`role-btn ${role === 'guru' ? 'active' : ''}`}
                                                onClick={() => setRole('guru')}
                                            >
                                                <i className="bi bi-person-workspace"></i> Guru
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Cari Nama Lengkap</label>
                                        {mounted ? (
                                            <AsyncSelect
                                                cacheOptions
                                                loadOptions={loadOptions}
                                                defaultOptions
                                                value={selectedUploader}
                                                onChange={setSelectedUploader}
                                                placeholder={`Ketikan nama ${role}...`}
                                                instanceId="uploader-select"
                                                noOptionsMessage={({ inputValue }) => !inputValue ? "Ketik untuk mencari..." : "Nama tidak ditemukan"}
                                                loadingMessage={() => "Mencari data..."}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        borderRadius: '16px',
                                                        padding: '6px 8px',
                                                        borderColor: state.isFocused ? '#0038A8' : '#e2e8f0',
                                                        borderWidth: '2px',
                                                        boxShadow: 'none',
                                                        '&:hover': { borderColor: '#0038A8' }
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        padding: '12px 20px',
                                                        backgroundColor: state.isFocused ? '#f0f4ff' : 'white',
                                                        color: state.isFocused ? '#0038A8' : '#334155',
                                                        cursor: 'pointer'
                                                    })
                                                }}
                                            />
                                        ) : (
                                            <div className="placeholder-loading">Menyiapkan Database...</div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Kategori Dokumen</label>
                                        <div className="select-wrapper">
                                            <select
                                                className="form-control"
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                required
                                            >
                                                <option value="">-- Pilih Jenis --</option>
                                                {fetching ? (
                                                    <option disabled>Memuat daftar...</option>
                                                ) : categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <i className="bi bi-chevron-down arrow-abs"></i>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Unggah Berkas</label>
                                        <div className={`file-dropzone ${files.length > 0 ? 'has-file' : ''}`}>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                                multiple
                                                required
                                            />
                                            <div className="dropzone-content">
                                                {files.length > 0 ? (
                                                    <>
                                                        <i className="bi bi-file-earmark-check-fill text-success"></i>
                                                        <div className="file-info">
                                                            <span className="file-name">{files.length} Berkas Terpilih</span>
                                                            <span className="file-size">{(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(2)} KB</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-cloud-arrow-up"></i>
                                                        <div className="text-center">
                                                            <p>Pilih berkas atau tarik ke sini</p>
                                                            <small>PDF, PNG, JPG (Maks. 10MB)</small>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-upload" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner"></span>
                                                <span>Mengunggah {uploadProgress}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                Kirim Dokumen Sekarang
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                        <p className="copyright-form">Terintegrasi dengan Cloud Storage icgowa.sch.id</p>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
        .upload-page { 
          min-height: 100vh; 
          background: #fdfdfe; 
          padding-top: 100px; 
          display: flex; 
          flex-direction: column; 
          overflow-x: hidden;
          position: relative;
        }

        /* Decorative Background */
        .decor-blob-1 { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: rgba(0, 56, 168, 0.05); border-radius: 50%; filter: blur(100px); z-index: 0; }
        .decor-blob-2 { position: absolute; bottom: 100px; left: -100px; width: 300px; height: 300px; background: rgba(16, 185, 129, 0.05); border-radius: 50%; filter: blur(80px); z-index: 0; }

        .main-content { flex: 1; padding: 40px 0; z-index: 1; }
        .content-grid { 
          display: grid; 
          grid-template-columns: 1fr 500px; 
          gap: 60px; 
          align-items: stretch; /* MEMBUAT TINGGI SAMA KIRI-KANAN */
        }

        /* Info Panel */
        .info-panel { 
            display: flex; 
            flex-direction: column; 
            justify-content: center; /* MEMPOSISIKAN DI TENGAH SECARA VERTIKAL */
            padding-right: 20px;
        }
        .badge { background: #f0f4ff; color: #0038A8; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; width: fit-content; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        h1 { font-size: 3.5rem; font-weight: 800; color: #0f172a; line-height: 1.1; margin-bottom: 20px; }
        .subtitle { font-size: 1.1rem; color: #64748b; line-height: 1.6; max-width: 500px; margin-bottom: 40px; }

        .instruction-card { 
            display: flex; 
            flex-direction: column; 
            gap: 20px; 
            background: rgba(248, 250, 252, 0.5);
            padding: 30px;
            border-radius: 24px;
            border: 1px solid #f1f5f9;
        }
        .step { display: flex; gap: 16px; align-items: flex-start; }
        .step-num { width: 32px; height: 32px; background: #0038A8; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0, 56, 168, 0.3); }
        .step-text strong { display: block; color: #1e293b; font-size: 1rem; margin-bottom: 2px; }
        .step-text p { color: #64748b; font-size: 0.85rem; line-height: 1.4; }

        /* Form Panel */
        .upload-card { background: white; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; padding: 10px; }
        .card-inner { background: #fdfdfe; border-radius: 24px; border: 1px dashed #e2e8f0; padding: 32px; }
        .upload-form { display: flex; flex-direction: column; gap: 28px; }

        .form-group label { display: block; font-weight: 700; color: #334155; font-size: 0.9rem; margin-bottom: 10px; }

        /* Role Buttons */
        .role-selector { display: flex; gap: 12px; }
        .role-btn { flex: 1; padding: 12px; border-radius: 16px; border: 2px solid #f1f5f9; background: white; color: #64748b; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .role-btn i { font-size: 1.1rem; }
        .role-btn.active { border-color: #0038A8; background: #f0f4ff; color: #0038A8; }
        .role-btn:hover:not(.active) { border-color: #cbd5e1; background: #f8fafc; }

        .placeholder-loading { padding: 14px 20px; background: #f8fafc; border-radius: 16px; border: 2px solid #e2e8f0; color: #94a3b8; font-style: italic; }

        /* Custom Select */
        .select-wrapper { position: relative; }
        .form-control { width: 100%; padding: 14px 20px; border: 2px solid #e2e8f0; border-radius: 16px; appearance: none; font-size: 0.95rem; font-weight: 500; color: #1e293b; background: white; transition: all 0.2s; }
        .form-control:focus { outline: none; border-color: #0038A8; }
        .arrow-abs { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none; }

        /* Dropzone */
        .file-dropzone { border: 2px dashed #e2e8f0; border-radius: 20px; padding: 24px; position: relative; transition: all 0.2s; background: #f8fafc; }
        .file-dropzone:hover { border-color: #0038A8; background: #f0f4ff; }
        .file-dropzone.has-file { border-style: solid; border-color: #10b981; background: #ecfdf5; }
        .file-dropzone input { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2; }
        .dropzone-content { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #64748b; }
        .dropzone-content i { font-size: 2.4rem; color: #94a3b8; }
        .dropzone-content p { font-weight: 700; color: #475569; font-size: 0.9rem; }
        .dropzone-content small { font-size: 0.75rem; }
        
        .file-info { text-align: center; }
        .file-name { display: block; font-weight: 700; color: #064e3b; margin-bottom: 2px; }
        .file-size { font-size: 0.75rem; color: #059669; }

        /* Submit Button */
        .btn-upload { background: #0038A8; color: white; border: none; padding: 18px; border-radius: 18px; font-weight: 800; font-size: 1.05rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; box-shadow: 0 10px 25px -5px rgba(0, 56, 168, 0.4); }
        .btn-upload:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 30px -5px rgba(0, 56, 168, 0.5); }
        .btn-upload:active { transform: translateY(0); }
        .btn-upload:disabled { opacity: 0.6; cursor: wait; }

        .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .copyright-form { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 0.8rem; font-weight: 500; }

        @media (max-width: 1100px) {
          .content-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .info-panel { display: flex; flex-direction: column; align-items: center; }
          h1 { font-size: 2.8rem; }
          .instruction-card { max-width: 400px; text-align: left; }
          .form-panel { width: 100%; max-width: 600px; margin: 0 auto; }
        }
      `}</style>
        </div>
    )
}
