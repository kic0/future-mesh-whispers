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
    const uniqueSuffix = Date.now();
    const originalExt = path.extname(file.originalname) || '.wav';
    const filename = `${submission_id}_${question_id}_${uniqueSuffix}${originalExt}`;
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
    });
});


app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
