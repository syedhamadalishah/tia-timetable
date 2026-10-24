/**
 * The Inspirational Academy - Live Class Radar & Status Tracker
 * Detects classes running in real-time, progress countdowns, and upcoming queue.
 */

class LiveClassTracker {
  constructor() {
    this.simulatedDay = null;
    this.simulatedTime = null;
    this.timerId = null;
    this.clockTimerId = null;
    this.lastData = null;
  }

  init() {
    this.startLiveClock();
    this.setupSimulationControls();
    this.fetchAndUpdateLiveRadar();

    // Periodically update live classes every 10 seconds
    this.timerId = setInterval(() => {
      this.fetchAndUpdateLiveRadar();
    }, 10000);
  }

  startLiveClock() {
    const clockEl = document.getElementById('heroClockDigits');
    const dateEl = document.getElementById('heroClockDate');
    const simBadge = document.getElementById('simulatedBadge');

    const updateClock = () => {
      if (this.simulatedTime) {
        if (clockEl) clockEl.textContent = this.format12Hour(this.simulatedTime);
        if (dateEl) dateEl.textContent = `Simulated: ${this.simulatedDay} @ ${this.simulatedTime}`;
        if (simBadge) simBadge.style.display = 'inline-block';
        return;
      }

      if (simBadge) simBadge.style.display = 'none';
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;

      if (clockEl) {
        clockEl.textContent = `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${ampm}`;
      }

      if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
      }
    };

    updateClock();
    this.clockTimerId = setInterval(updateClock, 1000);
  }

  format12Hour(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  setupSimulationControls() {
    const applyBtn = document.getElementById('btnApplySimulation');
    const resetBtn = document.getElementById('btnResetSimulation');
    const simDaySelect = document.getElementById('simDaySelect');
    const simPresetSelect = document.getElementById('simPresetSelect');
    const simTimeInput = document.getElementById('simTimeInput');

    const triggerSimulation = () => {
      this.simulatedDay = simDaySelect.value;
      this.simulatedTime = simPresetSelect.value || simTimeInput.value || '20:30';
      this.fetchAndUpdateLiveRadar();
      window.tiaApp.showToast(`Simulation Mode: ${this.simulatedDay} @ ${this.format12Hour(this.simulatedTime)}`, 'info');
    };

    if (simPresetSelect) {
      simPresetSelect.addEventListener('change', () => {
        if (simPresetSelect.value) {
          triggerSimulation();
        }
      });
    }

    if (simDaySelect) {
      simDaySelect.addEventListener('change', () => {
        if (this.simulatedTime) {
          triggerSimulation();
        }
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', triggerSimulation);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.simulatedDay = null;
        this.simulatedTime = null;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        if (simDaySelect) simDaySelect.value = days[new Date().getDay()];
        if (simPresetSelect) simPresetSelect.value = '';
        this.fetchAndUpdateLiveRadar();
        window.tiaApp.showToast('Switched to Real Device Live Clock', 'success');
      });
    }
  }

  async fetchAndUpdateLiveRadar() {
    try {
      const data = await window.tiaAPI.getLiveStatus(this.simulatedDay, this.simulatedTime);
      this.lastData = data;
      this.renderLiveCards(data);
      this.renderUpcomingQueue(data);
      this.updateHeaderBadges(data);
    } catch (err) {
      console.error('Error fetching live status:', err);
    }
  }

  updateHeaderBadges(data) {
    const liveCountBadge = document.getElementById('liveCountNavBadge');
    const liveStatCounter = document.getElementById('statLiveClasses');
    const upcomingStatCounter = document.getElementById('statUpcomingClasses');

    const count = data.running_now ? data.running_now.length : 0;
    const upcomingCount = data.upcoming_today ? data.upcoming_today.length : 0;

    if (liveCountBadge) {
      liveCountBadge.textContent = count;
      liveCountBadge.style.backgroundColor = count > 0 ? '#10b981' : 'rgba(255,255,255,0.2)';
    }

    if (liveStatCounter) {
      liveStatCounter.textContent = count;
    }

    if (upcomingStatCounter) {
      upcomingStatCounter.textContent = upcomingCount;
    }
  }

  renderLiveCards(data) {
    const container = document.getElementById('liveRadarContainer');
    if (!container) return;

    const running = data.running_now || [];

    if (running.length === 0) {
      container.innerHTML = `
        <div class="empty-live-state">
          <div class="empty-live-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 class="empty-live-title">No Classes In Session Right Now</h3>
          <p class="empty-live-text">
            There are currently no active lectures scheduled for <strong>${data.current_day} at ${this.format12Hour(data.current_time)}</strong>.
            Check the upcoming queue below or test different time slots with the Time Travel simulator!
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = running.map(cls => {
      const formatDays = Array.isArray(cls.days) ? cls.days.join(', ') : cls.days;
      return `
        <div class="live-class-card" style="border-top-color: ${cls.color || '#10b981'}; cursor: pointer;" onclick="window.timetableUI.openViewDetailsModal('${cls.id}')" title="Click to view details, edit or delete class">
          <div class="live-card-top">
            <div class="live-pulse-badge">
              <span class="pulse-dot"></span>
              RUNNING NOW
            </div>
            <div class="live-card-timing">
              ${this.format12Hour(cls.start_time)} - ${this.format12Hour(cls.end_time)}
            </div>
          </div>

          <div class="live-card-subject">${cls.subject}</div>
          <div class="live-card-course">${cls.course}</div>

          <div class="live-card-meta">
            <div class="live-card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <strong>${cls.teacher_name}</strong>
            </div>
            <div class="live-card-meta-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>${cls.room || 'Room 101'}</span>
            </div>
            ${cls.batch ? `
            <div class="live-card-meta-item">
              <span class="badge-pill badge-days">${cls.batch}</span>
            </div>` : ''}
          </div>

          <!-- Progress Bar & Elapsed Info -->
          <div class="live-progress-container">
            <div class="live-progress-labels">
              <span>${cls.elapsed_minutes}m elapsed (${cls.progress_percent}%)</span>
              <span class="remaining-highlight">${cls.remaining_minutes}m remaining</span>
            </div>
            <div class="live-progress-track">
              <div class="live-progress-fill" style="width: ${cls.progress_percent}%;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderUpcomingQueue(data) {
    const queueContainer = document.getElementById('upcomingQueueContainer');
    if (!queueContainer) return;

    const upcoming = data.upcoming_today || [];

    if (upcoming.length === 0) {
      queueContainer.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0;">
          No further lectures scheduled for today (${data.current_day}).
        </div>
      `;
      return;
    }

    queueContainer.innerHTML = upcoming.map(cls => {
      const waitHours = Math.floor(cls.starts_in_minutes / 60);
      const waitMins = cls.starts_in_minutes % 60;
      let waitString = '';
      if (waitHours > 0) {
        waitString = `Starts in ${waitHours}h ${waitMins}m`;
      } else {
        waitString = `Starts in ${waitMins} min${waitMins === 1 ? '' : 's'}`;
      }

      return `
        <div class="upcoming-card" style="border-left: 3px solid ${cls.color || '#3b82f6'}; cursor: pointer;" onclick="window.timetableUI.openViewDetailsModal('${cls.id}')" title="Click to view details, edit or delete class">
          <div class="upcoming-card-top">
            <span class="upcoming-badge">
              ⏱️ ${waitString}
            </span>
            <span style="font-family: 'Outfit'; font-weight:700; font-size: 0.8rem; color: var(--text-secondary);">
              ${this.format12Hour(cls.start_time)}
            </span>
          </div>
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.2rem;">
            ${cls.subject}
          </div>
          <div style="font-size: 0.8rem; color: var(--brand-gold); margin-bottom: 0.4rem;">
            ${cls.course}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
            <span>👨‍🏫 ${cls.teacher_name}</span>
            <span>📍 ${cls.room || 'Room 101'}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.liveTracker = new LiveClassTracker();
