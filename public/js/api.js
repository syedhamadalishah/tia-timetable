/**
 * The Inspirational Academy - API & Storage Layer
 * Handles communication with SQLite Backend with LocalStorage offline fallback.
 */

const API_BASE = '/api';

// Initial fallback demo seed (if opened without Node server)
const DEFAULT_DEMO_CLASSES = [
  {
    id: 1,
    course: 'Matric Science Excellence',
    subject: 'Physics',
    teacher_name: 'Prof. Salman Tariq',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '08:30',
    end_time: '10:00',
    start_date: '2026-09-01',
    end_date: '2027-05-31',
    room: 'Science Lab 1',
    batch: 'Matric-A Morning',
    color: '#2563eb',
    notes: 'Mechanics, Newton Laws, Kinetic energy and laboratory demonstrations.',
    status: 'Active'
  },
  {
    id: 2,
    course: 'FSc Pre-Medical Premier',
    subject: 'Biology & Genetics',
    teacher_name: 'Dr. Ayesha Khan',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '10:15',
    end_time: '11:45',
    start_date: '2026-09-01',
    end_date: '2027-06-30',
    room: 'Lecture Hall B',
    batch: 'Pre-Med Gold',
    color: '#059669',
    notes: 'Cellular respiration, molecular genetics, and cytology slide preparation.',
    status: 'Active'
  },
  {
    id: 3,
    course: 'O-Level Cambridge Program',
    subject: 'Mathematics (Syllabus D)',
    teacher_name: 'Sir Bilal Ahmed',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_time: '12:00',
    end_time: '13:15',
    start_date: '2026-08-15',
    end_date: '2027-05-15',
    room: 'Room 204',
    batch: 'O3 Cambridge',
    color: '#d97706',
    notes: 'Algebraic manipulations, trigonometry, and past paper practice sessions.',
    status: 'Active'
  },
  {
    id: 4,
    course: 'Computer Science & AI Track',
    subject: 'Data Structures & Algorithms',
    teacher_name: 'Engr. Hamza Tariq',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '14:00',
    end_time: '15:30',
    start_date: '2026-09-10',
    end_date: '2027-04-30',
    room: 'Computer Lab Alpha',
    batch: 'CS-Batch 1',
    color: '#7c3aed',
    notes: 'Binary search trees, graph algorithms, and hands-on coding challenges.',
    status: 'Active'
  },
  {
    id: 5,
    course: 'FSc Pre-Engineering',
    subject: 'Chemistry (Organic & Inorganic)',
    teacher_name: 'Prof. Tariq Mehmood',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '15:45',
    end_time: '17:15',
    start_date: '2026-09-01',
    end_date: '2027-06-15',
    room: 'Chemistry Lab',
    batch: 'Pre-Eng 2026',
    color: '#0284c7',
    notes: 'Hydrocarbons reaction mechanisms, stoichiometry calculations, and titration.',
    status: 'Active'
  },
  {
    id: 6,
    course: 'IELTS & Professional English',
    subject: 'English Language & Linguistics',
    teacher_name: 'Ms. Fatima Zahra',
    days: ['Tue', 'Thu', 'Sat'],
    start_time: '09:00',
    end_time: '10:30',
    start_date: '2026-10-01',
    end_date: '2027-01-31',
    room: 'Language Studio 3',
    batch: 'IELTS Intensive',
    color: '#e11d48',
    notes: 'Academic writing Task 2, fluency drills, and active listening seminars.',
    status: 'Active'
  },
  {
    id: 7,
    course: 'A-Level Cambridge Elite',
    subject: 'Economics & Business Studies',
    teacher_name: 'Sir Usman Ghani',
    days: ['Tue', 'Thu', 'Sat'],
    start_time: '11:00',
    end_time: '12:30',
    start_date: '2026-08-20',
    end_date: '2027-05-30',
    room: 'Conference Room 1',
    batch: 'A2 Economics',
    color: '#4f46e5',
    notes: 'Macroeconomic fiscal policy, market structures, and financial case studies.',
    status: 'Active'
  },
  {
    id: 8,
    course: 'Web & Mobile App Development',
    subject: 'Full-Stack JavaScript & React',
    teacher_name: 'Engr. Zainab Raza',
    days: ['Tue', 'Thu', 'Sat'],
    start_time: '14:30',
    end_time: '16:00',
    start_date: '2026-10-01',
    end_date: '2027-03-31',
    room: 'Innovation Tech Hub',
    batch: 'Bootcamp 2026',
    color: '#0d9488',
    notes: 'Modern responsive web development, state management, and Node backend architecture.',
    status: 'Active'
  },
  {
    id: 9,
    course: 'Civil Services / CSS Foundation',
    subject: 'Current Affairs & Pakistan Studies',
    teacher_name: 'Prof. Noman Siddiqui',
    days: ['Sat', 'Sun'],
    start_time: '10:00',
    end_time: '12:30',
    start_date: '2026-09-15',
    end_date: '2027-06-30',
    room: 'Executive Hall',
    batch: 'Weekend CSS Group',
    color: '#b45309',
    notes: 'Geopolitical analysis, constitutional history, and analytical essay drafting.',
    status: 'Active'
  },
  {
    id: 10,
    course: 'Robotics & STEM for Young Minds',
    subject: 'Applied Robotics & Microcontrollers',
    teacher_name: 'Sir Hamza Ali',
    days: ['Sat', 'Sun'],
    start_time: '14:00',
    end_time: '16:00',
    start_date: '2026-10-05',
    end_date: '2027-02-28',
    room: 'STEM Robotics Lab',
    batch: 'Junior Explorers',
    color: '#ea580c',
    notes: 'Sensors, Arduino programming, motor drivers, and obstacle-avoiding bot project.',
    status: 'Active'
  },
  {
    id: 11,
    course: 'Executive Leadership & Tech Mastery',
    subject: 'AI & Machine Learning Studio',
    teacher_name: 'Dr. Hamza Farooq',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '20:00',
    end_time: '21:30',
    start_date: '2026-09-01',
    end_date: '2027-06-30',
    room: 'Executive Tech Suite 1',
    batch: 'Evening Executive',
    color: '#10b981',
    notes: 'Applied deep learning, neural networks, and modern AI industry workflows.',
    status: 'Active'
  },
  {
    id: 12,
    course: 'Spoken English & Debate Forum',
    subject: 'Public Speaking & Rhetoric',
    teacher_name: 'Ms. Areeba Naveed',
    days: ['Mon', 'Wed', 'Fri'],
    start_time: '21:45',
    end_time: '22:45',
    start_date: '2026-09-01',
    end_date: '2027-04-30',
    room: 'Auditorium Hall',
    batch: 'Night Forum',
    color: '#6366f1',
    notes: 'Debate tournaments, speech modulation, and parliamentary procedures.',
    status: 'Active'
  }
];

class TIA_API {
  constructor() {
    this.isServerAvailable = false;
    this.checkServerConnection();
    this.syncInitialData();
  }

  async checkServerConnection() {
    try {
      const res = await fetch(`${API_BASE}/stats`, { method: 'GET' });
      if (res.ok) {
        this.isServerAvailable = true;
        this.updateConnectionStatus(true);
      } else {
        this.isServerAvailable = false;
        this.updateConnectionStatus(false);
      }
    } catch {
      this.isServerAvailable = false;
      this.updateConnectionStatus(false);
      this.initLocalStorageFallback();
    }
  }

  async syncInitialData() {
    try {
      const res = await fetch('data/classes.json', { cache: 'no-store' });
      if (res.ok) {
        const payload = await res.json();
        const serverClasses = payload.classes || (Array.isArray(payload) ? payload : null);
        const serverVersion = payload.updated_at || '';
        const localVersion = localStorage.getItem('tia_data_version') || '';

        if (serverClasses && Array.isArray(serverClasses)) {
          if (!localStorage.getItem('tia_initialized') || (serverVersion && serverVersion !== localVersion && !localStorage.getItem('tia_has_user_edits'))) {
            localStorage.setItem('tia_classes', JSON.stringify(serverClasses));
            localStorage.setItem('tia_initialized', 'true');
            localStorage.setItem('tia_data_version', serverVersion);
          }
        }
      }
    } catch {
      // offline or static mode without data/classes.json
    }
  }

  updateConnectionStatus(online) {
    const statusBadge = document.getElementById('dbConnectionStatus');
    if (statusBadge) {
      if (online) {
        statusBadge.innerHTML = `<span class="pulse-dot"></span> SQLite Database Online (tia_timetable.db)`;
        statusBadge.classList.add('connected');
      } else {
        statusBadge.innerHTML = `<span style="color:#10b981">●</span> Local Storage Database (Persistent Client)`;
        statusBadge.classList.remove('connected');
      }
    }
  }

  initLocalStorageFallback() {
    if (!localStorage.getItem('tia_initialized')) {
      localStorage.setItem('tia_classes', JSON.stringify(DEFAULT_DEMO_CLASSES));
      localStorage.setItem('tia_initialized', 'true');
    }
  }

  getLocalClasses() {
    this.initLocalStorageFallback();
    try {
      const raw = localStorage.getItem('tia_classes');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveLocalClasses(classes) {
    localStorage.setItem('tia_classes', JSON.stringify(classes));
  }

  // --- Core API Methods ---

  async getClasses(filters = {}) {
    if (this.isServerAvailable) {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.course) params.append('course', filters.course);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.teacher_name) params.append('teacher_name', filters.teacher_name);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`${API_BASE}/classes?${params.toString()}`);
      const json = await res.json();
      return json.data || [];
    } else {
      let list = this.getLocalClasses();
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(c =>
          (c.course && c.course.toLowerCase().includes(q)) ||
          (c.subject && c.subject.toLowerCase().includes(q)) ||
          (c.teacher_name && c.teacher_name.toLowerCase().includes(q)) ||
          (c.room && c.room.toLowerCase().includes(q)) ||
          (c.batch && c.batch.toLowerCase().includes(q))
        );
      }
      if (filters.subject) list = list.filter(c => c.subject === filters.subject);
      if (filters.teacher_name) list = list.filter(c => c.teacher_name === filters.teacher_name);
      if (filters.course) list = list.filter(c => c.course === filters.course);
      return list;
    }
  }

  async getLiveStatus(simulateDay = null, simulateTime = null) {
    if (this.isServerAvailable) {
      const params = new URLSearchParams();
      if (simulateDay) params.append('simulate_day', simulateDay);
      if (simulateTime) params.append('simulate_time', simulateTime);

      const res = await fetch(`${API_BASE}/classes/live?${params.toString()}`);
      const json = await res.json();
      return json;
    } else {
      // Local computation
      return this.computeLocalLiveStatus(simulateDay, simulateTime);
    }
  }

  async createClass(data) {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error creating class');
      return json.data;
    } else {
      localStorage.setItem('tia_has_user_edits', 'true');
      const list = this.getLocalClasses();
      const newClass = {
        ...data,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      list.push(newClass);
      this.saveLocalClasses(list);
      return newClass;
    }
  }

  async updateClass(id, data) {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error updating class');
      return json.data;
    } else {
      localStorage.setItem('tia_has_user_edits', 'true');
      const list = this.getLocalClasses();
      const idx = list.findIndex(c => String(c.id) === String(id));
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, id: list[idx].id, updated_at: new Date().toISOString() };
        this.saveLocalClasses(list);
        return list[idx];
      }
      throw new Error('Class not found');
    }
  }

  async deleteClass(id) {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/classes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error deleting class');
      return true;
    } else {
      localStorage.setItem('tia_has_user_edits', 'true');
      let list = this.getLocalClasses();
      list = list.filter(c => String(c.id) !== String(id));
      this.saveLocalClasses(list);
      return true;
    }
  }

  async clearAllClasses() {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/classes`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Error clearing classes');
      return true;
    } else {
      localStorage.setItem('tia_has_user_edits', 'true');
      this.saveLocalClasses([]);
      return true;
    }
  }

  async getStats() {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/stats`);
      const json = await res.json();
      return json.data;
    } else {
      const list = this.getLocalClasses();
      const uniqueTeachers = new Set(list.map(c => c.teacher_name)).size;
      const uniqueCourses = new Set(list.map(c => c.course)).size;
      const uniqueSubjects = new Set(list.map(c => c.subject)).size;
      return {
        totalClasses: list.length,
        activeClasses: list.filter(c => c.status !== 'Suspended').length,
        uniqueTeachers,
        uniqueCourses,
        uniqueSubjects
      };
    }
  }

  async getMetadata() {
    if (this.isServerAvailable) {
      const res = await fetch(`${API_BASE}/metadata`);
      const json = await res.json();
      return json.data;
    } else {
      const list = this.getLocalClasses();
      return {
        courses: [...new Set(list.map(c => c.course))].sort(),
        subjects: [...new Set(list.map(c => c.subject))].sort(),
        teachers: [...new Set(list.map(c => c.teacher_name))].sort(),
        rooms: [...new Set(list.map(c => c.room).filter(Boolean))].sort()
      };
    }
  }

  async resetDemo() {
    if (this.isServerAvailable) {
      await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
    } else {
      this.saveLocalClasses(DEFAULT_DEMO_CLASSES);
    }
  }

  computeLocalLiveStatus(simulateDay, simulateTime) {
    const list = this.getLocalClasses();
    const now = new Date();
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDay = simulateDay || daysArr[now.getDay()];

    let curHours = now.getHours();
    let curMins = now.getMinutes();

    if (simulateTime) {
      const [sh, sm] = simulateTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm)) {
        curHours = sh;
        curMins = sm;
      }
    }

    const currentTotalMin = curHours * 60 + curMins;
    const todayStr = now.toISOString().slice(0, 10);

    const runningNow = [];
    const upcomingToday = [];
    const completedToday = [];

    const timeToM = (t) => {
      const [h, m] = t.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    list.forEach(cls => {
      if (cls.status === 'Suspended') return;
      const matchesDay = Array.isArray(cls.days) && cls.days.some(d => d.toLowerCase().startsWith(currentDay.toLowerCase().slice(0, 3)));
      if (!matchesDay) return;

      if (cls.start_date && todayStr < cls.start_date) return;
      if (cls.end_date && todayStr > cls.end_date) return;

      const sMin = timeToM(cls.start_time);
      const eMin = timeToM(cls.end_time);
      const duration = eMin - sMin;

      if (currentTotalMin >= sMin && currentTotalMin < eMin) {
        const elapsed = currentTotalMin - sMin;
        const remaining = eMin - currentTotalMin;
        const pct = duration > 0 ? Math.min(100, Math.round((elapsed / duration) * 100)) : 0;

        runningNow.push({
          ...cls,
          live_status: 'RUNNING',
          elapsed_minutes: elapsed,
          remaining_minutes: remaining,
          duration_minutes: duration,
          progress_percent: pct
        });
      } else if (currentTotalMin < sMin) {
        upcomingToday.push({
          ...cls,
          live_status: 'UPCOMING',
          starts_in_minutes: sMin - currentTotalMin
        });
      } else {
        completedToday.push({
          ...cls,
          live_status: 'COMPLETED'
        });
      }
    });

    upcomingToday.sort((a, b) => timeToM(a.start_time) - timeToM(b.start_time));

    return {
      success: true,
      current_time: `${String(curHours).padStart(2, '0')}:${String(curMins).padStart(2, '0')}`,
      current_day: currentDay,
      running_now: runningNow,
      upcoming_today: upcomingToday,
      completed_today: completedToday,
      summary: {
        running_count: runningNow.length,
        upcoming_count: upcomingToday.length,
        completed_count: completedToday.length
      }
    };
  }
}

window.tiaAPI = new TIA_API();
