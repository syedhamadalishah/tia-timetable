/**
 * The Inspirational Academy - Main Application Controller
 */

class TIAApp {
  constructor() {
    this.currentTheme = localStorage.getItem('tia_theme') || 'dark';
    this.activeTab = 'live'; // 'live', 'schedule', 'directory', 'database'
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.setupThemeToggle();
    this.setupNavigationTabs();
    this.setupCloseModalEvents();

    // Initialize subsystems
    if (window.liveTracker) {
      window.liveTracker.init();
    }
    if (window.timetableUI) {
      await window.timetableUI.init();
    }
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById('btnThemeToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      this.applyTheme(this.currentTheme);
      localStorage.setItem('tia_theme', this.currentTheme);
    });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleBtn = document.getElementById('btnThemeToggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = theme === 'dark'
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      toggleBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  setupNavigationTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const sections = {
      live: document.getElementById('section-live'),
      schedule: document.getElementById('section-schedule'),
      directory: document.getElementById('section-directory'),
      database: document.getElementById('section-database')
    };

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (!targetTab || !sections[targetTab]) return;

        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        Object.keys(sections).forEach(key => {
          if (sections[key]) {
            if (key === targetTab) {
              sections[key].style.display = 'block';
              sections[key].scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              sections[key].style.display = 'none';
            }
          }
        });

        this.activeTab = targetTab;
      });
    });
  }

  setupCloseModalEvents() {
    const detailsModal = document.getElementById('detailsModalBackdrop');
    const closeBtn = document.getElementById('btnCloseDetailsModal');

    if (closeBtn && detailsModal) {
      closeBtn.addEventListener('click', () => detailsModal.classList.remove('open'));
    }

    if (detailsModal) {
      detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) detailsModal.classList.remove('open');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const classModal = document.getElementById('classModalBackdrop');
        const detModal = document.getElementById('detailsModalBackdrop');
        if (classModal) classModal.classList.remove('open');
        if (detModal) detModal.classList.remove('open');
      }
    });
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = `ℹ️`;
    if (type === 'success') icon = `✅`;
    if (type === 'error') icon = `⚠️`;

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

window.tiaApp = new TIAApp();
document.addEventListener('DOMContentLoaded', () => {
  window.tiaApp.init();
});
