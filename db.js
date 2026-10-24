const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, 'tia_timetable.db');
const db = new DatabaseSync(DB_PATH);

// Initialize schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course TEXT NOT NULL,
      subject TEXT NOT NULL,
      teacher_name TEXT NOT NULL,
      days TEXT NOT NULL,          -- JSON array e.g. ["Mon","Wed","Fri"]
      start_time TEXT NOT NULL,    -- "HH:MM" 24-hour format
      end_time TEXT NOT NULL,      -- "HH:MM" 24-hour format
      start_date TEXT NOT NULL,    -- "YYYY-MM-DD"
      end_date TEXT NOT NULL,      -- "YYYY-MM-DD"
      room TEXT DEFAULT 'Room 101',
      batch TEXT DEFAULT 'Regular Batch',
      color TEXT DEFAULT '#4f46e5',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_classes_course ON classes(course);
    CREATE INDEX IF NOT EXISTS idx_classes_subject ON classes(subject);
    CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_name);
  `);

  // Check if initial seed is needed
  const countRow = db.prepare('SELECT COUNT(*) as count FROM classes').get();
  if (countRow.count === 0) {
    seedDemoData();
  }
}

// Seed realistic schedule for The Inspirational Academy
function seedDemoData() {
  const sampleClasses = [
    {
      course: 'Matric Science Excellence',
      subject: 'Physics',
      teacher_name: 'Prof. Salman Tariq',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
      start_time: '08:30',
      end_time: '10:00',
      start_date: '2026-09-01',
      end_date: '2027-05-31',
      room: 'Science Lab 1',
      batch: 'Matric-A Morning',
      color: '#2563eb', // Royal Blue
      notes: 'Mechanics, Newton Laws, Kinetic energy and laboratory demonstrations.',
      status: 'Active'
    },
    {
      course: 'FSc Pre-Medical Premier',
      subject: 'Biology & Genetics',
      teacher_name: 'Dr. Ayesha Khan',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
      start_time: '10:15',
      end_time: '11:45',
      start_date: '2026-09-01',
      end_date: '2027-06-30',
      room: 'Lecture Hall B',
      batch: 'Pre-Med Gold',
      color: '#059669', // Emerald
      notes: 'Cellular respiration, molecular genetics, and cytology slide preparation.',
      status: 'Active'
    },
    {
      course: 'O-Level Cambridge Program',
      subject: 'Mathematics (Syllabus D)',
      teacher_name: 'Sir Bilal Ahmed',
      days: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      start_time: '12:00',
      end_time: '13:15',
      start_date: '2026-08-15',
      end_date: '2027-05-15',
      room: 'Room 204',
      batch: 'O3 Cambridge',
      color: '#d97706', // Amber
      notes: 'Algebraic manipulations, trigonometry, and past paper practice sessions.',
      status: 'Active'
    },
    {
      course: 'Computer Science & AI Track',
      subject: 'Data Structures & Algorithms',
      teacher_name: 'Engr. Hamza Tariq',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
      start_time: '14:00',
      end_time: '15:30',
      start_date: '2026-09-10',
      end_date: '2027-04-30',
      room: 'Computer Lab Alpha',
      batch: 'CS-Batch 1',
      color: '#7c3aed', // Purple
      notes: 'Binary search trees, graph algorithms, and hands-on coding challenges.',
      status: 'Active'
    },
    {
      course: 'FSc Pre-Engineering',
      subject: 'Chemistry (Organic & Inorganic)',
      teacher_name: 'Prof. Tariq Mehmood',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
      start_time: '15:45',
      end_time: '17:15',
      start_date: '2026-09-01',
      end_date: '2027-06-15',
      room: 'Chemistry Lab',
      batch: 'Pre-Eng 2026',
      color: '#0284c7', // Cyan/Sky
      notes: 'Hydrocarbons reaction mechanisms, stoichiometry calculations, and titration.',
      status: 'Active'
    },
    {
      course: 'IELTS & Professional English',
      subject: 'English Language & Linguistics',
      teacher_name: 'Ms. Fatima Zahra',
      days: JSON.stringify(['Tue', 'Thu', 'Sat']),
      start_time: '09:00',
      end_time: '10:30',
      start_date: '2026-10-01',
      end_date: '2027-01-31',
      room: 'Language Studio 3',
      batch: 'IELTS Intensive',
      color: '#e11d48', // Rose
      notes: 'Academic writing Task 2, fluency drills, and active listening seminars.',
      status: 'Active'
    },
    {
      course: 'A-Level Cambridge Elite',
      subject: 'Economics & Business Studies',
      teacher_name: 'Sir Usman Ghani',
      days: JSON.stringify(['Tue', 'Thu', 'Sat']),
      start_time: '11:00',
      end_time: '12:30',
      start_date: '2026-08-20',
      end_date: '2027-05-30',
      room: 'Conference Room 1',
      batch: 'A2 Economics',
      color: '#4f46e5', // Indigo
      notes: 'Macroeconomic fiscal policy, market structures, and financial case studies.',
      status: 'Active'
    },
    {
      course: 'Web & Mobile App Development',
      subject: 'Full-Stack JavaScript & React',
      teacher_name: 'Engr. Zainab Raza',
      days: JSON.stringify(['Tue', 'Thu', 'Sat']),
      start_time: '14:30',
      end_time: '16:00',
      start_date: '2026-10-01',
      end_date: '2027-03-31',
      room: 'Innovation Tech Hub',
      batch: 'Bootcamp 2026',
      color: '#0d9488', // Teal
      notes: 'Modern responsive web development, state management, and Node backend architecture.',
      status: 'Active'
    },
    {
      course: 'Civil Services / CSS Foundation',
      subject: 'Current Affairs & Pakistan Studies',
      teacher_name: 'Prof. Noman Siddiqui',
      days: JSON.stringify(['Sat', 'Sun']),
      start_time: '10:00',
      end_time: '12:30',
      start_date: '2026-09-15',
      end_date: '2027-06-30',
      room: 'Executive Hall',
      batch: 'Weekend CSS Group',
      color: '#b45309', // Dark Amber
      notes: 'Geopolitical analysis, constitutional history, and analytical essay drafting.',
      status: 'Active'
    },
    {
      course: 'Robotics & STEM for Young Minds',
      subject: 'Applied Robotics & Microcontrollers',
      teacher_name: 'Sir Hamza Ali',
      days: JSON.stringify(['Sat', 'Sun']),
      start_time: '14:00',
      end_time: '16:00',
      start_date: '2026-10-05',
      end_date: '2027-02-28',
      room: 'STEM Robotics Lab',
      batch: 'Junior Explorers',
      color: '#ea580c', // Orange
      notes: 'Sensors, Arduino programming, motor drivers, and obstacle-avoiding bot project.',
      status: 'Active'
    },
    {
      course: 'Executive Leadership & Tech Mastery',
      subject: 'AI & Machine Learning Studio',
      teacher_name: 'Dr. Hamza Farooq',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
      start_time: '20:00',
      end_time: '21:30',
      start_date: '2026-09-01',
      end_date: '2027-06-30',
      room: 'Executive Tech Suite 1',
      batch: 'Evening Executive',
      color: '#10b981', // Emerald
      notes: 'Applied deep learning, neural networks, and modern AI industry workflows.',
      status: 'Active'
    },
    {
      course: 'Spoken English & Debate Forum',
      subject: 'Public Speaking & Rhetoric',
      teacher_name: 'Ms. Areeba Naveed',
      days: JSON.stringify(['Mon', 'Wed', 'Fri']),
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

  const insertStmt = db.prepare(`
    INSERT INTO classes (course, subject, teacher_name, days, start_time, end_time, start_date, end_date, room, batch, color, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of sampleClasses) {
    insertStmt.run(
      c.course,
      c.subject,
      c.teacher_name,
      c.days,
      c.start_time,
      c.end_time,
      c.start_date,
      c.end_date,
      c.room,
      c.batch,
      c.color,
      c.notes,
      c.status
    );
  }
}

// Queries
function getAllClasses(filters = {}) {
  let query = 'SELECT * FROM classes WHERE 1=1';
  const params = [];

  if (filters.subject) {
    query += ' AND LOWER(subject) = LOWER(?)';
    params.push(filters.subject);
  }

  if (filters.teacher_name) {
    query += ' AND LOWER(teacher_name) = LOWER(?)';
    params.push(filters.teacher_name);
  }

  if (filters.course) {
    query += ' AND LOWER(course) = LOWER(?)';
    params.push(filters.course);
  }

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.search) {
    query += ' AND (course LIKE ? OR subject LIKE ? OR teacher_name LIKE ? OR room LIKE ?)';
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY start_time ASC, course ASC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  // Parse days JSON array for each row
  return rows.map(row => {
    let parsedDays = [];
    try {
      parsedDays = JSON.parse(row.days);
    } catch {
      parsedDays = row.days.split(',').map(d => d.trim());
    }
    return {
      ...row,
      days: parsedDays
    };
  });
}

function getClassById(id) {
  const stmt = db.prepare('SELECT * FROM classes WHERE id = ?');
  const row = stmt.get(id);
  if (!row) return null;
  try {
    row.days = JSON.parse(row.days);
  } catch {
    row.days = row.days.split(',').map(d => d.trim());
  }
  return row;
}

function addClass(data) {
  const stmt = db.prepare(`
    INSERT INTO classes (
      course, subject, teacher_name, days, start_time, end_time,
      start_date, end_date, room, batch, color, notes, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const daysStr = Array.isArray(data.days) ? JSON.stringify(data.days) : data.days;

  const result = stmt.run(
    data.course.trim(),
    data.subject.trim(),
    data.teacher_name.trim(),
    daysStr,
    data.start_time.trim(),
    data.end_time.trim(),
    data.start_date.trim(),
    data.end_date.trim(),
    (data.room || 'Room 101').trim(),
    (data.batch || 'Regular Batch').trim(),
    data.color || '#4f46e5',
    (data.notes || '').trim(),
    data.status || 'Active'
  );

  return getClassById(result.lastInsertRowid);
}

function updateClass(id, data) {
  const stmt = db.prepare(`
    UPDATE classes SET
      course = ?,
      subject = ?,
      teacher_name = ?,
      days = ?,
      start_time = ?,
      end_time = ?,
      start_date = ?,
      end_date = ?,
      room = ?,
      batch = ?,
      color = ?,
      notes = ?,
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const daysStr = Array.isArray(data.days) ? JSON.stringify(data.days) : data.days;

  stmt.run(
    data.course.trim(),
    data.subject.trim(),
    data.teacher_name.trim(),
    daysStr,
    data.start_time.trim(),
    data.end_time.trim(),
    data.start_date.trim(),
    data.end_date.trim(),
    (data.room || 'Room 101').trim(),
    (data.batch || 'Regular Batch').trim(),
    data.color || '#4f46e5',
    (data.notes || '').trim(),
    data.status || 'Active',
    id
  );

  return getClassById(id);
}

function deleteClass(id) {
  const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

function getStats() {
  const totalClasses = db.prepare('SELECT COUNT(*) as count FROM classes').get().count;
  const activeClasses = db.prepare("SELECT COUNT(*) as count FROM classes WHERE status = 'Active'").get().count;
  const uniqueTeachers = db.prepare('SELECT COUNT(DISTINCT teacher_name) as count FROM classes').get().count;
  const uniqueCourses = db.prepare('SELECT COUNT(DISTINCT course) as count FROM classes').get().count;
  const uniqueSubjects = db.prepare('SELECT COUNT(DISTINCT subject) as count FROM classes').get().count;

  return {
    totalClasses,
    activeClasses,
    uniqueTeachers,
    uniqueCourses,
    uniqueSubjects
  };
}

function getDistinctMetadata() {
  const courses = db.prepare('SELECT DISTINCT course FROM classes ORDER BY course ASC').all().map(r => r.course);
  const subjects = db.prepare('SELECT DISTINCT subject FROM classes ORDER BY subject ASC').all().map(r => r.subject);
  const teachers = db.prepare('SELECT DISTINCT teacher_name FROM classes ORDER BY teacher_name ASC').all().map(r => r.teacher_name);
  const rooms = db.prepare('SELECT DISTINCT room FROM classes ORDER BY room ASC').all().map(r => r.room);

  return { courses, subjects, teachers, rooms };
}

function resetToDefault() {
  db.exec('DELETE FROM classes');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'classes'");
  seedDemoData();
  return getAllClasses();
}

// Initialise DB immediately
initDatabase();

module.exports = {
  db,
  getAllClasses,
  getClassById,
  addClass,
  updateClass,
  deleteClass,
  getStats,
  getDistinctMetadata,
  resetToDefault
};
