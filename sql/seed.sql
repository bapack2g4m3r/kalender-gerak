-- ============================================================
-- KALENDER GERAK — Seed Data
-- Jalankan SETELAH schema.sql
-- ============================================================

-- ============================================================
-- DATA GURU (2 guru)
-- ============================================================
INSERT INTO profiles (nis_nip, name, role, school_name, password, avatar_color) VALUES
('GR001', 'Bapak Ahmad Fauzi, S.Pd', 'guru', 'SDN Maju Bersama 01', 'guru123', '#1565C0'),
('GR002', 'Ibu Sari Dewi, S.Pd', 'guru', 'SDN Maju Bersama 01', 'guru123', '#6A1B9A');

-- ============================================================
-- DATA SISWA (48 siswa, 8 per kelas, kelas 1A-6A)
-- ============================================================

-- KELAS 1A (Grade 1)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('100001', 'Ahmad Rizki Pratama', 'siswa', '1A', 1, '1234', '#F44336'),
('100002', 'Budi Santoso', 'siswa', '1A', 1, '1234', '#E91E63'),
('100003', 'Citra Dewi Lestari', 'siswa', '1A', 1, '1234', '#9C27B0'),
('100004', 'Dian Ayu Rahayu', 'siswa', '1A', 1, '1234', '#3F51B5'),
('100005', 'Eka Nugroho Putra', 'siswa', '1A', 1, '1234', '#2196F3'),
('100006', 'Fajar Wahyu Hidayat', 'siswa', '1A', 1, '1234', '#00BCD4'),
('100007', 'Gita Maharani', 'siswa', '1A', 1, '1234', '#009688'),
('100008', 'Hendra Wijaya', 'siswa', '1A', 1, '1234', '#4CAF50');

-- KELAS 2A (Grade 2)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('200001', 'Indah Permata Sari', 'siswa', '2A', 2, '1234', '#8BC34A'),
('200002', 'Joko Susilo Wibowo', 'siswa', '2A', 2, '1234', '#FFC107'),
('200003', 'Kiki Amalia Putri', 'siswa', '2A', 2, '1234', '#FF9800'),
('200004', 'Lena Wulandari', 'siswa', '2A', 2, '1234', '#FF5722'),
('200005', 'Muhamad Farhan Arif', 'siswa', '2A', 2, '1234', '#795548'),
('200006', 'Nina Permata Hati', 'siswa', '2A', 2, '1234', '#607D8B'),
('200007', 'Oki Darmawan Saputra', 'siswa', '2A', 2, '1234', '#E91E63'),
('200008', 'Putri Maharani Dewi', 'siswa', '2A', 2, '1234', '#9C27B0');

-- KELAS 3A (Grade 3)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('300001', 'Qori Fadillah Rahman', 'siswa', '3A', 3, '1234', '#3F51B5'),
('300002', 'Rendi Saputra Jaya', 'siswa', '3A', 3, '1234', '#2196F3'),
('300003', 'Siti Nuraini Rahmawati', 'siswa', '3A', 3, '1234', '#00BCD4'),
('300004', 'Toni Prasetyo Nugroho', 'siswa', '3A', 3, '1234', '#009688'),
('300005', 'Umar Hakim Firdaus', 'siswa', '3A', 3, '1234', '#4CAF50'),
('300006', 'Vina Anggraini Putri', 'siswa', '3A', 3, '1234', '#8BC34A'),
('300007', 'Wahyu Hidayatullah', 'siswa', '3A', 3, '1234', '#FF9800'),
('300008', 'Yanti Kusuma Dewi', 'siswa', '3A', 3, '1234', '#F44336');

-- KELAS 4A (Grade 4)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('400001', 'Yoga Pratama Santoso', 'siswa', '4A', 4, '1234', '#E91E63'),
('400002', 'Zahra Aulia Fitri', 'siswa', '4A', 4, '1234', '#673AB7'),
('400003', 'Aldi Nugroho Purnomo', 'siswa', '4A', 4, '1234', '#1565C0'),
('400004', 'Bella Susanti Rahayu', 'siswa', '4A', 4, '1234', '#0097A7'),
('400005', 'Candra Wijaya Kusuma', 'siswa', '4A', 4, '1234', '#388E3C'),
('400006', 'Dina Rahmawati Sari', 'siswa', '4A', 4, '1234', '#F57F17'),
('400007', 'Eko Santoso Prabowo', 'siswa', '4A', 4, '1234', '#E65100'),
('400008', 'Fitri Handayani Wati', 'siswa', '4A', 4, '1234', '#BF360C');

-- KELAS 5A (Grade 5)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('500001', 'Galih Purnomo Aji', 'siswa', '5A', 5, '1234', '#4A148C'),
('500002', 'Hani Safitri Dewi', 'siswa', '5A', 5, '1234', '#880E4F'),
('500003', 'Ibnu Hajar Al-Amin', 'siswa', '5A', 5, '1234', '#1A237E'),
('500004', 'Juli Wulandari Putri', 'siswa', '5A', 5, '1234', '#006064'),
('500005', 'Krisna Bayu Aji', 'siswa', '5A', 5, '1234', '#1B5E20'),
('500006', 'Laila Nur Hidayah', 'siswa', '5A', 5, '1234', '#F57F17'),
('500007', 'Miko Ardiansyah Putra', 'siswa', '5A', 5, '1234', '#BF360C'),
('500008', 'Nadya Salsabila Nur', 'siswa', '5A', 5, '1234', '#212121');

-- KELAS 6A (Grade 6)
INSERT INTO profiles (nis_nip, name, role, class_name, grade, password, avatar_color) VALUES
('600001', 'Ogi Setiawan Putra', 'siswa', '6A', 6, '1234', '#F44336'),
('600002', 'Prita Maharani Putri', 'siswa', '6A', 6, '1234', '#9C27B0'),
('600003', 'Qodir Abdillah Hasan', 'siswa', '6A', 6, '1234', '#3F51B5'),
('600004', 'Rona Fitriani Dewi', 'siswa', '6A', 6, '1234', '#00BCD4'),
('600005', 'Samsul Bahri Lubis', 'siswa', '6A', 6, '1234', '#4CAF50'),
('600006', 'Tari Kusuma Wardani', 'siswa', '6A', 6, '1234', '#FF9800'),
('600007', 'Ucok Simanjuntak', 'siswa', '6A', 6, '1234', '#795548'),
('600008', 'Vivi Rahayu Ningsih', 'siswa', '6A', 6, '1234', '#607D8B');

-- ============================================================
-- DATA AKTIVITAS (14 hari terakhir, bervariasi per siswa)
-- ============================================================

-- Helper function untuk insert aktivitas
-- PERBAIKAN: Gunakan v_activities[row][col] bukan v_activities[row]
-- karena PostgreSQL tidak bisa mengekstrak "row" 2D array ke TEXT[] langsung.
DO $$
DECLARE
  v_student_id UUID;
  v_activities TEXT[][] := ARRAY[
    ARRAY['jalan_kaki',  'Jalan Kaki',   '30', '20'],
    ARRAY['lari',        'Lari',          '20', '30'],
    ARRAY['sepak_bola',  'Sepak Bola',   '30', '40'],
    ARRAY['bersepeda',   'Bersepeda',    '30', '30'],
    ARRAY['bulu_tangkis','Bulu Tangkis', '30', '30'],
    ARRAY['senam',       'Senam',         '30', '24'],
    ARRAY['lompat_tali', 'Lompat Tali',  '20', '40'],
    ARRAY['berenang',    'Berenang',      '30', '50']
  ];
  v_patterns INTEGER[][] := ARRAY[
    ARRAY[10, 70,  20],
    ARRAY[25, 50,  10],
    ARRAY[40, 30,   0],
    ARRAY[60, 20,  -5],
    ARRAY[75, 10, -10]
  ];
  v_skip_chance  INTEGER;
  v_extra_chance INTEGER;
  v_pts_boost    INTEGER;
  v_day_offset   INTEGER;
  v_act_count    INTEGER;
  v_act_idx      INTEGER;
  v_total_pts    INTEGER;
  v_nis_list TEXT[] := ARRAY[
    '100001','100002','100003','100004','100005','100006','100007','100008',
    '200001','200002','200003','200004','200005','200006','200007','200008',
    '300001','300002','300003','300004','300005','300006','300007','300008',
    '400001','400002','400003','400004','400005','400006','400007','400008',
    '500001','500002','500003','500004','500005','500006','500007','500008',
    '600001','600002','600003','600004','600005','600006','600007','600008'
  ];
  v_nis     TEXT;
  v_pat_idx INTEGER;
  i         INTEGER;
  j         INTEGER;
BEGIN
  FOR i IN 1..array_length(v_nis_list, 1) LOOP
    v_nis := v_nis_list[i];

    v_pat_idx      := (i % 5) + 1;
    -- Akses 2D array dengan dua subscript: [baris][kolom]
    v_skip_chance  := v_patterns[v_pat_idx][1];
    v_extra_chance := v_patterns[v_pat_idx][2];
    v_pts_boost    := v_patterns[v_pat_idx][3];

    SELECT id INTO v_student_id FROM profiles WHERE nis_nip = v_nis;

    FOR v_day_offset IN 1..14 LOOP
      IF (RANDOM() * 100)::INTEGER < v_skip_chance THEN
        CONTINUE;
      END IF;

      v_act_count := 1;
      IF (RANDOM() * 100)::INTEGER < v_extra_chance THEN
        v_act_count := 2;
      END IF;

      FOR j IN 1..v_act_count LOOP
        v_act_idx   := (FLOOR(RANDOM() * 8) + 1)::INTEGER;
        -- Akses setiap kolom secara eksplisit dengan [baris][kolom]
        v_total_pts := v_activities[v_act_idx][4]::INTEGER + v_pts_boost;
        IF v_total_pts < 5 THEN v_total_pts := 5; END IF;

        INSERT INTO activities
          (student_id, activity_type, activity_name, duration_minutes, points, activity_date)
        VALUES (
          v_student_id,
          v_activities[v_act_idx][1],          -- activity_type
          v_activities[v_act_idx][2],          -- activity_name
          v_activities[v_act_idx][3]::INTEGER, -- duration_minutes
          v_total_pts,                          -- points
          CURRENT_DATE - v_day_offset
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- DATA BADGE (untuk siswa yang sudah aktif)
-- ============================================================
INSERT INTO badges (student_id, badge_type, badge_name, badge_emoji)
SELECT p.id, 'anak_aktif', 'Anak Aktif', '🏃'
FROM profiles p
WHERE p.role = 'siswa' AND p.nis_nip IN ('100001','200002','300003','400004','500005','600001','100003','200006');

INSERT INTO badges (student_id, badge_type, badge_name, badge_emoji)
SELECT p.id, 'bintang_gerak', 'Bintang Gerak', '⭐'
FROM profiles p
WHERE p.role = 'siswa' AND p.nis_nip IN ('100001','300003','500005','600001');

INSERT INTO badges (student_id, badge_type, badge_name, badge_emoji)
SELECT p.id, 'juara_hari_ini', 'Juara Hari Ini', '🏆'
FROM profiles p
WHERE p.role = 'siswa' AND p.nis_nip IN ('200002','400004','600001');
