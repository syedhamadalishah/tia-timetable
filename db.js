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
  const row = stmt.get(Number(id) || id);
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
    Number(id) || id
  );

  return getClassById(id);
}

function deleteClass(id) {
  const stmt = db.prepare('DELETE FROM classes WHERE id = ?');
  const result = stmt.run(Number(id) || id);
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

function clearAllClasses() {
  db.exec('DELETE FROM classes');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'classes'");
  return true;
}

function resetToDefault() {
  db.exec('DELETE FROM classes');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'classes'");
  return [];
}

// Initialise DB schema immediately
initDatabase();

module.exports = {
  db,
  getAllClasses,
  getClassById,
  addClass,
  updateClass,
  deleteClass,
  clearAllClasses,
  getStats,
  getDistinctMetadata,
  resetToDefault
};
