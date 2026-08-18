/**
 * KALENDER GERAK — Student Screens
 * Screen 3: Dashboard, 4: Activities, 5: Result, 6: History, Profile
 */

// ============================================================
// SCREEN 3: STUDENT DASHBOARD
// ============================================================
async function loadStudentDashboard() {
  const user = getSession();
  if (!user) return;

  // Set profile info
  const avatarEl = el('student-avatar');
  setAvatarEl(avatarEl, user.name, user.avatar_color);
  setText('student-name', user.name.split(',')[0]);
  setText('student-class', `Kelas ${user.class_name || '-'} • ${SCHOOL_NAME}`);
  setText('today-date', formatDateID(new Date()));

  try {
    // Load today's data
    const [todayActs, streak, badges] = await Promise.all([
      getTodayActivities(user.id),
      calculateStreak(user.id),
      getStudentBadges(user.id),
    ]);

    const todayPoints = todayActs.reduce((s, a) => s + a.points, 0);

    // Update progress ring with animation
    setTimeout(() => updateProgressRing(todayPoints), 300);

    // Update streak
    setText('streak-count', streak);

    // Update stats
    setText('stat-activities', todayActs.length);
    setText('stat-points', todayPoints);
    setText('stat-badges', badges.length);

    // Update profile stats too
    setText('pstat-streak', streak);
    setText('pstat-total', badges.length);
    setText('pstat-badges', badges.length);

    // Render today's activity list
    renderTodayActivities(todayActs);

  } catch (err) {
    console.error('Dashboard load error:', err);
    showToast('Gagal memuat data. Periksa koneksi internet.', 'error');
  }
}

function renderTodayActivities(activities) {
  const container = el('today-activity-list');
  if (!container) return;

  if (!activities.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏃</div>
        <p>Belum ada aktivitas hari ini.<br/>Ayo mulai bergerak!</p>
      </div>`;
    return;
  }

  container.innerHTML = activities.map(act => {
    const info = getActivity(act.activity_type);
    return `
      <div class="activity-item-today">
        <div class="activity-icon-wrap" style="background:${info.bgColor}">
          <span style="font-size:24px">${info.emoji}</span>
        </div>
        <div class="activity-info">
          <div class="activity-info-name">${act.activity_name}</div>
          <div class="activity-info-detail">${act.duration_minutes} menit</div>
        </div>
        <div class="activity-pts">+${act.points}</div>
      </div>`;
  }).join('');
}

function initStudentDashboardButtons() {
  const btnAdd  = el('btn-add-activity');
  const btnHist = el('btn-view-history');

  if (btnAdd) {
    btnAdd.addEventListener('click', () => App.navigate('student-activities'));
  }
  if (btnHist) {
    btnHist.addEventListener('click', () => App.navigate('student-history'));
  }
}

// ============================================================
// SCREEN 4: PICK ACTIVITY
// ============================================================
async function loadActivitiesScreen() {
  const user = getSession();
  if (!user) return;

  // Render activity grid
  const grid = el('activities-grid');
  if (!grid) return;

  grid.innerHTML = ACTIVITIES.map(act => `
    <div class="activity-card" data-activity-id="${act.id}">
      <div class="activity-card-badge">+<span class="pts-preview" data-id="${act.id}">15</span> Poin</div>
      <div class="activity-card-icon">${act.emoji}</div>
      <div class="activity-card-name">${act.name}</div>
      <div class="activity-card-duration">
        <select class="duration-select" data-id="${act.id}" aria-label="Durasi ${act.name}">
          <option value="15">15 menit</option>
          <option value="30" selected>30 menit</option>
          <option value="45">45 menit</option>
          <option value="60">60 menit</option>
        </select>
      </div>
      <div class="activity-card-points" id="pts-${act.id}">
        ${calculatePoints(act.id, 30)} Poin
      </div>
      <button class="activity-card-btn" data-activity-id="${act.id}">
        + Tambah
      </button>
    </div>
  `).join('');

  // Initialize point previews
  grid.querySelectorAll('.duration-select').forEach(select => {
    updatePointsPreview(select);
    select.addEventListener('change', () => updatePointsPreview(select));
  });

  // Add activity buttons
  grid.querySelectorAll('.activity-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const actId = btn.dataset.activityId;
      const card = btn.closest('.activity-card');
      const select = card.querySelector('.duration-select');
      handleAddActivity(actId, parseInt(select.value));
    });
  });

  // Load and show current progress
  await updateActivityProgressBar();

  // Back button
  const btnBack = el('btn-back-activities');
  if (btnBack) {
    btnBack.addEventListener('click', () => App.navigate('student-dashboard'));
  }
}

function updatePointsPreview(select) {
  const actId = select.dataset.id;
  const duration = parseInt(select.value);
  const pts = calculatePoints(actId, duration);

  const ptsEl = el(`pts-${actId}`);
  if (ptsEl) ptsEl.textContent = `${pts} Poin`;

  const preview = select.closest('.activity-card').querySelector('.pts-preview');
  if (preview) preview.textContent = pts;
}

async function updateActivityProgressBar() {
  const user = getSession();
  if (!user) return;

  try {
    const points = await getTodayPoints(user.id);
    const pct = Math.min((points / DAILY_TARGET) * 100, 100);

    const ptsLabel = el('activity-current-points');
    const pbar = el('activity-progress-bar');

    if (ptsLabel) ptsLabel.textContent = `${points}/${DAILY_TARGET}`;
    if (pbar) pbar.style.width = `${pct}%`;
  } catch (err) {
    console.error(err);
  }
}

async function handleAddActivity(activityId, durationMinutes) {
  const user = getSession();
  if (!user) return;

  const act = getActivity(activityId);
  const points = calculatePoints(activityId, durationMinutes);

  try {
    await addActivity({
      studentId: user.id,
      activityType: activityId,
      activityName: act.name,
      durationMinutes,
      points,
    });

    showToast(`+${points} poin! ${act.emoji} ${act.name} berhasil ditambahkan!`, 'success');

    // Update progress bar
    await updateActivityProgressBar();

    // Check for badges and navigate to result
    const totalPoints = await getTodayPoints(user.id);
    const streak = await calculateStreak(user.id);
    const newBadges = await checkAndAwardBadges(user.id, totalPoints, streak);

    // Navigate to result screen
    App.navigate('student-result', { points: totalPoints, newBadges, streak });

  } catch (err) {
    console.error('Add activity error:', err);
    showToast('Gagal menambahkan aktivitas. Coba lagi.', 'error');
  }
}

// ============================================================
// SCREEN 5: EVALUATION RESULT
// ============================================================
function loadResultScreen(params = {}) {
  const { points = 0, newBadges = [], streak = 0 } = params;
  const container = el('result-content');
  if (!container) return;

  const achieved = points >= DAILY_TARGET;

  if (achieved) {
    // SUCCESS!
    launchConfetti();

    const badgesHTML = newBadges.length > 0
      ? `<div class="badges-showcase">
          ${newBadges.map((b, i) => `
            <div class="badge-item" style="animation-delay:${i * 0.15}s">
              <div class="badge-emoji-lg">${b.badge_emoji}</div>
              <div class="badge-name">${b.badge_name}</div>
            </div>`).join('')}
         </div>`
      : `<div class="badges-showcase">
          <div class="badge-item">
            <div class="badge-emoji-lg">🏅</div>
            <div class="badge-name">Target Tercapai!</div>
          </div>
         </div>`;

    container.innerHTML = `
      <div class="result-complete">
        <div class="result-icon animate-pop">🎉</div>
        <h2 class="result-title animate-slide-up">Selamat!</h2>
        <p class="result-subtitle animate-slide-up delay-1">
          Kebutuhan gerakmu hari ini sudah terpenuhi!
        </p>

        <div class="result-progress animate-slide-up delay-1" style="background:var(--primary-bg);border-radius:var(--radius);padding:var(--space-lg);margin-bottom:var(--space-lg)">
          <div style="font-size:48px;font-weight:900;color:var(--primary)">${points}</div>
          <div style="color:var(--text-muted);font-weight:700">dari ${DAILY_TARGET} poin target harian</div>
          ${streak >= 2 ? `<div style="margin-top:8px;color:var(--warning);font-weight:700">🔥 Streak ${streak} hari berturut-turut!</div>` : ''}
        </div>

        ${newBadges.length > 0 ? `
          <h3 style="font-weight:800;margin-bottom:var(--space-md);color:var(--primary-dark)">
            🏆 Badge Baru Didapat!
          </h3>` : ''}
        ${badgesHTML}

        <img src="assets/images/kagi.jpg" alt="Kagi" style="width:100px;height:100px;border-radius:50%;object-fit:contain;margin:var(--space-md) auto" />

        <button class="btn btn-primary btn-lg btn-block animate-slide-up delay-2"
          onclick="App.navigate('student-dashboard')">
          🏠 Kembali ke Dashboard
        </button>
        <button class="btn btn-outline btn-block"
          onclick="App.navigate('student-activities')">
          + Tambah Aktivitas Lagi
        </button>
      </div>`;

  } else {
    // NOT YET ACHIEVED
    const remaining = DAILY_TARGET - points;
    const pct = Math.round((points / DAILY_TARGET) * 100);

    // Smart recommendations based on remaining points
    const recs = getRecommendations(remaining);

    container.innerHTML = `
      <div class="result-incomplete">
        <div class="result-icon animate-pop">${points > 0 ? '💪' : '⚠️'}</div>
        <h2 class="result-title animate-slide-up">
          ${points > 0 ? 'Hampir Sampai!' : 'Ayo Bergerak!'}
        </h2>
        <p class="result-subtitle animate-slide-up delay-1">
          Kebutuhan gerakmu belum terpenuhi hari ini.
        </p>

        <div class="result-progress animate-slide-up delay-1">
          <div class="result-pbar-wrap">
            <div class="result-pbar-fill" id="res-pbar" style="width:0%"></div>
          </div>
          <div class="result-pbar-label">${points} / ${DAILY_TARGET} Poin</div>
          <div style="color:var(--text-muted);font-size:14px;font-weight:600;margin-top:4px">
            Perlu <strong>${remaining} poin</strong> lagi
          </div>
        </div>

        <div class="recommendations-card animate-slide-up delay-2">
          <div class="recommendations-title">💡 Rekomendasi Aktivitas:</div>
          ${recs.map(r => `
            <div class="recommendation-item">
              <span>${r.emoji}</span>
              <span>${r.name} — ${r.duration} menit (${r.points} poin)</span>
            </div>`).join('')}
        </div>

        <button class="btn btn-primary btn-lg btn-block animate-slide-up delay-3"
          onclick="App.navigate('student-activities')">
          🏃 Lakukan Aktivitas Lagi
        </button>
        <button class="btn btn-outline btn-block"
          onclick="App.navigate('student-dashboard')">
          Kembali ke Dashboard
        </button>
      </div>`;

    // Animate progress bar
    setTimeout(() => {
      const pbar = el('res-pbar');
      if (pbar) pbar.style.width = `${pct}%`;
    }, 300);
  }
}

/** Buat rekomendasi aktivitas berdasarkan poin yang masih dibutuhkan */
function getRecommendations(remaining) {
  const recs = [];
  let need = remaining;

  // Pilih kombinasi aktivitas yang cocok
  const options = [
    { id: 'lompat_tali', duration: 30 },
    { id: 'lari',        duration: 20 },
    { id: 'bulu_tangkis',duration: 30 },
    { id: 'jalan_kaki',  duration: 30 },
    { id: 'senam',       duration: 30 },
    { id: 'lompat_tali', duration: 15 },
    { id: 'jalan_kaki',  duration: 15 },
  ];

  for (const opt of options) {
    if (recs.length >= 3) break;
    const pts = calculatePoints(opt.id, opt.duration);
    const act = getActivity(opt.id);
    recs.push({ ...act, duration: opt.duration, points: pts });
    need -= pts;
    if (need <= 0) break;
  }

  return recs.slice(0, 3);
}

// ============================================================
// SCREEN 6: HISTORY
// ============================================================
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();
let calData  = {}; // { 'YYYY-MM-DD': totalPoints }

async function loadHistoryScreen() {
  const user = getSession();
  if (!user) return;

  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth();

  await renderCalendar(user.id);

  // Nav buttons
  const btnPrev = el('cal-prev');
  const btnNext = el('cal-next');

  if (btnPrev) {
    btnPrev.addEventListener('click', async () => {
      calMonth--;
      if (calMonth < 0) { calMonth = 11; calYear--; }
      await renderCalendar(user.id);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', async () => {
      calMonth++;
      if (calMonth > 11) { calMonth = 0; calYear++; }
      await renderCalendar(user.id);
    });
  }
}

async function renderCalendar(studentId) {
  setText('cal-month-label', formatMonthYear(calYear, calMonth));

  try {
    calData = await getMonthActivities(studentId, calYear, calMonth);
  } catch {
    calData = {};
  }

  const grid = el('calendar-grid');
  if (!grid) return;

  const today = getTodayString();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = makeDateString(calYear, calMonth, d);
    const pts = calData[dateStr] || 0;
    const isToday = dateStr === today;
    const isPast = dateStr < today;

    let cls = 'cal-day';
    if (isToday) cls += ' today';

    if (pts >= DAILY_TARGET) {
      cls += ' achieved';
    } else if (pts > 0) {
      cls += ' partial';
    } else if (isPast && !isToday) {
      cls += ' inactive-past';
    }

    html += `<div class="${cls}" data-date="${dateStr}" data-pts="${pts}" title="${pts} poin">${d}</div>`;
  }

  grid.innerHTML = html;

  // Click handlers for day detail
  grid.querySelectorAll('.cal-day:not(.empty)').forEach(dayEl => {
    dayEl.addEventListener('click', async () => {
      const dateStr = dayEl.dataset.date;

      // Deselect previous
      grid.querySelectorAll('.cal-day.selected').forEach(e => e.classList.remove('selected'));
      dayEl.classList.add('selected');

      await showDayDetail(getSession()?.id, dateStr);
    });
  });

  // Update month summary
  updateMonthSummary();
}

async function showDayDetail(studentId, dateStr) {
  const detailEl = el('history-day-detail');
  const titleEl  = el('history-day-title');
  const actsEl   = el('history-day-activities');

  if (!detailEl || !titleEl || !actsEl) return;

  detailEl.classList.remove('hidden');
  titleEl.textContent = formatDateShort(dateStr);

  try {
    const acts = await getDayActivities(studentId, dateStr);

    if (!acts.length) {
      actsEl.innerHTML = `
        <div class="empty-state" style="padding:var(--space-md)">
          <div class="empty-icon">😴</div>
          <p>Tidak ada aktivitas tercatat.</p>
        </div>`;
      return;
    }

    const totalPts = acts.reduce((s, a) => s + a.points, 0);
    actsEl.innerHTML = `
      ${acts.map(act => {
        const info = getActivity(act.activity_type);
        return `
          <div class="activity-item-today">
            <div class="activity-icon-wrap" style="background:${info.bgColor}">${info.emoji}</div>
            <div class="activity-info">
              <div class="activity-info-name">${act.activity_name}</div>
              <div class="activity-info-detail">${act.duration_minutes} menit</div>
            </div>
            <div class="activity-pts">+${act.points}</div>
          </div>`;
      }).join('')}
      <div style="padding-top:var(--space-sm);font-weight:800;font-size:14px;color:${totalPts >= DAILY_TARGET ? 'var(--primary)' : 'var(--warning)'}">
        Total: ${totalPts} poin ${totalPts >= DAILY_TARGET ? '✅' : ''}
      </div>`;
  } catch (err) {
    actsEl.innerHTML = '<p style="color:var(--text-muted)">Gagal memuat detail.</p>';
  }
}

function updateMonthSummary() {
  const entries = Object.entries(calData);
  const activeDays  = entries.filter(([, pts]) => pts > 0).length;
  const totalPoints = entries.reduce((s, [, pts]) => s + pts, 0);

  // Calculate streak for this month
  const achievedDays = new Set(entries.filter(([, pts]) => pts >= DAILY_TARGET).map(([d]) => d));
  let maxStreak = 0, curStreak = 0;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = makeDateString(calYear, calMonth, d);
    if (achievedDays.has(ds)) {
      curStreak++;
      maxStreak = Math.max(maxStreak, curStreak);
    } else {
      curStreak = 0;
    }
  }

  setText('month-streak',       `${maxStreak} Hari`);
  setText('month-active-days',  `${activeDays} Hari`);
  setText('month-total-points', `${totalPoints} Poin`);
}

// ============================================================
// STUDENT PROFILE SCREEN
// ============================================================
async function loadStudentProfile() {
  const user = getSession();
  if (!user) return;

  const avatarEl = el('profile-avatar');
  setAvatarEl(avatarEl, user.name, user.avatar_color);
  setText('profile-name', user.name);
  setText('profile-class', `Kelas ${user.class_name || '-'}`);
  setText('profile-school', SCHOOL_NAME);

  try {
    const [streak, badges] = await Promise.all([
      calculateStreak(user.id),
      getStudentBadges(user.id),
    ]);

    const todayPts = await getTodayPoints(user.id);
    setText('pstat-streak', streak);
    setText('pstat-total',  todayPts);
    setText('pstat-badges', badges.length);

    // Render badges grid
    const badgesGrid = el('profile-badges-grid');
    if (badgesGrid) {
      if (!badges.length) {
        badgesGrid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:var(--space-lg);color:var(--text-muted)">
            <div style="font-size:36px;margin-bottom:8px">🏅</div>
            <p style="font-weight:600;font-size:14px">Belum ada badge.<br>Terus bergerak untuk mendapatkan badge!</p>
          </div>`;
      } else {
        badgesGrid.innerHTML = badges.map(b => `
          <div class="badge-grid-item">
            <div class="badge-grid-emoji">${b.badge_emoji}</div>
            <div class="badge-grid-name">${b.badge_name}</div>
          </div>`).join('');
      }
    }
  } catch (err) {
    console.error('Profile load error:', err);
  }
}
