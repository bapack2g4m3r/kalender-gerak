/**
 * KALENDER GERAK — Main App Controller & Router
 */

// ============================================================
// ROUTER
// ============================================================
const App = {
  currentScreen: null,
  currentParams: {},

  /** Semua screen yang valid */
  screens: [
    'splash', 'login',
    'student-dashboard', 'student-activities', 'student-result', 'student-history', 'student-profile',
    'teacher-dashboard', 'teacher-monitoring', 'teacher-student-detail', 'teacher-report', 'teacher-profile',
  ],

  /** Navigasi ke screen tertentu */
  navigate(screenName, params = {}) {
    if (!this.screens.includes(screenName)) {
      console.warn(`Unknown screen: ${screenName}`);
      return;
    }

    // Auth guard
    const user = getSession();
    const publicScreens = ['splash', 'login'];

    if (!publicScreens.includes(screenName) && !user) {
      this.navigate('login');
      return;
    }

    if (user && screenName === 'splash') {
      this.navigate(user.role === 'guru' ? 'teacher-dashboard' : 'student-dashboard');
      return;
    }

    // Role guard
    if (user) {
      const isStudentScreen = screenName.startsWith('student-');
      const isTeacherScreen = screenName.startsWith('teacher-');

      if (isStudentScreen && user.role !== 'siswa') {
        this.navigate('teacher-dashboard');
        return;
      }
      if (isTeacherScreen && user.role !== 'guru') {
        this.navigate('student-dashboard');
        return;
      }
    }

    // Hide current, show new
    const prevScreen = this.currentScreen;
    this.currentScreen = screenName;
    this.currentParams = params;

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Show target screen
    const screenEl = document.getElementById(`screen-${screenName}`);
    if (screenEl) {
      screenEl.classList.add('active');
      screenEl.querySelector('.screen-content')?.classList.add('animate-enter');
      setTimeout(() => {
        screenEl.querySelector('.screen-content')?.classList.remove('animate-enter');
      }, 400);
    }

    // Scroll to top
    screenEl?.querySelector('.screen-content')?.scrollTo(0, 0);

    // Trigger screen-specific loader
    this.onScreenLoad(screenName, params);

    // Update bottom nav active state
    this.updateNavState(screenName);

    // Update URL hash for debug
    window.location.hash = screenName;
  },

  /** Screen load callbacks */
  async onScreenLoad(screenName, params) {
    try {
      switch (screenName) {
        case 'login':
          initLogin();
          break;

        case 'student-dashboard':
          await loadStudentDashboard();
          initStudentDashboardButtons();
          break;

        case 'student-activities':
          await loadActivitiesScreen();
          break;

        case 'student-result':
          loadResultScreen(params);
          break;

        case 'student-history':
          await loadHistoryScreen();
          break;

        case 'student-profile':
          await loadStudentProfile();
          initLogout();
          break;

        case 'teacher-dashboard':
          await loadTeacherDashboard();
          break;

        case 'teacher-monitoring':
          await loadMonitoringScreen();
          break;

        case 'teacher-student-detail':
          if (params.studentId) await loadStudentDetail(params.studentId);
          break;

        case 'teacher-report':
          await loadReportScreen();
          break;

        case 'teacher-profile':
          loadTeacherProfile();
          initLogout();
          break;
      }
    } catch (err) {
      console.error(`Error loading screen ${screenName}:`, err);
    }
  },

  /** Update active state di bottom nav */
  updateNavState(screenName) {
    document.querySelectorAll('.nav-item').forEach(item => {
      const target = item.dataset.screen;
      item.classList.toggle('active', target === screenName);
    });
  },
};

// ============================================================
// BOTTOM NAV GLOBAL HANDLER
// ============================================================
function initBottomNav() {
  document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item[data-screen]');
    if (navItem) {
      const target = navItem.dataset.screen;
      App.navigate(target);
    }
  });
}

// ============================================================
// SPLASH SCREEN
// ============================================================
function initSplash() {
  const btnMasuk = el('btn-splash-masuk');
  if (btnMasuk) {
    btnMasuk.addEventListener('click', () => App.navigate('login'));
  }
}

// ============================================================
// APP INIT
// ============================================================
async function initApp() {
  // Show loading
  const loadingEl = el('loading-screen');

  // Verify Supabase connection
  if (SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    // Demo mode — show config warning
    setTimeout(() => {
      if (loadingEl) loadingEl.classList.remove('active');
      showConfigWarning();
    }, 1000);
    return;
  }

  try {
    // Test Supabase connection
    const { error } = await db.from('profiles').select('id').limit(1);
    if (error) throw error;

    await sleep(800); // Minimum loading time for UX

    if (loadingEl) loadingEl.classList.remove('active');

    // Check session
    const user = getSession();

    if (user) {
      // Resume session
      if (user.role === 'guru') {
        App.navigate('teacher-dashboard');
      } else {
        App.navigate('student-dashboard');
      }
    } else {
      App.navigate('splash');
      initSplash();
    }

  } catch (err) {
    console.error('Supabase connection error:', err);
    if (loadingEl) loadingEl.classList.remove('active');
    showConnectionError();
  }
}

function showConfigWarning() {
  // Show splash with config message instead of blocking
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => s.classList.remove('active'));

  const splashEl = el('screen-splash');
  if (splashEl) {
    splashEl.classList.add('active');

    // Add config warning banner
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
      background: #FF6F00; color: white; padding: 12px 16px;
      font-family: Nunito, sans-serif; font-size: 13px; font-weight: 700;
      text-align: center; line-height: 1.5;
    `;
    warning.innerHTML = `
      ⚠️ Supabase belum dikonfigurasi.<br>
      Edit <code>js/config.js</code> dengan kredensial Supabase Anda.<br>
      <a href="README.md" style="color:#FFD600">Lihat README.md untuk panduan setup →</a>
    `;
    document.body.prepend(warning);
  }

  initSplash();

  // Patch login to show demo message
  const btnMasuk = el('btn-splash-masuk');
  if (btnMasuk) {
    btnMasuk.addEventListener('click', () => {
      App.navigate('login');
      initLogin();
      setTimeout(() => {
        const hint = document.querySelector('.login-hint');
        if (hint) hint.style.border = '2px solid var(--warning)';
      }, 300);
    });
  }
}

function showConnectionError() {
  const loadingEl = el('loading-screen');
  if (loadingEl) {
    loadingEl.innerHTML = `
      <div class="loading-mascot">
        <img src="assets/images/kagi.jpg" alt="Kagi" />
      </div>
      <div style="text-align:center;padding:24px;font-family:Nunito,sans-serif">
        <div style="font-size:36px;margin-bottom:12px">😕</div>
        <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">Tidak Dapat Terhubung</h3>
        <p style="color:#5C7C5C;font-weight:600;margin-bottom:16px;font-size:14px">
          Periksa konfigurasi Supabase dan koneksi internet Anda.
        </p>
        <button onclick="location.reload()" style="
          background:linear-gradient(135deg,#66BB6A,#2E7D32);
          color:white;border:none;padding:12px 28px;border-radius:999px;
          font-family:Nunito,sans-serif;font-size:16px;font-weight:800;cursor:pointer
        ">Coba Lagi</button>
      </div>`;
    loadingEl.classList.add('active');
  }
}

// ============================================================
// START
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initBottomNav();
  initApp();

  // Listen to browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    if (newHash && newHash !== App.currentScreen && App.screens.includes(newHash)) {
      // Prevent auth loops by doing a soft navigate
      App.navigate(newHash);
    }
  });
});
