'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../laporan.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://acca.icgowa.sch.id';

export default function JurnalPembelajaranPage() {
    const [submitting, setSubmitting] = useState(false);
    const [loadingMaster, setLoadingMaster] = useState(true);
    const [masterData, setMasterData] = useState<any>({
        guru: [],
        mapel: [],
        kelas: [],
        waktu: [],
        jadwal: [],
        dropdown: {
            terlambat: [],
            kategoriKehadiran: [],
            statusKetidakhadiran: []
        }
    });

    const [formData, setFormData] = useState<any>({
        tanggal: new Date().toISOString().split('T')[0],
        nama_guru: '',
        nip: '',
        mata_pelajaran: '',
        kelas: '',
        jam_ke: '',
        materi: '',
        refleksi: '',
        kategori_kehadiran: 'Sesuai',
        guru_pengganti: '-',
        status_pengganti: '-',
        keterangan_terlambat: '-',
        keterangan_tambahan: '-',
        guru_piket: '-'
    });

    const [selectedHours, setSelectedHours] = useState<number[]>([]);
    const [jamOptions, setJamOptions] = useState<any[]>([]);
    const [mapelOptions, setMapelOptions] = useState<any[]>([]);
    const [kelasOptions, setKelasOptions] = useState<any[]>([]);
    const [teacherDaySchedule, setTeacherDaySchedule] = useState<any[]>([]);

    useEffect(() => {
        const fetchMaster = async () => {
            try {
                const res = await fetch(`${API_URL}/api/laporan/jurnal-master?valid_date=${formData.tanggal}`);
                const result = await res.json();
                if (result.ok) {
                    setMasterData(result.data);
                }
            } catch (err) {
                console.error('Failed to load master data', err);
            } finally {
                setLoadingMaster(false);
            }
        };
        fetchMaster();
    }, [formData.tanggal]);

    useEffect(() => {
        if (!masterData || loadingMaster) return;

        const dateObj = new Date(formData.tanggal);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];

        const activeSchedules = (masterData.jadwal || []).filter((j: any) =>
            (j.nip && formData.nip ? j.nip === formData.nip : j.nama_guru === formData.nama_guru) &&
            j.hari === dayName &&
            j.aktif &&
            (!j.berlaku_mulai || j.berlaku_mulai <= formData.tanggal)
        );

        const scheduleMap = new Map<number, any>();
        activeSchedules.forEach((j: any) => {
            const jam = parseInt(j.jam_ke);
            if (!scheduleMap.has(jam) || (j.berlaku_mulai && j.berlaku_mulai > (scheduleMap.get(jam).berlaku_mulai || ''))) {
                scheduleMap.set(jam, j);
            }
        });
        const currentTeacherDaySchedule = Array.from(scheduleMap.values());
        setTeacherDaySchedule(currentTeacherDaySchedule);

        let availableKelas = (masterData.kelas || []).map((k: any) => ({ value: k.nama, label: k.nama }));
        if (currentTeacherDaySchedule.length > 0) {
            const uniqueKelas = Array.from(new Set(currentTeacherDaySchedule.map(s => s.kelas))).sort();
            availableKelas = uniqueKelas.map(k => ({ value: k, label: k }));
        }
        setKelasOptions(availableKelas);

        let availableMapels = (masterData.mapel || []).map((m: any) => ({ value: m.nama, label: m.nama }));
        if (formData.kelas && currentTeacherDaySchedule.length > 0) {
            const mapelsInClass = currentTeacherDaySchedule
                .filter(s => s.kelas === formData.kelas)
                .map(s => s.mata_pelajaran || s.mapel);

            const uniqueMapels = Array.from(new Set(mapelsInClass)).sort();
            if (uniqueMapels.length > 0) {
                availableMapels = uniqueMapels.map(m => ({ value: m, label: m }));
            }
        }
        setMapelOptions(availableMapels);

        let availableJams: any[] = [];
        if (formData.kelas && formData.mata_pelajaran) {
            const sessions = currentTeacherDaySchedule.filter(
                s => s.kelas === formData.kelas && (s.mata_pelajaran || s.mapel) === formData.mata_pelajaran
            );
            const classProgram = masterData.kelas.find((k: any) => k.nama === formData.kelas)?.program || 'Reguler';

            if (sessions.length > 0) {
                availableJams = sessions.sort((a, b) => parseInt(a.jam_ke) - parseInt(b.jam_ke)).map(s => {
                    const jamNum = parseInt(s.jam_ke);
                    const timeSlot = (masterData.waktu || []).find(
                        (w: any) => String(w.jam_ke) === String(s.jam_ke) &&
                            w.hari === dayName &&
                            (w.program || 'Reguler') === (classProgram || 'Reguler')
                    );
                    const timeStr = timeSlot ? `${timeSlot.mulai?.slice(0, 5)} - ${timeSlot.selesai?.slice(0, 5)}` : 'Waktu?';
                    return { value: jamNum.toString(), label: `Jam Ke-${jamNum}`, id: jamNum, timeStr: timeStr };
                });
            } else {
                const programWaktu = (masterData.waktu || []).filter((w: any) =>
                    w.hari === dayName && (w.program || 'Reguler') === (classProgram || 'Reguler')
                );
                availableJams = Array.from(new Set(programWaktu.map((w: any) => w.jam_ke)))
                    .sort((a: any, b: any) => parseInt(a) - parseInt(b))
                    .map((jam: any) => {
                        const slot = programWaktu.find((w: any) => w.jam_ke === jam);
                        return {
                            value: jam.toString(), label: `Jam Ke-${jam}`, id: parseInt(jam),
                            timeStr: slot ? `${slot.mulai?.slice(0, 5)} - ${slot.selesai?.slice(0, 5)}` : '--:--'
                        };
                    });
            }
        }
        setJamOptions(availableJams.length > 1 ? [{ value: 'all', label: '--- PILIH SEMUA JAM ---', isAll: true }, ...availableJams] : availableJams);

    }, [formData.tanggal, formData.nip, formData.kelas, formData.mata_pelajaran, masterData, loadingMaster]);

    const updateForm = (key: string, value: any) => {
        setFormData((prev: any) => {
            const next = { ...prev, [key]: value };
            if (key === 'nama_guru') {
                const guru = masterData.guru.find((g: any) => g.nama_lengkap === value);
                next.nip = guru ? guru.nip : '';
                next.kelas = '';
                next.mata_pelajaran = '';
                setSelectedHours([]);
            }
            if (key === 'tanggal') setSelectedHours([]);
            return next;
        });
    };

    const handleJamChange = (selectedOptions: any) => {
        if (!selectedOptions) { setSelectedHours([]); return; }
        const allOption = selectedOptions.find((o: any) => o.isAll);
        if (allOption) {
            const allHours = jamOptions.filter(o => !o.isAll).map(o => parseInt(o.value));
            setSelectedHours(allHours);
        } else {
            setSelectedHours(selectedOptions.map((o: any) => parseInt(o.value)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nip || !formData.tanggal || selectedHours.length === 0 || !formData.kelas || !formData.mata_pelajaran) {
            Swal.fire('Perhatian', 'Mohon lengkapi data wajib (Guru, Tanggal, Jam, Kelas, Mapel)!', 'warning');
            return;
        }

        const currentKategori = (formData.kategori_kehadiran || 'Sesuai').toLowerCase().trim();
        const exceptions = ['sesuai', 'kosong', 'penugasan tanpa pendampingan', 'digabung', 'terlambat'];
        const isPenggantiRequired = !exceptions.includes(currentKategori);

        if (isPenggantiRequired && (formData.guru_pengganti === '-' || formData.status_pengganti === '-')) {
            Swal.fire('Perhatian', 'Guru Pengganti dan Status Kehadiran wajib diisi untuk kategori ini!', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const hari = days[new Date(formData.tanggal).getDay()];
            const payload = {
                ...formData,
                jam_ke: selectedHours.sort((a, b) => a - b).join(','),
                hari,
                selected_hours: selectedHours
            };

            const res = await fetch(`${API_URL}/api/jurnal/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.ok) {
                Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Jurnal Pembelajaran berhasil disimpan', timer: 2000, showConfirmButton: false });
                setFormData({ ...formData, materi: '', refleksi: '', is_final: false });
                setSelectedHours([]);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            Swal.fire('Gagal', error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Logic Follows Original Modal (JournalModal.tsx)
    const kategoriKehadiranOptions = masterData.dropdown.kategoriKehadiran.length > 0
        ? masterData.dropdown.kategoriKehadiran
        : [
            { value: 'Sesuai', label: 'Sesuai' },
            { value: 'Terlambat', label: 'Terlambat' },
            { value: 'Diganti', label: 'Diganti' },
            { value: 'Tidak Hadir', label: 'Tidak Hadir' }
        ];

    const statusPenggantiOptions = kategoriKehadiranOptions.filter(
        (opt: any) => (opt.value || '').toLowerCase().trim() !== (formData.kategori_kehadiran || '').toLowerCase().trim()
    );

    const isPenggantiCategory = !['sesuai', 'kosong', 'penugasan tanpa pendampingan', 'digabung', 'terlambat'].includes(
        (formData.kategori_kehadiran || '').toLowerCase().trim()
    );

    const guruOptions = masterData.guru.map((g: any) => ({ value: g.nama_lengkap, label: g.nama_lengkap, nip: g.nip }));

    return (
        <>
            <Header />
            <div className="laporan-page">
                <div className="laporan-banner">
                    <div className="header-content">
                        <div className="header-icon"><i className="bi bi-journal-check"></i></div>
                        <div>
                            <h1>Jurnal Pembelajaran</h1>
                            <p>Catat kegiatan belajar mengajar harian Anda</p>
                        </div>
                    </div>
                </div>

                <div className="laporan-card">
                    <form onSubmit={handleSubmit} className="laporan-form">
                        <div className="form-grid">
                            <div className="form-section">
                                <h3 className="section-title"><i className="bi bi-person-badge"></i> Identitas & Waktu</h3>
                                <div className="form-group">
                                    <label>Nama Guru</label>
                                    <Select
                                        instanceId="select-guru-jurnal"
                                        options={guruOptions}
                                        placeholder={loadingMaster ? "Memuat..." : "Pilih guru..."}
                                        value={guruOptions.find((g: any) => g.value === formData.nama_guru)}
                                        onChange={(opt: any) => updateForm('nama_guru', opt?.value)}
                                        isLoading={loadingMaster}
                                        styles={customSelectStyles}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group flex-1">
                                        <label>Tanggal</label>
                                        <input type="date" value={formData.tanggal} onChange={(e) => updateForm('tanggal', e.target.value)} />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label>Kelas</label>
                                        <Select
                                            instanceId="select-kelas-jurnal"
                                            options={kelasOptions}
                                            value={kelasOptions.find((k: any) => k.value === formData.kelas)}
                                            placeholder="Pilih kelas..."
                                            onChange={(opt: any) => updateForm('kelas', opt?.value)}
                                            styles={customSelectStyles}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Mata Pelajaran</label>
                                    <Select
                                        instanceId="select-mapel-jurnal"
                                        options={mapelOptions}
                                        value={mapelOptions.find((m: any) => m.value === formData.mata_pelajaran)}
                                        placeholder="Pilih mapel..."
                                        onChange={(opt: any) => updateForm('mata_pelajaran', opt?.value)}
                                        styles={customSelectStyles}
                                        isDisabled={!formData.kelas}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Jam Ke</label>
                                    <Select
                                        instanceId="select-jam-jurnal"
                                        isMulti
                                        options={jamOptions}
                                        value={jamOptions.filter(o => !o.isAll && selectedHours.includes(parseInt(o.value)))}
                                        onChange={handleJamChange}
                                        placeholder="Pilih jam..."
                                        styles={customSelectStyles}
                                        isDisabled={!formData.mata_pelajaran}
                                        formatOptionLabel={(opt: any) => (
                                            <div className="flex justify-between items-center w-full">
                                                <span className={opt.isAll ? "font-bold text-blue-600" : ""}>{opt.label}</span>
                                                {!opt.isAll && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{opt.timeStr}</span>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3 className="section-title"><i className="bi bi-check2-circle"></i> Status Kehadiran</h3>
                                <div className="form-group">
                                    <label>Status</label>
                                    <Select
                                        instanceId="select-kategori-jurnal"
                                        options={kategoriKehadiranOptions}
                                        value={kategoriKehadiranOptions.find((k: any) => k.value === formData.kategori_kehadiran)}
                                        onChange={(opt: any) => updateForm('kategori_kehadiran', opt?.value)}
                                        styles={customSelectStyles}
                                    />
                                </div>

                                {formData.kategori_kehadiran === 'Terlambat' && (
                                    <div className="form-group animate-slide-down">
                                        <label>Alasan Terlambat</label>
                                        <Select
                                            instanceId="select-terlambat-jurnal"
                                            options={masterData.dropdown.terlambat}
                                            value={masterData.dropdown.terlambat.find((t: any) => t.value === formData.keterangan_terlambat)}
                                            onChange={(opt: any) => updateForm('keterangan_terlambat', opt?.value)}
                                            styles={customSelectStyles}
                                        />
                                    </div>
                                )}

                                {isPenggantiCategory && (
                                    <div className="form-section-sub animate-slide-down">
                                        <div className="form-group">
                                            <label>Guru Pengganti / Mitra</label>
                                            <Select
                                                instanceId="select-pengganti-jurnal"
                                                options={guruOptions}
                                                value={guruOptions.find((g: any) => g.value === formData.guru_pengganti)}
                                                onChange={(opt: any) => updateForm('guru_pengganti', opt?.value)}
                                                styles={customSelectStyles}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Status Kehadiran Pengganti</label>
                                            <Select
                                                instanceId="select-status-pengganti-jurnal"
                                                options={statusPenggantiOptions}
                                                value={statusPenggantiOptions.find((s: any) => s.value === formData.status_pengganti)}
                                                onChange={(opt: any) => updateForm('status_pengganti', opt?.value)}
                                                styles={customSelectStyles}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Guru Piket (Opsional)</label>
                                    <Select
                                        instanceId="select-piket-jurnal"
                                        options={guruOptions}
                                        value={guruOptions.find((g: any) => g.value === formData.guru_piket)}
                                        onChange={(opt: any) => updateForm('guru_piket', opt?.value)}
                                        placeholder="Cari guru piket..."
                                        styles={customSelectStyles}
                                    />
                                </div>
                            </div>

                            <div className="form-section span-2">
                                <h3 className="section-title"><i className="bi bi-card-text"></i> Detail Pembelajaran</h3>
                                <div className="form-group">
                                    <label>Materi Pembelajaran</label>
                                    <textarea
                                        value={formData.materi}
                                        onChange={(e) => updateForm('materi', e.target.value)}
                                        placeholder="Contoh: Bab 3 — Persamaan Kuadrat..."
                                        rows={2}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Refleksi / Catatan Tambahan</label>
                                    <textarea
                                        value={formData.refleksi}
                                        onChange={(e) => updateForm('refleksi', e.target.value)}
                                        placeholder="Catatan hasil belajar atau hal penting lainnya..."
                                        rows={2}
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Keterangan Lainnya</label>
                                    <input
                                        type="text"
                                        value={formData.keterangan_tambahan}
                                        onChange={(e) => updateForm('keterangan_tambahan', e.target.value)}
                                        placeholder="Opsional..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-footer">
                            <div className="info-text">
                                <i className="bi bi-info-circle"></i>
                                {selectedHours.length > 0 ? ` Menyimpan ${selectedHours.length} blok jam pbm.` : ' Lengkapi data untuk mengirim.'}
                            </div>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? <i className="bi bi-arrow-repeat animate-spin"></i> : <i className="bi bi-send-fill"></i>}
                                {submitting ? ' Memproses...' : ' Submit Jurnal Jurnal'}
                            </button>
                        </div>
                    </form>
                </div>

                <style jsx>{`
                    .form-section-sub { background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px dashed #e2e8f0; display: flex; flex-direction: column; gap: 0.75rem; }
                    .animate-slide-down { animation: slideDown 0.3s ease-out; }
                    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    .info-text { color: var(--text-dim); font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
                `}</style>
            </div>
            <Footer />
        </>
    );
}

const customSelectStyles = {
    control: (base: any) => ({ ...base, borderRadius: '12px', border: '1.5px solid var(--border)', padding: '2px', fontSize: '14px', backgroundColor: 'var(--bg-alt)', '&:hover': { borderColor: 'var(--primary)' } }),
    option: (base: any, state: any) => ({ ...base, backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--primary-light)' : 'white', color: state.isSelected ? 'white' : 'var(--text)', fontSize: '14px' }),
    multiValue: (base: any) => ({ ...base, backgroundColor: 'var(--primary-light)', borderRadius: '8px' }),
    multiValueLabel: (base: any) => ({ ...base, fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', padding: '2px 6px' })
};
