const express = require('express');
const cors = require('cors');
const path = require('node:path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Calculate day name and time in minutes
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function getDayAbbr(dateObj) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dateObj.getDay()];
}

// REST APIs

// 1. Get All Classes (with filters)
app.get('/api/classes', (req, res) => {
  try {
    const filters = {
      course: req.query.course,
      subject: req.query.subject,
      teacher_name: req.query.teacher_name,
      status: req.query.status,
      search: req.query.search
    };
    const classes = db.getAllClasses(filters);
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Get Live Classes Status (Running Now, Upcoming Today, Completed Today)
app.get('/api/classes/live', (req, res) => {
  try {
    const all = db.getAllClasses({ status: 'Active' });
    const now = new Date();

    // Check for simulated time (useful for demos and testing)
    const currentDay = req.query.simulate_day || getDayAbbr(now);
    let currentHours = now.getHours();
    let currentMinutes = now.getMinutes();

    if (req.query.simulate_time) {
      const [sh, sm] = req.query.simulate_time.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm)) {
        currentHours = sh;
        currentMinutes = sm;
      }
    }

    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const todayStr = now.toISOString().slice(0, 10);

    const runningNow = [];
    const upcomingToday = [];
    const completedToday = [];

    all.forEach(cls => {
      // Check day matching
      const matchesDay = Array.isArray(cls.days) && cls.days.some(d => d.toLowerCase().startsWith(currentDay.toLowerCase().slice(0, 3)));
      if (!matchesDay) return;

      // Check date validity
      if (cls.start_date && todayStr < cls.start_date) return;
      if (cls.end_date && todayStr > cls.end_date) return;

      const startMin = timeToMinutes(cls.start_time);
      const endMin = timeToMinutes(cls.end_time);
      const durationMin = endMin - startMin;

      if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
        // Currently Running
        const elapsedMin = currentTotalMinutes - startMin;
        const remainingMin = endMin - currentTotalMinutes;
        const progressPercent = durationMin > 0 ? Math.min(100, Math.round((elapsedMin / durationMin) * 100)) : 0;

        runningNow.push({
          ...cls,
          live_status: 'RUNNING',
          elapsed_minutes: elapsedMin,
          remaining_minutes: remainingMin,
          duration_minutes: durationMin,
          progress_percent: progressPercent
        });
      } else if (currentTotalMinutes < startMin) {
        // Upcoming Today
        const startsInMin = startMin - currentTotalMinutes;
        upcomingToday.push({
          ...cls,
          live_status: 'UPCOMING',
          starts_in_minutes: startsInMin
        });
      } else if (currentTotalMinutes >= endMin) {
        // Completed Today
        completedToday.push({
          ...cls,
          live_status: 'COMPLETED'
        });
      }
    });

    // Sort upcoming by earliest start time
    upcomingToday.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

    res.json({
      success: true,
      current_time: `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`,
      current_day: currentDay,
      is_simulated: Boolean(req.query.simulate_day || req.query.simulate_time),
      running_now: runningNow,
      upcoming_today: upcomingToday,
      completed_today: completedToday,
      summary: {
        running_count: runningNow.length,
        upcoming_count: upcomingToday.length,
        completed_count: completedToday.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Get Class by ID
app.get('/api/classes/:id', (req, res) => {
  try {
    const cls = db.getClassById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    res.json({ success: true, data: cls });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Create New Class
app.post('/api/classes', (req, res) => {
  try {
    const { course, subject, teacher_name, days, start_time, end_time, start_date, end_date } = req.body;

    // Validation
    const missing = [];
    if (!course) missing.push('course');
    if (!subject) missing.push('subject');
    if (!teacher_name) missing.push('teacher_name');
    if (!days || (Array.isArray(days) && days.length === 0)) missing.push('days');
    if (!start_time) missing.push('start_time');
    if (!end_time) missing.push('end_time');
    if (!start_date) missing.push('start_date');
    if (!end_date) missing.push('end_date');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Validate times
    if (timeToMinutes(start_time) >= timeToMinutes(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date'
      });
    }

    const created = db.addClass(req.body);
    res.status(201).json({ success: true, message: 'Class created successfully', data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Update Class
app.put('/api/classes/:id', (req, res) => {
  try {
    const existing = db.getClassById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const { course, subject, teacher_name, days, start_time, end_time, start_date, end_date } = req.body;
    if (!course || !subject || !teacher_name || !days || !start_time || !end_time || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Course, subject, teacher, days, timing, and date range are all required'
      });
    }

    if (timeToMinutes(start_time) >= timeToMinutes(end_time)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const updated = db.updateClass(req.params.id, req.body);
    res.json({ success: true, message: 'Class updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Delete Class
app.delete('/api/classes/:id', (req, res) => {
  try {
    const existing = db.getClassById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    db.deleteClass(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Get Metadata & Statistics
app.get('/api/metadata', (req, res) => {
  try {
    const meta = db.getDistinctMetadata();
    res.json({ success: true, data: meta });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Database Reset & Backup / Restore
app.post('/api/reset-demo', (req, res) => {
  try {
    const data = db.resetToDefault();
    res.json({ success: true, message: 'Reset database to demo schedule', count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/export', (req, res) => {
  try {
    const data = db.getAllClasses();
    res.setHeader('Content-disposition', 'attachment; filename=tia_classes_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/import', (req, res) => {
  try {
    const classes = req.body;
    if (!Array.isArray(classes)) {
      return res.status(400).json({ success: false, message: 'Expected an array of class objects' });
    }

    let importedCount = 0;
    for (const c of classes) {
      if (c.course && c.subject && c.teacher_name && c.days && c.start_time && c.end_time && c.start_date && c.end_date) {
        db.addClass(c);
        importedCount++;
      }
    }

    res.json({ success: true, message: `Successfully imported ${importedCount} classes` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback to index.html for SPA routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  The Inspirational Academy - Timetable Portal`);
  console.log(`  Server running on port ${PORT} (0.0.0.0:${PORT})`);
  console.log(`  Database: tia_timetable.db (SQLite)`);
  console.log(`====================================================`);
});
