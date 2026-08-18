/**
 * KALENDER GERAK — Teacher Screens
 * Screen 7: Dashboard Guru, 8: Monitoring, 9: Detail Siswa, 10: Laporan
 */

// Chart instances (to destroy before re-creating)
let donutChartInst   = null;
let weeklyChartInst  = null;
let actBarChartInst  = null;
let weeklyDetailInst = null;

// ============================================================
// SCREEN 7: TEACHER DASHBOARD
// ============================================================
async function loadTeacherDashboard() {
  const user = getSession();
  if (!user) return;

  // Set teacher info
  const avatarEl = el('teacher-avatar');
  setAvatarEl(avatarEl, user.name, user.avatar_color);
  setText('teacher-name', user.name.replace(', S.Pd', ''));
  setText('teacher-today-date', formatDateShort(new Date()));

  try {
    const stats = await getTeacherDashboardStats();

    // Summary cards
    setText('tstat-total',    stats.total);
    setText('tstat-achieved', stats.achieved);
    setText('tstat-partial',  stats.partial);
    setText('tstat-inactive', stats.inactive);

    // Donut chart
    renderDonutChart(stats);

    // Donut center %
    setText('donut-pct', `${stats.activePct}%`);

  } catch (err) {
    console.error('Teacher dashboard error:', err);
    showToast('Gagal memuat data. Periksa koneksi internet.', 'error');
  }

  // Quick nav buttons
  const btnMon = el('btn-monitoring');
  const btnRep = el('btn-report');
  if (btnMon) btnMon.addEventListener('click', () => App.navigate('teacher-monitoring'));
  if (btnRep) btnRep.addEventListener('click', () => App.navigate('teacher-report'));
}

function renderDonutChart(stats) {
  const canvas = el('donut-chart');
  if (!canvas) return;

  if (donutChartInst) { donutChartInst.destroy(); donutChartInst = null; }

  donutChartInst = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Target Tercapai', 'Sebagian', 'Belum Aktif'],
      datasets: [{
        data: [stats.achieved, stats.partial, stats.inactive],
        backgroundColor: ['#43A047', '#FF9800', '#EF5350'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} siswa`,
          },
        },
      },
      animation: { animateRotate: true, duration: 800 },
    },
  });
}

// ============================================================
// SCREEN 8: MONITORING SISWA
// ============================================================
let allStudentsCache = [];

async function loadMonitoringScreen() {
  try {
    allStudentsCache = await getAllStudentsWithTodayPoints();
    renderMonitoringList(allStudentsCache);
  } catch (err) {
    console.error('Monitoring load error:', err);
    el('monitoring-list').innerHTML = '<p style="text-align:center;color:var(--danger);padding:24px">Gagal memuat data siswa.</p>';
  }

  // Filters
  const filterClass  = el('filter-class');
  const filterStatus = el('filter-status');
  const searchInput  = el('search-student');

  const applyFilters = debounce(() => {
    let filtered = allStudentsCache;

    if (filterClass?.value)  filtered = filtered.filter(s => s.class_name === filterClass.value);
    if (filterStatus?.value) {
      filtered = filtered.filter(s => {
        if (filterStatus.value === 'achieved') return s.todayPoints >= DAILY_TARGET;
        if (filterStatus.value === 'partial')  return s.todayPoints > 0 && s.todayPoints < DAILY_TARGET;
        if (filterStatus.value === 'inactive') return s.todayPoints === 0;
        return true;
      });
    }
    if (searchInput?.value.trim()) {
      const q = searchInput.value.trim().toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q));
    }

    renderMonitoringList(filtered);
  }, 200);

  filterClass?.addEventListener('change', applyFilters);
  filterStatus?.addEventListener('change', applyFilters);
  searchInput?.addEventListener('input', applyFilters);
}

function renderMonitoringList(students) {
  const container = el('monitoring-list');
  const countEl   = el('monitoring-count');
  if (!container) return;

  if (countEl) countEl.textContent = students.length;

  if (!students.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>Tidak ada siswa yang cocok dengan filter.</p>
      </div>`;
    return;
  }

  container.innerHTML = students.map(s => {
    const status = getStatusLabel(s.todayPoints);
    const pct    = Math.min((s.todayPoints / DAILY_TARGET) * 100, 100);
    const color  = getProgressColor(s.todayPoints);
    const initials = s.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

    return `
      <div class="monitoring-student-card" data-student-id="${s.id}" role="button" tabindex="0"
           aria-label="Lihat detail ${s.name}">
        <div class="avatar" style="background:${s.avatar_color || '#43A047'};width:44px;height:44px;font-size:16px;flex-shrink:0">
          ${initials}
        </div>
        <div class="monitoring-student-info">
          <div class="monitoring-student-name">${s.name}</div>
          <div class="monitoring-student-class">Kelas ${s.class_name}</div>
        </div>
        <div class="monitoring-student-right">
          <span class="monitoring-points" style="color:${color}">${s.todayPoints}/${DAILY_TARGET}</span>
          <div class="monitoring-pbar">
            <div class="monitoring-pbar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="badge ${status.class}">${status.label}</span>
        </div>
      </div>`;
  }).join('');

  // Click to detail
  container.querySelectorAll('.monitoring-student-card').forEach(card => {
    const handler = () => App.navigate('teacher-student-detail', { studentId: card.dataset.studentId });
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });
}

// ============================================================
// SCREEN 9: DETAIL SISWA (GURU)
// ============================================================
async function loadStudentDetail(studentId) {
  const container = el('student-detail-content');
  if (!container) return;

  container.innerHTML = `<div class="loading-placeholder" style="padding:48px">Memuat data siswa...</div>`;

  const btnBack = el('btn-back-detail');
  if (btnBack) btnBack.addEventListener('click', () => App.navigate('teacher-monitoring'));

  try {
    const detail = await getStudentFullDetail(studentId);
    const { profile, todayPoints, weekData, streak, badges, recentActs } = detail;
    const status = getStatusLabel(todayPoints);

    container.innerHTML = `
      <!-- Profile Header -->
      <div class="detail-profile-header">
        <div class="avatar avatar-xl" style="background:${profile.avatar_color || '#43A047'}">
          ${profile.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
        </div>
        <h3 class="detail-name">${profile.name}</h3>
        <p class="detail-info">Kelas ${profile.class_name} • NIS: ${profile.nis_nip}</p>
        <span class="badge ${status.class}" style="margin-top:8px">${status.label}</span>
      </div>

      <!-- Stats -->
      <div class="detail-stats-row">
        <div class="detail-stat">
          <div class="detail-stat-val" style="color:var(--primary)">${todayPoints}</div>
          <div class="detail-stat-lbl">Poin Hari Ini</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-val" style="color:var(--warning)">${streak}</div>
          <div class="detail-stat-lbl">Hari Streak 🔥</div>
        </div>
        <div class="detail-stat">
          <div class="detail-stat-val" style="color:var(--blue-dark)">${badges.length}</div>
          <div class="detail-stat-lbl">Badge 🏅</div>
        </div>
      </div>

      <!-- Weekly Chart -->
      <div class="chart-card" style="margin-bottom:var(--space-md)">
        <h3 class="section-title">Aktivitas 7 Hari Terakhir</h3>
        <canvas id="weekly-detail-chart" height="180"></canvas>
      </div>

      <!-- Activity History -->
      <div class="section-card" style="margin-bottom:var(--space-md)">
        <h3 class="section-title">Riwayat Aktivitas Terbaru</h3>
        <div id="detail-activity-list">
          ${recentActs.length === 0
            ? `<div class="empty-state"><div class="empty-icon">📋</div><p>Belum ada aktivitas tercatat.</p></div>`
            : recentActs.map(a => {
                const info = getActivity(a.activity_type);
                return `
                  <div class="activity-item-today" style="margin-bottom:8px">
                    <div class="activity-icon-wrap" style="background:${info.bgColor}">${info.emoji}</div>
                    <div class="activity-info">
                      <div class="activity-info-name">${a.activity_name}</div>
                      <div class="activity-info-detail">${formatDateShort(a.activity_date)} • ${a.duration_minutes} menit</div>
                    </div>
                    <div class="activity-pts">+${a.points}</div>
                  </div>`;
              }).join('')
          }
        </div>
      </div>

      <!-- Recommendations for teacher -->
      ${todayPoints < DAILY_TARGET ? `
        <div class="recommendations-card" style="margin-bottom:var(--space-md)">
          <div class="recommendations-title">💡 Rekomendasi untuk Guru:</div>
          <div class="recommendation-item">
            <span>📢</span>
            <span>Dorong ${profile.name.split(' ')[0]} untuk ${DAILY_TARGET - todayPoints} poin lagi hari ini.</span>
          </div>
          ${getRecommendations(DAILY_TARGET - todayPoints).map(r => `
            <div class="recommendation-item">
              <span>${r.emoji}</span>
              <span>Sarankan: ${r.name} ${r.duration} menit (+${r.points} poin)</span>
            </div>`).join('')}
        </div>` : ''}
    `;

    // Render weekly chart
    renderWeeklyDetailChart(weekData);

  } catch (err) {
    console.error('Student detail error:', err);
    container.innerHTML = `<p style="text-align:center;color:var(--danger);padding:48px">Gagal memuat detail siswa.</p>`;
  }
}

function renderWeeklyDetailChart(weekData) {
  const canvas = el('weekly-detail-chart');
  if (!canvas) return;
  if (weeklyDetailInst) { weeklyDetailInst.destroy(); weeklyDetailInst = null; }

  const labels = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const dayLabels = weekData.map(d => {
    const day = new Date(d.date + 'T00:00:00');
    return labels[day.getDay()];
  });

  weeklyDetailInst = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: dayLabels,
      datasets: [{
        label: 'Poin',
        data: weekData.map(d => d.points),
        backgroundColor: weekData.map(d =>
          d.points >= DAILY_TARGET ? '#43A047' : d.points > 0 ? '#FF9800' : '#E0E0E0'
        ),
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} poin` } },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(80, Math.max(...weekData.map(d => d.points)) + 10),
          grid: { color: '#f0f0f0' },
          ticks: { font: { family: 'Nunito', weight: '700' } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Nunito', weight: '700' } },
        },
      },
      animation: { duration: 600 },
    },
  });
}

// ============================================================
// SCREEN 10: LAPORAN KELAS
// ============================================================
async function loadReportScreen() {
  const filterEl = el('report-class-filter');

  await renderReport('');

  filterEl?.addEventListener('change', () => renderReport(filterEl.value));

  // Print
  el('btn-print')?.addEventListener('click', () => window.print());

  // Download PDF (simulation)
  el('btn-download')?.addEventListener('click', () => {
    showToast('Mempersiapkan unduhan PDF...', 'info');
    setTimeout(() => {
      showToast('PDF berhasil diunduh! (Simulasi)', 'success');
    }, 1500);
  });
}

async function renderReport(classFilter) {
  try {
    const [stats, weeklyData, topStudents, popularActs] = await Promise.all([
      getClassReportStats(classFilter),
      getWeeklyAveragePoints(classFilter),
      getTopStudents(classFilter, 5),
      getMostPopularActivities(classFilter),
    ]);

    // Summary cards
    setText('report-avg', stats.avgToday);
    setText('report-pct', `${stats.achievedPct}%`);

    // Weekly chart
    renderWeeklyChart(weeklyData);

    // Top students
    renderTopStudents(topStudents);

    // Popular activities chart
    renderActivityBarChart(popularActs);

  } catch (err) {
    console.error('Report load error:', err);
    showToast('Gagal memuat laporan.', 'error');
  }
}

function renderWeeklyChart(weeklyData) {
  const canvas = el('weekly-chart');
  if (!canvas) return;
  if (weeklyChartInst) { weeklyChartInst.destroy(); weeklyChartInst = null; }

  weeklyChartInst = new Chart(canvas, {
    type: 'line',
    data: {
      labels: weeklyData.map(d => d.label),
      datasets: [{
        label: 'Rata-rata Poin',
        data: weeklyData.map(d => d.avg),
        borderColor: '#43A047',
        backgroundColor: 'rgba(67,160,71,0.12)',
        borderWidth: 3,
        pointBackgroundColor: '#43A047',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} poin rata-rata` } },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 80,
          grid: { color: '#f0f0f0' },
          ticks: { font: { family: 'Nunito', weight: '700' } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Nunito', weight: '700' } },
        },
      },
      animation: { duration: 800 },
    },
  });
}

function renderTopStudents(students) {
  const container = el('report-top-students');
  if (!container) return;

  if (!students.length) {
    container.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:16px;font-weight:600">Belum ada data.</p>`;
    return;
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  container.innerHTML = students.map((s, i) => {
    const initials = s.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
    return `
      <div class="activity-item-today" style="margin-bottom:8px">
        <span style="font-size:24px;min-width:32px">${medals[i]}</span>
        <div class="avatar" style="background:${s.avatar_color};width:36px;height:36px;font-size:13px;flex-shrink:0">
          ${initials}
        </div>
        <div class="activity-info">
          <div class="activity-info-name">${s.name.split(' ').slice(0,2).join(' ')}</div>
          <div class="activity-info-detail">Kelas ${s.class_name}</div>
        </div>
        <div class="activity-pts" style="color:var(--primary)">${s.totalPoints} poin</div>
      </div>`;
  }).join('');
}

function renderActivityBarChart(activities) {
  const canvas = el('activity-bar-chart');
  if (!canvas) return;
  if (actBarChartInst) { actBarChartInst.destroy(); actBarChartInst = null; }

  const colors = ['#43A047','#FF9800','#29B6F6','#EC407A','#AB47BC'];

  actBarChartInst = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: activities.map(a => a.name),
      datasets: [{
        label: 'Jumlah Dilakukan',
        data: activities.map(a => a.count),
        backgroundColor: activities.map((_, i) => colors[i % colors.length]),
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}x dilakukan` } },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { family: 'Nunito', weight: '700' } },
          grid: { color: '#f0f0f0' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Nunito', weight: '700', size: 11 } },
        },
      },
      animation: { duration: 600 },
    },
  });
}

// ============================================================
// TEACHER PROFILE
// ============================================================
function loadTeacherProfile() {
  const user = getSession();
  if (!user) return;

  const avatarEl = el('teacher-profile-avatar');
  setAvatarEl(avatarEl, user.name, user.avatar_color);
  setText('teacher-profile-name', user.name);
  setText('teacher-profile-school', user.school_name || SCHOOL_NAME);
  setText('teacher-profile-nip', user.nis_nip);
}
