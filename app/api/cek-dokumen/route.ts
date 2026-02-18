
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const { nisn, nama_ibu } = await request.json()

        if (!nisn || !nama_ibu) {
            return NextResponse.json({ ok: false, error: 'NISN dan Nama Ibu wajib diisi' }, { status: 400 })
        }

        // Initialize Supabase Admin Client for bypassing RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl) {
            console.error('SERVER ERROR: NEXT_PUBLIC_SUPABASE_URL is missing.')
            return NextResponse.json({ ok: false, error: 'Server Config Error: Missing Supabase URL' }, { status: 500 })
        }

        if (!supabaseServiceRoleKey) {
            console.error('SERVER ERROR: SUPABASE_SERVICE_ROLE_KEY is missing.')
            return NextResponse.json({ ok: false, error: 'Server Config Error: Missing Service Role Key' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

        // 1. Cari Siswa berdasarkan NISN (Using Admin Client to ensure we can read master_siswa)
        const { data: siswa, error: siswaError } = await supabaseAdmin
            .from('master_siswa')
            .select('nisn, nama_lengkap, nama_ibu')
            .eq('nisn', nisn)
            .single()

        if (siswaError || !siswa) {
            console.error('Siswa Error:', siswaError)
            return NextResponse.json({ ok: false, error: 'Data siswa tidak ditemukan' }, { status: 404 })
        }

        // 2. Verifikasi Nama Ibu (Case Insensitive & Trimmed)
        const dbNamaIbu = (siswa.nama_ibu || '').trim().toLowerCase()
        const inputNamaIbu = nama_ibu.trim().toLowerCase()

        // Simple strict equality check for verification security
        if (dbNamaIbu !== inputNamaIbu) {
            return NextResponse.json({ ok: false, error: 'Nama Ibu Kandung tidak sesuai dengan data kami.' }, { status: 403 })
        }

        // 3. Ambil Dokumen Resmi (dari Admin - Butuh Admin Client karena RLS)
        const { data: adminDocs, error: docError } = await supabaseAdmin
            .from('dokumen_siswa')
            .select('*')
            .eq('nisn', nisn)
            .order('created_at', { ascending: false })

        if (docError) {
            console.error('Doc Error:', docError)
            return NextResponse.json({ ok: false, error: 'Gagal memuat dokumen resmi' }, { status: 500 })
        }

        // 4. Ambil Dokumen Upload Mandiri (dari Siswa - Juga pakai Admin Client supaya konsisten)
        const { data: studentDocs, error: studentDocError } = await supabaseAdmin
            .from('uploaded_documents')
            .select('*')
            .ilike('uploader_name', siswa.nama_lengkap) // Best effort match by name
            .order('created_at', { ascending: false })

        if (studentDocError) {
            console.error('Student Doc Error:', studentDocError)
        }

        // 5. Merge Documents
        const combinedDocs = [
            ...(adminDocs || []).map((d: any) => ({ ...d, source: 'official', uploader: 'Admin' })),
            ...(studentDocs || []).map((d: any) => ({
                id: d.id,
                created_at: d.created_at,
                judul: d.file_name,
                kategori: d.category_name,
                file_url: d.file_url,
                source: 'student',
                uploader: d.uploader_name
            }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return NextResponse.json({
            ok: true,
            data: combinedDocs,
            siswa_nama: siswa.nama_lengkap
        })


    } catch (error: any) {
        console.error('Server Error:', error)
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
