// src/app/api/my-quotes/route.ts

import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
    try {
        // 1. Temukan path ke file JSON
        // process.cwd() menunjuk ke direktori root proyek Anda
        const jsonDirectory = path.join(process.cwd(), 'data');

        // 2. Baca file quotes.json
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'quotes.json'), 'utf8');

        // 3. Ubah konten file (string) menjadi objek JavaScript (array)
        const quotes = JSON.parse(fileContents);

        // 4. Ambil satu kutipan secara acak dari array
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        // 5. Kirim kutipan acak sebagai respons JSON
        return NextResponse.json(randomQuote);

    } catch (error) {
        console.error("Gagal membaca file quotes:", error);
        // Jika terjadi error (misal file tidak ditemukan), kirim respons error
        return NextResponse.json(
            { error: "Tidak dapat mengambil kutipan." },
            { status: 500 }
        );
    }
}