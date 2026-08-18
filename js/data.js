/**
 * KALENDER GERAK — Data Layer (Supabase Operations)
 */

// ============================================================
// AUTH
// ============================================================

/** Login: cari user berdasarkan NIS/NIP dan password */
async function loginUser(nis_nip, password) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('nis_nip', nis_nip.trim())
    .eq('password', password)
    .single();

  if (error || !data) {
    throw new Error('NIS/NIP atau kata sandi salah.');
  }

  return data;
}

// ============================================================
// STUDENT — ACTIVITIES
// ============================================================

/** Tambah aktivitas baru untuk siswa */
async function addActivity({ studentId, activityType, activityName, durationMinutes, points, date }) {
  const { data, error } = await db
    .from('activities')
    .insert({
      student_id: studentId,
      activity_type: activityType,
      activity_name: activityName,
      duration_minutes: durationMinutes,
      points: points,
      activity_date: date || getTodayString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Dapatkan aktivitas hari ini untuk satu siswa */
async function getTodayActivities(studentId) {
  const today = getTodayString();
  const { data, error } = await db
    .from('activities')
    .select('*')
    .eq('student_id', studentId)
    .eq('activity_date', today)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Hitung total poin hari ini untuk satu siswa */
async function getTodayPoints(studentId) {
  const acts = await getTodayActivities(studentId);
  return acts.reduce((sum, a) => sum + a.points, 0);
}

/** Dapatkan aktivitas bulan tertentu untuk kalender */
async function getMonthActivities(studentId, year, month) {
  const startDate = `${year}-${String(month+1).padStart(2,'0')}-01`;
  const endDate   = new Date(year, month + 1, 0);
  const endStr    = `${year}-${String(month+1).padStart(2,'0')}-${String(endDate.getDate()).padStart(2,'0')}`;

  const { data, error } = await db
    .from('activities')
    .select('activity_date, points')
    .eq('student_id', studentId)
    .gte('activity_date', startDate)
    .lte('activity_date', endStr);

  if (error) throw error;

  // Group by date and sum points
  const byDate = {};
  (data || []).forEach(row => {
    byDate[row.activity_date] = (byDate[row.activity_date] || 0) + row.points;
  });

  return byDate;
}

/** Dapatkan riwayat aktivitas pada tanggal tertentu */
async function getDayActivities(studentId, dateStr) {
  const { data, error } = await db
    .from('activities')
    .select('*')
    .eq('student_id', studentId)
    .eq('activity_date', dateStr)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Hitung streak harian (hari berturut-turut aktif) */
async function calculateStreak(studentId) {
  const today = getTodayString();

  // Ambil 30 hari terakhir aktivitas
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth()+1).padStart(2,'0')}-${String(thirtyDaysAgo.getDate()).padStart(2,'0')}`;

  const { data, error } = await db
    .from('activities')
    .select('activity_date, points')
    .eq('student_id', studentId)
    .gte('activity_date', fromDate)
    .lte('activity_date', today);

  if (error) return 0;

  // Dapatkan hari-hari dengan target tercapai
  const pointsByDate = {};
  (data || []).forEach(row => {
    pointsByDate[row.activity_date] = (pointsByDate[row.activity_date] || 0) + row.points;
  });

  const achievedDays = new Set(
    Object.entries(pointsByDate)
      .filter(([, pts]) => pts >= DAILY_TARGET)
      .map(([date]) => date)
  );

  // Hitung streak dari hari ini ke belakang
  let streak = 0;
  let checkDate = new Date();

  // Jika hari ini belum tercapai, mulai dari kemarin
  if (!achievedDays.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 30; i++) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth()+1).padStart(2,'0')}-${String(checkDate.getDate()).padStart(2,'0')}`;
    if (achievedDays.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// ============================================================
// STUDENT — BADGES
// ============================================================

/** Dapatkan semua badge siswa */
async function getStudentBadges(studentId) {
  const { data, error } = await db
    .from('badges')
    .select('*')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false });

  if (error) return [];
  return data || [];
}

/** Cek dan berikan badge yang layak */
async function checkAndAwardBadges(studentId, currentPoints, streak) {
  const existing = await getStudentBadges(studentId);
  const existingTypes = new Set(existing.map(b => b.badge_type));
  const newBadges = [];

  const toAward = [];

  // Badge: Anak Aktif (pertama kali tercapai target)
  if (currentPoints >= DAILY_TARGET && !existingTypes.has('anak_aktif')) {
    toAward.push({ badge_type: 'anak_aktif', badge_name: 'Anak Aktif', badge_emoji: '🏃' });
  }

  // Badge: Juara Hari Ini (poin ≥ 80)
  if (currentPoints >= 80 && !existingTypes.has('juara_hari')) {
    toAward.push({ badge_type: 'juara_hari', badge_name: 'Juara Hari Ini', badge_emoji: '🏆' });
  }

  // Badge: Bintang Gerak (streak 3 hari)
  if (streak >= 3 && !existingTypes.has('bintang_gerak')) {
    toAward.push({ badge_type: 'bintang_gerak', badge_name: 'Bintang Gerak', badge_emoji: '⭐' });
  }

  // Badge: Semangat 7 (streak 7 hari)
  if (streak >= 7 && !existingTypes.has('streak_7')) {
    toAward.push({ badge_type: 'streak_7', badge_name: 'Semangat 7', badge_emoji: '🔥' });
  }

  // Insert new badges
  for (const badge of toAward) {
    const { data } = await db
      .from('badges')
      .insert({ student_id: studentId, ...badge })
      .select()
      .single();
    if (data) newBadges.push(data);
  }

  return newBadges;
}

// ============================================================
// TEACHER — STUDENT DATA
// ============================================================

/** Dapatkan semua siswa beserta poin hari ini */
async function getAllStudentsWithTodayPoints(classFilter = '') {
  const today = getTodayString();

  // Ambil semua siswa
  let query = db
    .from('profiles')
    .select('id, name, class_name, grade, avatar_color, nis_nip')
    .eq('role', 'siswa')
    .order('class_name')
    .order('name');

  if (classFilter) {
    query = query.eq('class_name', classFilter);
  }

  const { data: students, error } = await query;
  if (error) throw error;

  // Ambil poin hari ini untuk semua siswa
  const { data: todayActs } = await db
    .from('activities')
    .select('student_id, points')
    .eq('activity_date', today);

  // Aggregate poin per siswa
  const pointsMap = {};
  (todayActs || []).forEach(row => {
    pointsMap[row.student_id] = (pointsMap[row.student_id] || 0) + row.points;
  });

  return (students || []).map(s => ({
    ...s,
    todayPoints: pointsMap[s.id] || 0,
  }));
}

/** Dapatkan detail lengkap seorang siswa termasuk aktivitas 7 hari */
async function getStudentFullDetail(studentId) {
  // Profile
  const { data: profile } = await db
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();

  // Aktivitas hari ini
  const todayActs = await getTodayActivities(studentId);
  const todayPoints = todayActs.reduce((s, a) => s + a.points, 0);

  // Aktivitas 7 hari terakhir (untuk chart)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = makeDateString(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

  const { data: weekActs } = await db
    .from('activities')
    .select('activity_date, points')
    .eq('student_id', studentId)
    .gte('activity_date', fromDate)
    .lte('activity_date', getTodayString());

  // Build 7-day chart data
  const weekData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = makeDateString(d.getFullYear(), d.getMonth(), d.getDate());
    const dayActs = (weekActs || []).filter(a => a.activity_date === ds);
    const pts = dayActs.reduce((s, a) => s + a.points, 0);
    weekData.push({ date: ds, points: pts });
  }

  // Streak
  const streak = await calculateStreak(studentId);

  // Badges
  const badges = await getStudentBadges(studentId);

  // Riwayat aktivitas terbaru (14 entri)
  const { data: recentActs } = await db
    .from('activities')
    .select('*')
    .eq('student_id', studentId)
    .order('activity_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(14);

  return {
    profile,
    todayPoints,
    todayActs,
    weekData,
    streak,
    badges,
    recentActs: recentActs || [],
  };
}

// ============================================================
// TEACHER — AGGREGATE STATS
// ============================================================

/** Statistik dashboard guru */
async function getTeacherDashboardStats(classFilter = '') {
  const students = await getAllStudentsWithTodayPoints(classFilter);
  const total    = students.length;
  const achieved = students.filter(s => s.todayPoints >= DAILY_TARGET).length;
  const partial  = students.filter(s => s.todayPoints > 0 && s.todayPoints < DAILY_TARGET).length;
  const inactive = students.filter(s => s.todayPoints === 0).length;
  const activePct = total ? Math.round((achieved / total) * 100) : 0;

  return { total, achieved, partial, inactive, activePct, students };
}

/** Rata-rata poin per hari selama 7 hari untuk grafik laporan */
async function getWeeklyAveragePoints(classFilter = '') {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = makeDateString(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

  // Ambil ID siswa berdasarkan filter kelas
  let studentQuery = db.from('profiles').select('id').eq('role', 'siswa');
  if (classFilter) studentQuery = studentQuery.eq('class_name', classFilter);
  const { data: students } = await studentQuery;
  if (!students || students.length === 0) return [];

  const studentIds = students.map(s => s.id);

  const { data: acts } = await db
    .from('activities')
    .select('activity_date, points, student_id')
    .in('student_id', studentIds)
    .gte('activity_date', fromDate)
    .lte('activity_date', getTodayString());

  // Build chart data
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = makeDateString(d.getFullYear(), d.getMonth(), d.getDate());
    const dayActs = (acts || []).filter(a => a.activity_date === ds);

    // Sum per student then average
    const studentPoints = {};
    dayActs.forEach(a => {
      studentPoints[a.student_id] = (studentPoints[a.student_id] || 0) + a.points;
    });
    const values = Object.values(studentPoints);
    const avg = values.length > 0
      ? Math.round(values.reduce((s, v) => s + v, 0) / students.length)
      : 0;

    const labels = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    result.push({ date: ds, avg, label: labels[d.getDay()] });
  }

  return result;
}

/** Aktivitas paling populer */
async function getMostPopularActivities(classFilter = '') {
  const today = getTodayString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = makeDateString(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

  let studentQuery = db.from('profiles').select('id').eq('role', 'siswa');
  if (classFilter) studentQuery = studentQuery.eq('class_name', classFilter);
  const { data: students } = await studentQuery;
  if (!students || students.length === 0) return [];

  const studentIds = students.map(s => s.id);

  const { data: acts } = await db
    .from('activities')
    .select('activity_type, activity_name')
    .in('student_id', studentIds)
    .gte('activity_date', fromDate)
    .lte('activity_date', today);

  const counts = {};
  const names = {};
  (acts || []).forEach(a => {
    counts[a.activity_type] = (counts[a.activity_type] || 0) + 1;
    names[a.activity_type] = a.activity_name;
  });

  return Object.entries(counts)
    .map(([type, count]) => ({ type, name: names[type], count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/** Siswa paling aktif (berdasarkan poin 7 hari) */
async function getTopStudents(classFilter = '', limit = 5) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const fromDate = makeDateString(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());

  let studentQuery = db.from('profiles').select('id, name, class_name, avatar_color').eq('role', 'siswa');
  if (classFilter) studentQuery = studentQuery.eq('class_name', classFilter);
  const { data: students } = await studentQuery;
  if (!students || students.length === 0) return [];

  const studentIds = students.map(s => s.id);

  const { data: acts } = await db
    .from('activities')
    .select('student_id, points')
    .in('student_id', studentIds)
    .gte('activity_date', fromDate)
    .lte('activity_date', getTodayString());

  const pointsMap = {};
  (acts || []).forEach(a => {
    pointsMap[a.student_id] = (pointsMap[a.student_id] || 0) + a.points;
  });

  return students
    .map(s => ({ ...s, totalPoints: pointsMap[s.id] || 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

/** Statistik ringkasan untuk laporan kelas */
async function getClassReportStats(classFilter = '') {
  const students = await getAllStudentsWithTodayPoints(classFilter);
  const avgToday = students.length
    ? Math.round(students.reduce((s, st) => s + st.todayPoints, 0) / students.length)
    : 0;
  const achievedPct = students.length
    ? Math.round(students.filter(s => s.todayPoints >= DAILY_TARGET).length / students.length * 100)
    : 0;

  return { avgToday, achievedPct };
}
