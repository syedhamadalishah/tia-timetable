/**
 * The Inspirational Academy - Timetable UI, Grid, Table Directory & Modal Manager
 */

class TimetableUI {
  constructor() {
    this.classes = [];
    this.currentDayFilter = 'All'; // 'All', 'Today', 'Mon', 'Tue', etc.
    this.searchQuery = '';
    this.filterSubject = '';
    this.filterTeacher = '';
    this.filterCourse = '';
    this.selectedDaysInModal = new Set(['Mon', 'Wed', 'Fri']);
    this.selectedColorInModal = '#2563eb';
    this.editingClassId = null;
  }

  async init() {
    this.setupEventListeners();
    await this.refreshData();
    this.populateFilterDropdowns();
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('timetableSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderAllViews();
      });
    }

    // Filter dropdowns
    const filterSub = document.getElementById('filterSubjectSelect');
    if (filterSub) {
      filterSub.addEventListener('change', (e) => {
        this.filterSubject = e.target.value;
        this.renderAllViews();
      });
    }

    const filterTeach = document.getElementById('filterTeacherSelect');
    if (filterTeach) {
      filterTeach.addEventListener('change', (e) => {
        this.filterTeacher = e.target.value;
        this.renderAllViews();
      });
    }

    // Day filter pills
    const dayPills = document.querySelectorAll('.day-pill-btn');
    dayPills.forEach(btn => {
      btn.addEventListener('click', () => {
        dayPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDayFilter = btn.dataset.day;
        this.renderAllViews();
      });
    });

    // Add Class Modal Trigger
    const btnOpenAdd = document.getElementById('btnOpenAddClassModal');
    if (btnOpenAdd) {
      btnOpenAdd.addEventListener('click', () => this.openClassModal());
    }

    // Close Modal buttons
    const btnCloseModal = document.getElementById('btnCloseClassModal');
    const btnCancelModal = document.getElementById('btnCancelClassModal');
    const modalBackdrop = document.getElementById('classModalBackdrop');
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this.closeClassModal());
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => this.closeClassModal());
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) this.closeClassModal();
      });
    }

    // Day selection pills inside modal
    const daySelectPills = document.querySelectorAll('.day-select-pill');
    daySelectPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const day = pill.dataset.day;
        if (this.selectedDaysInModal.has(day)) {
          this.selectedDaysInModal.delete(day);
          pill.classList.remove('selected');
        } else {
          this.selectedDaysInModal.add(day);
          pill.classList.add('selected');
        }
      });
    });

    // Preset Day links in Modal
    this.setupDayPresets();

    // Color picker dots in Modal
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
        this.selectedColorInModal = dot.dataset.color;
      });
    });

    // Class Form Submit
    const classForm = document.getElementById('classForm');
    if (classForm) {
      classForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Timing inputs auto duration calculation
    const startInput = document.getElementById('inputStartTime');
    const endInput = document.getElementById('inputEndTime');
    if (startInput && endInput) {
      const calcDuration = () => {
        const s = startInput.value;
        const e = endInput.value;
        const durationEl = document.getElementById('durationPreview');
        if (s && e && durationEl) {
          const [sh, sm] = s.split(':').map(Number);
          const [eh, em] = e.split(':').map(Number);
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          if (diff > 0) {
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            durationEl.textContent = `⏱️ Duration: ${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`;
            durationEl.style.color = 'var(--text-secondary)';
          } else {
            durationEl.textContent = `⚠️ End time must be after start time`;
            durationEl.style.color = 'var(--brand-rose)';
          }
        }
      };
      startInput.addEventListener('change', calcDuration);
      endInput.addEventListener('change', calcDuration);
    }

    // Database Actions (Export / Import / Reset / Print)
    const btnExport = document.getElementById('btnExportDatabase');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportDatabase());
    }

    const btnImport = document.getElementById('btnImportDatabase');
    const inputImport = document.getElementById('inputImportFile');
    if (btnImport && inputImport) {
      btnImport.addEventListener('click', () => inputImport.click());
      inputImport.addEventListener('change', (e) => this.importDatabase(e));
    }

    const btnResetDemo = document.getElementById('btnResetDatabase');
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => this.confirmResetDemo());
    }

    const btnPrint = document.getElementById('btnPrintTimetable');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }
  }

  setupDayPresets() {
    const setDays = (daysArray) => {
      this.selectedDaysInModal = new Set(daysArray);
      document.querySelectorAll('.day-select-pill').forEach(p => {
        if (this.selectedDaysInModal.has(p.dataset.day)) {
          p.classList.add('selected');
        } else {
          p.classList.remove('selected');
        }
      });
    };

    const presetWeekdays = document.getElementById('presetWeekdays');
    const presetMWF = document.getElementById('presetMWF');
    const presetTTS = document.getElementById('presetTTS');
    const presetWeekend = document.getElementById('presetWeekend');
    const presetAll = document.getElementById('presetAll');

    if (presetWeekdays) presetWeekdays.addEventListener('click', (e) => { e.preventDefault(); setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']); });
    if (presetMWF) presetMWF.addEventListener('click', (e) => { e.preventDefault(); setDays(['Mon', 'Wed', 'Fri']); });
    if (presetTTS) presetTTS.addEventListener('click', (e) => { e.preventDefault(); setDays(['Tue', 'Thu', 'Sat']); });
    if (presetWeekend) presetWeekend.addEventListener('click', (e) => { e.preventDefault(); setDays(['Sat', 'Sun']); });
    if (presetAll) presetAll.addEventListener('click', (e) => { e.preventDefault(); setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']); });
  }

  async refreshData() {
    try {
      this.classes = await window.tiaAPI.getClasses();
      const stats = await window.tiaAPI.getStats();
      this.updateStatsUI(stats);
      this.renderAllViews();
      if (window.liveTracker) {
        window.liveTracker.fetchAndUpdateLiveRadar();
      }
    } catch (err) {
      console.error('Error refreshing timetable data:', err);
    }
  }

  updateStatsUI(stats) {
    if (!stats) return;
    const statTotal = document.getElementById('statTotalClasses');
    const statTeachers = document.getElementById('statTotalTeachers');
    const statCourses = document.getElementById('statTotalCourses');

    if (statTotal) statTotal.textContent = stats.totalClasses;
    if (statTeachers) statTeachers.textContent = stats.uniqueTeachers;
    if (statCourses) statCourses.textContent = stats.uniqueCourses;
  }

  async populateFilterDropdowns() {
    try {
      const meta = await window.tiaAPI.getMetadata();
      const subSelect = document.getElementById('filterSubjectSelect');
      const teachSelect = document.getElementById('filterTeacherSelect');

      if (subSelect && meta.subjects) {
        const cur = subSelect.value;
        subSelect.innerHTML = '<option value="">All Subjects</option>' +
          meta.subjects.map(s => `<option value="${s}" ${s === cur ? 'selected' : ''}>${s}</option>`).join('');
      }

      if (teachSelect && meta.teachers) {
        const cur = teachSelect.value;
        teachSelect.innerHTML = '<option value="">All Teachers</option>' +
          meta.teachers.map(t => `<option value="${t}" ${t === cur ? 'selected' : ''}>${t}</option>`).join('');
      }

      // Also populate datalist suggestions for modal inputs
      this.populateDatalists(meta);
    } catch (err) {
      console.error('Error populating filters:', err);
    }
  }

  populateDatalists(meta) {
    const listCourses = document.getElementById('datalistCourses');
    const listSubjects = document.getElementById('datalistSubjects');
    const listTeachers = document.getElementById('datalistTeachers');
    const listRooms = document.getElementById('datalistRooms');

    if (listCourses && meta.courses) {
      listCourses.innerHTML = meta.courses.map(c => `<option value="${c}">`).join('');
    }
    if (listSubjects && meta.subjects) {
      listSubjects.innerHTML = meta.subjects.map(s => `<option value="${s}">`).join('');
    }
    if (listTeachers && meta.teachers) {
      listTeachers.innerHTML = meta.teachers.map(t => `<option value="${t}">`).join('');
    }
    if (listRooms && meta.rooms) {
      listRooms.innerHTML = meta.rooms.map(r => `<option value="${r}">`).join('');
    }
  }

  renderAllViews() {
    this.renderWeeklyGrid();
    this.renderDirectoryTable();
  }

  getFilteredClasses() {
    return this.classes.filter(cls => {
      // Search
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const match = (
          (cls.course && cls.course.toLowerCase().includes(q)) ||
          (cls.subject && cls.subject.toLowerCase().includes(q)) ||
          (cls.teacher_name && cls.teacher_name.toLowerCase().includes(q)) ||
          (cls.room && cls.room.toLowerCase().includes(q)) ||
          (cls.batch && cls.batch.toLowerCase().includes(q)) ||
          (cls.notes && cls.notes.toLowerCase().includes(q))
        );
        if (!match) return false;
      }

      // Filter Subject
      if (this.filterSubject && cls.subject !== this.filterSubject) return false;

      // Filter Teacher
      if (this.filterTeacher && cls.teacher_name !== this.filterTeacher) return false;

      // Filter Day
      if (this.currentDayFilter !== 'All') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const targetDay = this.currentDayFilter === 'Today' ? days[new Date().getDay()] : this.currentDayFilter;
        const matchesDay = Array.isArray(cls.days) && cls.days.some(d => d.toLowerCase().startsWith(targetDay.toLowerCase().slice(0, 3)));
        if (!matchesDay) return false;
      }

      return true;
    });
  }

  // --- 1. Weekly Grid Renderer ---
  renderWeeklyGrid() {
    const tableBody = document.getElementById('weeklyGridTableBody');
    if (!tableBody) return;

    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const daysAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayAbbr = daysAbbr[now.getDay()];

    // Highlight today column header
    daysOrder.forEach(day => {
      const th = document.getElementById(`th-day-${day}`);
      if (th) {
        if (day === todayAbbr) {
          th.classList.add('is-today');
        } else {
          th.classList.remove('is-today');
        }
      }
    });

    const filtered = this.getFilteredClasses();

    // Map classes into day buckets
    const dayBuckets = {};
    daysOrder.forEach(d => { dayBuckets[d] = []; });

    filtered.forEach(cls => {
      daysOrder.forEach(day => {
        if (Array.isArray(cls.days) && cls.days.some(d => d.toLowerCase().startsWith(day.toLowerCase()))) {
          dayBuckets[day].push(cls);
        }
      });
    });

    // Sort each day's bucket by start_time
    daysOrder.forEach(day => {
      dayBuckets[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    // Render cells
    const rowHtml = `
      <tr>
        ${daysOrder.map(day => {
          const isToday = day === todayAbbr;
          const items = dayBuckets[day];
          return `
            <td class="${isToday ? 'is-today' : ''}">
              ${items.length === 0 ? `
                <div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 1.5rem 0.5rem; opacity: 0.6;">
                  No lectures
                </div>
              ` : items.map(cls => {
                const isActiveNow = this.isClassActiveNow(cls, day);
                return `
                  <div class="grid-class-item ${isActiveNow ? 'is-active-now' : ''}"
                       style="border-left-color: ${cls.color || '#3b82f6'};"
                       onclick="window.timetableUI.openViewDetailsModal(${cls.id})">
                    <div class="grid-class-time">${this.format12Hour(cls.start_time)} - ${this.format12Hour(cls.end_time)}</div>
                    <div class="grid-class-subject">${cls.subject}</div>
                    <div class="grid-class-teacher">${cls.teacher_name}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="grid-class-room">📍 ${cls.room || 'Room 101'}</span>
                      ${cls.batch ? `<span style="font-size:0.65rem; color:var(--brand-gold);">${cls.batch}</span>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </td>
          `;
        }).join('')}
      </tr>
    `;

    tableBody.innerHTML = rowHtml;
  }

  isClassActiveNow(cls, day) {
    if (window.liveTracker && window.liveTracker.lastData && window.liveTracker.lastData.running_now) {
      return window.liveTracker.lastData.running_now.some(r => r.id === cls.id);
    }
    return false;
  }

  // --- 2. Class Directory Table Renderer ---
  renderDirectoryTable() {
    const tableBody = document.getElementById('classDirectoryTableBody');
    if (!tableBody) return;

    const filtered = this.getFilteredClasses();

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            No classes match your current search and filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(cls => {
      const daysStr = Array.isArray(cls.days) ? cls.days.join(', ') : cls.days;
      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">
              ${cls.course}
            </div>
            <div style="font-size: 0.78rem; color: var(--brand-gold);">
              ${cls.batch || 'Regular Batch'}
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background: ${cls.color || '#3b82f6'};"></span>
              <strong>${cls.subject}</strong>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">👨‍🏫 ${cls.teacher_name}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">📍 ${cls.room || 'Room 101'}</div>
          </td>
          <td>
            <div style="font-family: 'Outfit'; font-weight: 700; font-size: 0.88rem;">
              ${this.format12Hour(cls.start_time)} - ${this.format12Hour(cls.end_time)}
            </div>
            <div style="margin-top: 0.2rem;">
              <span class="badge-pill badge-days">${daysStr}</span>
            </div>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">
              <span>Start: <strong>${cls.start_date}</strong></span><br>
              <span>End: <strong>${cls.end_date}</strong></span>
            </div>
          </td>
          <td>
            <span class="badge-pill ${cls.status === 'Active' ? 'badge-live-bg' : 'badge-completed-bg'}"
                  style="border: 1px solid ${cls.status === 'Active' ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}; color: ${cls.status === 'Active' ? '#34d399' : '#94a3b8'}">
              ${cls.status}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn" title="View Details" onclick="window.timetableUI.openViewDetailsModal(${cls.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="action-btn" title="Edit Class" onclick="window.timetableUI.openEditClassModal(${cls.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn btn-delete" title="Delete Class" onclick="window.timetableUI.deleteClass(${cls.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 3. Modals & Actions ---
  openClassModal(cls = null) {
    const modalBackdrop = document.getElementById('classModalBackdrop');
    const modalTitle = document.getElementById('classModalTitle');
    const form = document.getElementById('classForm');

    if (!modalBackdrop || !form) return;

    form.reset();
    this.editingClassId = cls ? cls.id : null;

    if (cls) {
      if (modalTitle) modalTitle.textContent = 'Edit Class Schedule';
      document.getElementById('inputCourse').value = cls.course || '';
      document.getElementById('inputSubject').value = cls.subject || '';
      document.getElementById('inputTeacher').value = cls.teacher_name || '';
      document.getElementById('inputRoom').value = cls.room || '';
      document.getElementById('inputBatch').value = cls.batch || '';
      document.getElementById('inputStartTime').value = cls.start_time || '';
      document.getElementById('inputEndTime').value = cls.end_time || '';
      document.getElementById('inputStartDate').value = cls.start_date || '';
      document.getElementById('inputEndDate').value = cls.end_date || '';
      document.getElementById('inputStatus').value = cls.status || 'Active';
      document.getElementById('inputNotes').value = cls.notes || '';

      this.selectedDaysInModal = new Set(Array.isArray(cls.days) ? cls.days : [cls.days]);
      this.selectedColorInModal = cls.color || '#2563eb';
    } else {
      if (modalTitle) modalTitle.textContent = 'Add New Class to Timetable';
      // Default dates: Today and 6 months out
      const today = new Date().toISOString().slice(0, 10);
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      document.getElementById('inputStartDate').value = today;
      document.getElementById('inputEndDate').value = sixMonths.toISOString().slice(0, 10);

      this.selectedDaysInModal = new Set(['Mon', 'Wed', 'Fri']);
      this.selectedColorInModal = '#2563eb';
    }

    // Sync day pills in modal
    document.querySelectorAll('.day-select-pill').forEach(p => {
      if (this.selectedDaysInModal.has(p.dataset.day)) {
        p.classList.add('selected');
      } else {
        p.classList.remove('selected');
      }
    });

    // Sync color picker
    document.querySelectorAll('.color-dot').forEach(d => {
      if (d.dataset.color === this.selectedColorInModal) {
        d.classList.add('selected');
      } else {
        d.classList.remove('selected');
      }
    });

    modalBackdrop.classList.add('open');
  }

  closeClassModal() {
    const modalBackdrop = document.getElementById('classModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('open');
    this.editingClassId = null;
  }

  openEditClassModal(id) {
    const cls = this.classes.find(c => c.id === id);
    if (cls) {
      this.openClassModal(cls);
    }
  }

  openViewDetailsModal(id) {
    const cls = this.classes.find(c => c.id === id);
    if (!cls) return;

    const detailsModal = document.getElementById('detailsModalBackdrop');
    const detailsContainer = document.getElementById('detailsModalContent');
    if (!detailsModal || !detailsContainer) return;

    const daysStr = Array.isArray(cls.days) ? cls.days.join(', ') : cls.days;

    detailsContainer.innerHTML = `
      <div style="border-left: 5px solid ${cls.color || '#3b82f6'}; padding-left: 1rem; margin-bottom: 1.5rem;">
        <span class="badge-pill" style="background: rgba(251,191,36,0.15); color: var(--brand-gold); margin-bottom: 0.5rem;">
          ${cls.course}
        </span>
        <h2 style="font-size: 1.6rem; color: var(--text-primary); margin-top: 0.25rem;">
          ${cls.subject}
        </h2>
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
          Batch: <strong>${cls.batch || 'General Batch'}</strong> &bull; Status: <strong style="color: #34d399;">${cls.status}</strong>
        </div>
      </div>

      <div class="form-grid" style="gap: 1rem; margin-bottom: 1.5rem;">
        <div class="stat-card" style="padding: 0.85rem 1rem;">
          <div style="font-size: 1.2rem;">👨‍🏫</div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Instructor / Teacher</div>
            <div style="font-weight: 700; font-size: 0.95rem;">${cls.teacher_name}</div>
          </div>
        </div>

        <div class="stat-card" style="padding: 0.85rem 1rem;">
          <div style="font-size: 1.2rem;">📍</div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Location / Classroom</div>
            <div style="font-weight: 700; font-size: 0.95rem;">${cls.room || 'Room 101'}</div>
          </div>
        </div>

        <div class="stat-card" style="padding: 0.85rem 1rem;">
          <div style="font-size: 1.2rem;">⏱️</div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Class Timing</div>
            <div style="font-weight: 700; font-size: 0.95rem;">${this.format12Hour(cls.start_time)} - ${this.format12Hour(cls.end_time)}</div>
          </div>
        </div>

        <div class="stat-card" style="padding: 0.85rem 1rem;">
          <div style="font-size: 1.2rem;">📅</div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Scheduled Days</div>
            <div style="font-weight: 700; font-size: 0.95rem;">${daysStr}</div>
          </div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
        <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem;">
          Term Duration & Validity
        </div>
        <div style="font-size: 0.88rem; display: flex; gap: 2rem;">
          <span>Start Date: <strong>${cls.start_date}</strong></span>
          <span>End Date: <strong>${cls.end_date}</strong></span>
        </div>
      </div>

      ${cls.notes ? `
      <div style="background: rgba(0,0,0,0.25); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem;">
        <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.4rem;">
          Syllabus & Lecture Notes
        </div>
        <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-primary);">
          ${cls.notes}
        </p>
      </div>` : ''}

      <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="btn btn-outline" onclick="document.getElementById('detailsModalBackdrop').classList.remove('open')">
          Close
        </button>
        <button class="btn btn-primary" onclick="document.getElementById('detailsModalBackdrop').classList.remove('open'); window.timetableUI.openEditClassModal(${cls.id})">
          Edit Class
        </button>
      </div>
    `;

    detailsModal.classList.add('open');
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const course = document.getElementById('inputCourse').value.trim();
    const subject = document.getElementById('inputSubject').value.trim();
    const teacher_name = document.getElementById('inputTeacher').value.trim();
    const room = document.getElementById('inputRoom').value.trim();
    const batch = document.getElementById('inputBatch').value.trim();
    const start_time = document.getElementById('inputStartTime').value.trim();
    const end_time = document.getElementById('inputEndTime').value.trim();
    const start_date = document.getElementById('inputStartDate').value.trim();
    const end_date = document.getElementById('inputEndDate').value.trim();
    const status = document.getElementById('inputStatus').value;
    const notes = document.getElementById('inputNotes').value.trim();

    if (this.selectedDaysInModal.size === 0) {
      window.tiaApp.showToast('Please select at least one day for the class', 'error');
      return;
    }

    if (start_time >= end_time) {
      window.tiaApp.showToast('Class end time must be after start time', 'error');
      return;
    }

    if (start_date > end_date) {
      window.tiaApp.showToast('Course end date must be on or after start date', 'error');
      return;
    }

    const payload = {
      course,
      subject,
      teacher_name,
      room,
      batch,
      start_time,
      end_time,
      start_date,
      end_date,
      days: Array.from(this.selectedDaysInModal),
      color: this.selectedColorInModal,
      status,
      notes
    };

    try {
      if (this.editingClassId) {
        await window.tiaAPI.updateClass(this.editingClassId, payload);
        window.tiaApp.showToast('Class schedule updated successfully!', 'success');
      } else {
        await window.tiaAPI.createClass(payload);
        window.tiaApp.showToast('New class added to Timetable!', 'success');
      }

      this.closeClassModal();
      await this.refreshData();
      await this.populateFilterDropdowns();
    } catch (err) {
      window.tiaApp.showToast(err.message || 'Error saving class', 'error');
    }
  }

  async deleteClass(id) {
    const cls = this.classes.find(c => c.id === id);
    const name = cls ? `${cls.subject} (${cls.teacher_name})` : 'this class';
    if (!confirm(`Are you sure you want to remove "${name}" from the timetable database?`)) {
      return;
    }

    try {
      await window.tiaAPI.deleteClass(id);
      window.tiaApp.showToast('Class removed successfully', 'success');
      await this.refreshData();
      await this.populateFilterDropdowns();
    } catch (err) {
      window.tiaApp.showToast(err.message || 'Error deleting class', 'error');
    }
  }

  exportDatabase() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.classes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tia_timetable_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    window.tiaApp.showToast('Database exported as JSON backup', 'success');
  }

  importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid format: Expected a JSON array of classes');
        }

        if (window.tiaAPI.isServerAvailable) {
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importedData)
          });
          const json = await res.json();
          window.tiaApp.showToast(json.message || 'Imported classes', 'success');
        } else {
          window.tiaAPI.saveLocalClasses(importedData);
          window.tiaApp.showToast(`Imported ${importedData.length} classes into local storage`, 'success');
        }

        await this.refreshData();
        await this.populateFilterDropdowns();
      } catch (err) {
        window.tiaApp.showToast(`Import error: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async confirmResetDemo() {
    if (!confirm('This will reset the schedule database to the default classes for The Inspirational Academy. Proceed?')) {
      return;
    }

    try {
      await window.tiaAPI.resetDemo();
      window.tiaApp.showToast('Database reset to official demo schedule', 'success');
      await this.refreshData();
      await this.populateFilterDropdowns();
    } catch (err) {
      window.tiaApp.showToast(err.message || 'Error resetting demo', 'error');
    }
  }

  format12Hour(time24) {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}

window.timetableUI = new TimetableUI();
