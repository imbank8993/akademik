
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const { nisn, nip, identifier, role = 'siswa' } = await request.json()

        if (role === 'siswa' && (!nisn || !identifier)) {
            return NextResponse.json({ ok: false, error: 'NISN dan Nama Ibu wajib diisi' }, { status: 400 })
        }
        if (role === 'guru' && (!nip || !identifier)) {
            return NextResponse.json({ ok: false, error: 'NIP dan Password wajib diisi' }, { status: 400 })
        }

        // Initialize Supabase Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceRoleKey) {
            return NextResponse.json({ ok: false, error: 'Server Config Error' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

        let personData: any = null;

        if (role === 'siswa') {
            const { data: siswa, error } = await supabaseAdmin
                .from('master_siswa')
                .select('nisn, nama_lengkap, nama_ibu')
                .eq('nisn', nisn)
                .single()

            if (error || !siswa) return NextResponse.json({ ok: false, error: 'Data siswa tidak ditemukan' }, { status: 404 })

            if ((siswa.nama_ibu || '').trim().toLowerCase() !== identifier.trim().toLowerCase()) {
                return NextResponse.json({ ok: false, error: 'Nama Ibu Kandung tidak sesuai.' }, { status: 403 })
            }
            personData = { id: nisn, nama: siswa.nama_lengkap, role: 'siswa' };
        } else {
            // 1. Get Username from users table in ACCA by NIP
            const { data: userData, error: userError } = await supabaseAdmin
                .from('users')
                .select('username, nama_lengkap')
                .eq('nip', nip)
                .single()

            if (userError || !userData) {
                return NextResponse.json({ ok: false, error: 'NIP Guru tidak terdaftar di sistem ACCA' }, { status: 404 })
            }

            // 2. Authenticate with Password using simulated email
            const email = `${userData.username}@acca.local`
            const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
                email,
                password: identifier // identifier holds the password in this role
            })

            if (authError) {
                return NextResponse.json({ ok: false, error: 'Password ACCA tidak sesuai.' }, { status: 401 })
            }

            personData = { id: nip, nama: userData.nama_lengkap, role: 'guru' };
        }

        // 3. Ambil Dokumen Resmi (target_role filter)
        let docQuery = supabaseAdmin
            .from('dokumen_siswa')
            .select('*')
            .eq('target_role', role)

        if (role === 'siswa') {
            docQuery = docQuery.eq('nisn', nisn)
        } else {
            docQuery = docQuery.eq('nip', nip)
        }

        const { data: adminDocs, error: docError } = await docQuery.order('created_at', { ascending: false })

        if (docError) {
            console.error('Doc Error:', docError)
            return NextResponse.json({ ok: false, error: 'Gagal memuat dokumen resmi' }, { status: 500 })
        }

        // 4. Ambil Dokumen Upload Mandiri (by uploader_role)
        const { data: uploadedDocs, error: uploadError } = await supabaseAdmin
            .from('uploaded_documents')
            .select('*')
            .eq('uploader_role', role)
            .ilike('uploader_name', personData.nama)
            .order('created_at', { ascending: false })

        if (uploadError) console.error('Upload Doc Error:', uploadError)

        // 5. Merge Documents
        const combinedDocs = [
            ...(adminDocs || []).map((d: any) => ({ ...d, source: 'official', uploader: 'Admin' })),
            ...(uploadedDocs || []).map((d: any) => ({
                id: d.id,
                created_at: d.created_at,
                judul: d.file_name,
                kategori: d.category_name,
                file_url: d.file_url,
                source: 'user',
                uploader: d.uploader_name
            }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        return NextResponse.json({
            ok: true,
            data: combinedDocs,
            nama: personData.nama,
            role: personData.role
        })


    } catch (error: any) {
        console.error('Server Error:', error)
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
