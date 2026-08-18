/**
 * KALENDER GERAK — Utility Functions
 */

// ============================================================
// DATE & TIME
// ============================================================

/** Format tanggal ke bahasa Indonesia */
function formatDateID(date) {
  const d = date instanceof Date ? date : new Date(date);
  const days   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format singkat tanggal: "18 Agu 2026" */
function formatDateShort(date) {
  const d = date instanceof Date ? date : new Date(date);
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun',
                  'Jul','Agu','Sep','Okt','Nov','Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format nama bulan */
function formatMonthYear(year, month) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];
  return `${months[month]} ${year}`;
}

/** Dapatkan tanggal hari ini sebagai string YYYY-MM-DD */
function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

/** Buat date string dari tahun, bulan (0-indexed), hari */
function makeDateString(year, month, day) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

/** Hitung berapa hari antara dua tanggal */
function daysBetween(d1, d2) {
  const t1 = new Date(d1).setHours(0,0,0,0);
  const t2 = new Date(d2).setHours(0,0,0,0);
  return Math.round((t2 - t1) / 86400000);
}

// ============================================================
// ACTIVITIES DATA
// ============================================================
const ACTIVITIES = [
  {
    id: 'jalan_kaki',
    name: 'Jalan Kaki',
    emoji: '🚶',
    color: '#66BB6A',
    bgColor: '#E8F5E9',
    ptsPerMin: 10/15, // 10 poin per 15 menit
  },
  {
    id: 'lari',
    name: 'Lari',
    emoji: '🏃',
    color: '#EF5350',
    bgColor: '#FFEBEE',
    ptsPerMin: 15/15,
  },
  {
    id: 'sepak_bola',
    name: 'Sepak Bola',
    emoji: '⚽',
    color: '#5C6BC0',
    bgColor: '#E8EAF6',
    ptsPerMin: 20/15,
  },
  {
    id: 'bersepeda',
    name: 'Bersepeda',
    emoji: '🚴',
    color: '#43A047',
    bgColor: '#E8F5E9',
    ptsPerMin: 15/15,
  },
  {
    id: 'bulu_tangkis',
    name: 'Bulu Tangkis',
    emoji: '🏸',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    ptsPerMin: 15/15,
  },
  {
    id: 'senam',
    name: 'Senam',
    emoji: '🤸',
    color: '#EC407A',
    bgColor: '#FCE4EC',
    ptsPerMin: 12/15,
  },
  {
    id: 'lompat_tali',
    name: 'Lompat Tali',
    emoji: '🪢',
    color: '#AB47BC',
    bgColor: '#F3E5F5',
    ptsPerMin: 20/15,
  },
  {
    id: 'berenang',
    name: 'Berenang',
    emoji: '🏊',
    color: '#29B6F6',
    bgColor: '#E1F5FE',
    ptsPerMin: 25/15,
  },
];

/** Hitung poin berdasarkan aktivitas dan durasi */
function calculatePoints(activityId, durationMinutes) {
  const act = ACTIVITIES.find(a => a.id === activityId);
  if (!act) return 0;
  return Math.round(act.ptsPerMin * durationMinutes);
}

/** Dapatkan data aktivitas berdasarkan ID */
function getActivity(id) {
  return ACTIVITIES.find(a => a.id === id) || {
    name: id, emoji: '🏋️', color: '#999', bgColor: '#f5f5f5'
  };
}

// ============================================================
// BADGES
// ============================================================
const BADGE_DEFS = {
  anak_aktif:    { name: 'Anak Aktif',    emoji: '🏃', desc: 'Pertama kali mencapai target harian!' },
  bintang_gerak: { name: 'Bintang Gerak', emoji: '⭐', desc: '3 hari berturut-turut aktif!' },
  juara_hari:    { name: 'Juara Hari Ini',emoji: '🏆', desc: 'Poin hari ini ≥ 80!' },
  streak_7:      { name: 'Semangat 7',    emoji: '🔥', desc: '7 hari berturut-turut aktif!' },
  super_aktif:   { name: 'Super Aktif',   emoji: '💪', desc: 'Sudah mengumpulkan 300 poin!' },
};

// ============================================================
// DOM HELPERS
// ============================================================

function el(id) {
  return document.getElementById(id);
}

function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function showEl(id) {
  const e = el(id);
  if (e) e.classList.remove('hidden');
}

function hideEl(id) {
  const e = el(id);
  if (e) e.classList.add('hidden');
}

function setHTML(id, html) {
  const e = el(id);
  if (e) e.innerHTML = html;
}

function setText(id, text) {
  const e = el(id);
  if (e) e.textContent = text;
}

/** Buat avatar inisial dengan warna */
function renderAvatar(name, color, size = 'avatar-lg') {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  return `<div class="avatar ${size}" style="background:${color}">${initials}</div>`;
}

/** Set konten avatar element */
function setAvatarEl(element, name, color) {
  if (!element) return;
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
  element.textContent = initials;
  element.style.background = color || '#43A047';
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
let toastTimeout = null;

function showToast(message, type = 'success', duration = 3000) {
  const toast = el('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast toast-${type} show`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================================
// CONFETTI
// ============================================================
function launchConfetti(count = 60) {
  const container = el('confetti-container');
  if (!container) return;
  container.innerHTML = '';

  const colors = ['#43A047','#FF9800','#29B6F6','#EC407A','#AB47BC','#FFD600','#EF5350'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 1}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// ============================================================
// PROGRESS RING UPDATER
// ============================================================
function updateProgressRing(points, target = 60) {
  const ring = el('progress-ring-fill');
  const pointsEl = el('progress-points');
  const statusMsg = el('status-message');
  const statusEmoji = el('status-emoji');
  const statusText = el('status-text');
  const mascotMsg = el('mascot-message');

  if (!ring) return;

  const pct = Math.min(points / target, 1);
  const circumference = 2 * Math.PI * 90; // r=90
  const offset = circumference * (1 - pct);

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;

  // Update ring color based on progress
  if (pct >= 1) {
    ring.style.stroke = '#43A047';
  } else if (pct >= 0.5) {
    ring.style.stroke = '#FF9800';
  } else {
    ring.style.stroke = '#66BB6A';
  }

  if (pointsEl) pointsEl.textContent = points;

  // Status message
  if (statusMsg) {
    if (points >= target) {
      statusMsg.className = 'status-message status-complete';
      if (statusEmoji) statusEmoji.textContent = '🎉';
      if (statusText) statusText.textContent = 'Kebutuhan gerakmu sudah terpenuhi!';
      if (mascotMsg) mascotMsg.textContent = `Luar biasa! Kamu sudah mencapai ${points} poin hari ini! 🎉`;
    } else {
      statusMsg.className = 'status-message status-incomplete';
      const remaining = target - points;
      if (statusEmoji) statusEmoji.textContent = points > 0 ? '💪' : '⚠️';
      if (statusText) statusText.textContent = points > 0
        ? `Masih butuh ${remaining} poin lagi. Ayo terus!`
        : 'Kebutuhan gerakmu belum terpenuhi';
      if (mascotMsg) mascotMsg.textContent = points > 0
        ? `Sedikit lagi! Kamu perlu ${remaining} poin lagi. Kamu bisa! 💪`
        : `Halo! Ayo kita bergerak bersama hari ini! 💪`;
    }
  }
}

// ============================================================
// STATUS HELPERS
// ============================================================
function getStatusLabel(points) {
  if (points >= DAILY_TARGET) return { label: 'Tercapai ✅', color: '#43A047', class: 'badge-success' };
  if (points > 0)             return { label: 'Sebagian ⚡', color: '#FF9800', class: 'badge-warning' };
  return                             { label: 'Belum Aktif ❌', color: '#E53935', class: 'badge-danger' };
}

function getProgressColor(points) {
  if (points >= DAILY_TARGET) return '#43A047';
  if (points >= DAILY_TARGET * 0.5) return '#FF9800';
  if (points > 0) return '#FFC107';
  return '#E0E0E0';
}

// ============================================================
// SESSION (localStorage)
// ============================================================
const SESSION_KEY = 'kalender_gerak_session';

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ============================================================
// MISC
// ============================================================
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Debounce function */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
