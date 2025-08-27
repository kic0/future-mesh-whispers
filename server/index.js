const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

const corsOptions = {
  origin: true, // Reflect the request origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const { submission_id, question_id } = req.body;
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const originalExt = path.extname(file.originalname) || '.webm';
    const filename = `${submission_id}_${question_id}_${timestamp}${originalExt}`;
    cb(null, filename);
  },
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

// Endpoint to get all questions
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions ORDER BY id', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Endpoint to get today's submission count
app.get('/submissions/count/today', (req, res) => {
  const sql = `
    SELECT COUNT(id) as count
    FROM submissions
    WHERE DATE(created_at) = CURDATE()
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    const count = results[0].count || 0;
    res.json({ count });
  });
});

// Endpoint to create a submission
app.post('/submissions', (req, res) => {
  const { station_id, timestamp, gender, age, resident, consent_given, consent_version, consent_purpose } = req.body;
  const sql = 'INSERT INTO submissions (station_id, timestamp, gender, age, resident, consent_given, consent_version, consent_purpose, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  const params = [station_id, timestamp, gender, age, resident, consent_given, consent_version, consent_purpose];
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.status(201).send({ id: result.insertId, ...req.body });
  });
});

// Endpoint to save an answer
app.post('/answers', (req, res) => {
  const answers = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).send('Expected an array of answers.');
  }

  const sql = 'INSERT INTO answers (submission_id, question_id, type, storage_path, mime_type, size_bytes, duration_seconds, text_content, created_at) VALUES ?';
  const values = answers.map(answer => [
    answer.submission_id,
    answer.question_id,
    answer.type,
    answer.storage_path,
    answer.mime_type,
    answer.size_bytes,
    answer.duration_seconds,
    answer.text_content,
    new Date()
  ]);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.status(201).send({ insertId: result.insertId });
  });
});

// Endpoint for file uploads
app.post('/upload', upload.any(), (req, res) => {
  const file = req.files && req.files.length > 0 ? req.files[0] : null;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  // The other fields are in req.body
  console.log('File uploaded:', file);
  console.log('Body:', req.body);
  res.status(201).send({ path: file.filename });
});

// Endpoint for submit_survey RPC
app.post('/rpc/submit_survey', (req, res) => {
    const { station_id_arg, gender_arg, age_arg, resident_arg } = req.body;
    const sql = 'INSERT INTO submissions (station_id, gender, age, resident, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())';
    const params = [station_id_arg, gender_arg, age_arg, resident_arg];
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }
        res.status(200).send(result.insertId.toString());
        // Update stats asynchronously
        updateStats().catch(console.error);
    });
});

async function updateStats() {
  console.log('Updating stats...');
  // 1. Daily submission counts
  const dailyCountsSql = `
    SELECT DATE(created_at) as stat_date, station_id, COUNT(id) as submission_count
    FROM submissions
    GROUP BY stat_date, station_id
    ORDER BY stat_date, station_id;
  `;
  const [dailyCounts] = await db.promise().query(dailyCountsSql);

  const dailyCountsData = {};
  for (const row of dailyCounts) {
    const date = row.stat_date.toISOString().slice(0, 10);
    if (!dailyCountsData[date]) {
      dailyCountsData[date] = {};
    }
    dailyCountsData[date][row.station_id] = row.submission_count;
  }

  for (const date in dailyCountsData) {
    const key = `daily_counts_${date}`;
    const value = JSON.stringify(dailyCountsData[date]);
    await db.promise().query('INSERT INTO stats (stat_key, stat_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE stat_value = ?', [key, value, value]);
  }

  // 2. Other stats
  const queries = {
    'submissions_total': 'SELECT COUNT(*) as total FROM submissions',
    'submissions_by_station': 'SELECT station_id, COUNT(*) as total FROM submissions GROUP BY station_id',
    'answers_total': 'SELECT COUNT(*) as total FROM answers',
    'answers_by_station': 'SELECT s.station_id, COUNT(a.id) as total FROM answers a JOIN submissions s ON a.submission_id = s.id GROUP BY s.station_id',
    'answers_by_type': 'SELECT type, COUNT(*) as total FROM answers GROUP BY type',
    'answers_by_type_by_station': 'SELECT s.station_id, a.type, COUNT(a.id) as total FROM answers a JOIN submissions s ON a.submission_id = s.id GROUP BY s.station_id, a.type',
    'age_distribution': 'SELECT age, COUNT(*) as total FROM submissions WHERE age IS NOT NULL GROUP BY age ORDER BY age',
    'age_distribution_by_station': 'SELECT station_id, age, COUNT(*) as total FROM submissions WHERE age IS NOT NULL GROUP BY station_id, age ORDER BY station_id, age',
    'gender_distribution': 'SELECT gender, COUNT(*) as total FROM submissions WHERE gender IS NOT NULL GROUP BY gender ORDER BY gender',
    'gender_distribution_by_station': 'SELECT station_id, gender, COUNT(*) as total FROM submissions WHERE gender IS NOT NULL GROUP BY station_id, gender ORDER BY station_id, gender',
    'resident_distribution': 'SELECT resident, COUNT(*) as total FROM submissions WHERE resident IS NOT NULL GROUP BY resident',
    'resident_distribution_by_station': 'SELECT station_id, resident, COUNT(*) as total FROM submissions WHERE resident IS NOT NULL GROUP BY station_id, resident'
  };

  for (const key in queries) {
    const [rows] = await db.promise().query(queries[key]);
    const value = JSON.stringify(rows);
    await db.promise().query('INSERT INTO stats (stat_key, stat_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE stat_value = ?', [key, value, value]);
  }
  console.log('Stats updated successfully');
}

app.post('/stats/update', async (req, res) => {
  try {
    await updateStats();
    res.status(200).send('Stats updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update stats');
  }
});

app.get('/stats', (req, res) => {
  db.query('SELECT * FROM stats', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    const stats = {};
    for (const row of results) {
      stats[row.stat_key] = JSON.parse(row.stat_value);
    }
    res.json(stats);
  });
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
