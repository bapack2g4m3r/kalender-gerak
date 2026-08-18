/**
 * KALENDER GERAK — Supabase Configuration
 *
 * CARA SETUP:
 * 1. Buat akun di https://supabase.com (gratis)
 * 2. Buat project baru
 * 3. Masuk ke Settings → API
 * 4. Salin "Project URL" dan "anon public" key
 * 5. Ganti nilai di bawah ini dengan milik Anda
 * 6. Jalankan sql/schema.sql di Supabase SQL Editor
 * 7. Jalankan sql/seed.sql di Supabase SQL Editor
 */

const SUPABASE_URL = 'https://zbrgaizvkkashstbmynq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicmdhaXp2a2thc2hzdGJteW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTAxMDEsImV4cCI6MjEwMjYyNjEwMX0.i0CwBAZqMY1hpM3n0MT4_napuq14fGcMm3A_pyUZnZU';

// Initialize Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// App version
const APP_VERSION = '1.0.0';
const SCHOOL_NAME = 'SDN Maju Bersama 01';
const DAILY_TARGET = 60; // Target poin harian (60 menit ≈ 60 poin)
