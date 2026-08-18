-- ============================================================
-- KALENDER GERAK — Database Schema
-- Jalankan file ini di Supabase SQL Editor
-- ============================================================

-- Hapus tabel lama jika ada (untuk fresh install)
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- TABEL: profiles (pengguna: siswa & guru)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nis_nip       TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('siswa', 'guru')),
  class_name    TEXT,              -- Contoh: "4A", "5B" (untuk siswa)
  grade         INTEGER CHECK (grade BETWEEN 1 AND 6), -- 1-6 (untuk siswa)
  school_name   TEXT DEFAULT 'SDN Maju Bersama 01',
  password      TEXT NOT NULL,
  avatar_color  TEXT DEFAULT '#43A047',  -- Warna avatar inisial
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABEL: activities (aktivitas fisik harian siswa)
-- ============================================================
CREATE TABLE activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL,
  activity_name   TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  points          INTEGER NOT NULL CHECK (points > 0),
  activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_activities_student_date ON activities(student_id, activity_date);
CREATE INDEX idx_activities_date ON activities(activity_date);

-- ============================================================
-- TABEL: badges (penghargaan siswa)
-- ============================================================
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type  TEXT NOT NULL,
  badge_name  TEXT NOT NULL,
  badge_emoji TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_badges_student ON badges(student_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Permissive policies untuk demo — memungkinkan akses publik
-- ============================================================
ALTER TABLE profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges     ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan semua operasi (untuk demo)
CREATE POLICY "allow_all_profiles"   ON profiles   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activities" ON activities  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_badges"     ON badges      FOR ALL USING (true) WITH CHECK (true);
