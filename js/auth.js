/**
 * KALENDER GERAK — Authentication Module
 */

// ============================================================
// LOGIN FORM
// ============================================================

function initLogin() {
  const form         = el('login-form');
  const inputNis     = el('input-nis');
  const inputPwd     = el('input-password');
  const labelNis     = el('label-nis');
  const btnLogin     = el('btn-login');
  const btnLoginText = el('btn-login-text');
  const btnSpinner   = el('btn-login-spinner');
  const errorNis     = el('error-nis');
  const errorPwd     = el('error-password');
  const errorMain    = el('error-login');
  const togglePwd    = el('toggle-password');

  // Role toggle
  const roleBtns = document.querySelectorAll('.role-btn');
  let currentRole = 'siswa';

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentRole = btn.dataset.role;
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (currentRole === 'siswa') {
        labelNis.textContent = 'Nomor Induk Siswa (NIS)';
        inputNis.placeholder = 'Masukkan NIS kamu';
        inputNis.inputMode = 'numeric';
      } else {
        labelNis.textContent = 'Nomor Induk Pegawai (NIP)';
        inputNis.placeholder = 'Masukkan NIP kamu (contoh: GR001)';
        inputNis.inputMode = 'text';
      }

      // Clear errors
      errorNis.textContent = '';
      errorPwd.textContent = '';
      errorMain.textContent = '';
      inputNis.classList.remove('error');
      inputPwd.classList.remove('error');
    });
  });

  // Toggle password visibility
  togglePwd.addEventListener('click', () => {
    const isText = inputPwd.type === 'text';
    inputPwd.type = isText ? 'password' : 'text';
    togglePwd.innerHTML = isText
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear errors
    errorNis.textContent = '';
    errorPwd.textContent = '';
    errorMain.textContent = '';
    inputNis.classList.remove('error');
    inputPwd.classList.remove('error');

    const nis = inputNis.value.trim();
    const pwd = inputPwd.value;

    // Validate
    let valid = true;

    if (!nis) {
      errorNis.textContent = 'NIS/NIP tidak boleh kosong.';
      inputNis.classList.add('error');
      valid = false;
    }

    if (!pwd) {
      errorPwd.textContent = 'Kata sandi tidak boleh kosong.';
      inputPwd.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // Show loading
    btnLoginText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    btnLogin.disabled = true;

    try {
      const user = await loginUser(nis, pwd);
      saveSession(user);
      showToast(`Selamat datang, ${user.name.split(' ')[0]}! 👋`, 'success');

      // Navigate to appropriate dashboard
      if (user.role === 'guru') {
        App.navigate('teacher-dashboard');
      } else {
        App.navigate('student-dashboard');
      }

    } catch (err) {
      errorMain.textContent = err.message || 'Terjadi kesalahan. Coba lagi.';
    } finally {
      btnLoginText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      btnLogin.disabled = false;
    }
  });

  // Real-time validation
  inputNis.addEventListener('input', () => {
    if (inputNis.value.trim()) {
      errorNis.textContent = '';
      inputNis.classList.remove('error');
    }
  });

  inputPwd.addEventListener('input', () => {
    if (inputPwd.value) {
      errorPwd.textContent = '';
      inputPwd.classList.remove('error');
    }
  });
}

// ============================================================
// LOGOUT
// ============================================================

function initLogout() {
  // Student logout
  const btnLogoutStudent = el('btn-logout-student');
  if (btnLogoutStudent) {
    btnLogoutStudent.addEventListener('click', () => {
      if (confirm('Yakin ingin keluar?')) {
        logout();
      }
    });
  }

  // Teacher logout
  const btnLogoutTeacher = el('btn-logout-teacher');
  if (btnLogoutTeacher) {
    btnLogoutTeacher.addEventListener('click', () => {
      if (confirm('Yakin ingin keluar?')) {
        logout();
      }
    });
  }
}

function logout() {
  clearSession();
  showToast('Berhasil keluar. Sampai jumpa! 👋', 'info');
  setTimeout(() => App.navigate('splash'), 500);
}
