const express = require('express');
const basicAuth = require('express-basic-auth');
const path = require('path');
const db = require('../server/db');
const fs = require('fs');

const app = express();
const port = 3002;

// Use environment variables for basic auth credentials.
// Example: export ADMIN_USER=admin && export ADMIN_PASSWORD=secret
const users = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'password'
};

app.use(basicAuth({
  users,
  challenge: true,
  realm: 'AdminArea',
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to get all stations
app.get('/api/stations', (req, res) => {
  db.query('SELECT id, label FROM stations ORDER BY label', (err, results) => {
    if (err) {
      console.error('Error fetching stations:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Endpoint to get all submissions with filtering
app.get('/api/submissions', (req, res) => {
  const { station_id, answer_type } = req.query;

  let sql = 'SELECT DISTINCT s.* FROM submissions s';
  const params = [];

  if (answer_type && answer_type !== 'all') {
    sql += ' JOIN answers a ON s.id = a.submission_id WHERE a.type = ?';
    params.push(answer_type);
  }

  if (station_id && station_id !== 'all') {
    if (params.length > 0) {
      sql += ' AND s.station_id = ?';
    } else {
      sql += ' WHERE s.station_id = ?';
    }
    params.push(station_id);
  }

  sql += ' ORDER BY s.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching submissions for admin panel:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});


// Endpoint to get a single submission with its answers and question titles
app.get('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  const submissionSql = 'SELECT * FROM submissions WHERE id = ?';
  const answersSql = `
    SELECT a.*, q.title AS question_title
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.submission_id = ?
  `;

  db.query(submissionSql, [id], (err, submissionResults) => {
    if (err) {
      console.error('Error fetching submission:', err);
      return res.status(500).send(err);
    }
    if (submissionResults.length === 0) return res.status(404).send('Submission not found');

    db.query(answersSql, [id], (err, answersResults) => {
      if (err) {
        console.error('Error fetching answers with questions:', err);
        return res.status(500).send(err);
      }
      res.json({ submission: submissionResults[0], answers: answersResults });
    });
  });
});

// Endpoint to update a submission
app.put('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  const { station_id, gender, age, resident } = req.body;
  const sql = 'UPDATE submissions SET station_id = ?, gender = ?, age = ?, resident = ?, updated_at = NOW() WHERE id = ?';
  const params = [station_id, gender, age, resident, id];

  db.query(sql, params, (err, result) => {
    if (err) {
        console.error('Error updating submission:', err);
        return res.status(500).send(err);
    }
    res.json({ message: 'Submission updated successfully' });
  });
});

// Endpoint to delete a submission
app.delete('/api/submissions/:id', (req, res) => {
  const { id } = req.params;
  const deleteAnswersSql = 'DELETE FROM answers WHERE submission_id = ?';
  const deleteSubmissionSql = 'DELETE FROM submissions WHERE id = ?';

  db.query(deleteAnswersSql, [id], (err, result) => {
    if (err) {
        console.error('Error deleting answers for submission:', err);
        return res.status(500).send(err);
    }

    db.query(deleteSubmissionSql, [id], (err, result) => {
      if (err) {
        console.error('Error deleting submission:', err);
        return res.status(500).send(err);
      }
      res.json({ message: 'Submission and associated answers deleted successfully' });
    });
  });
});

// Endpoint to delete an answer
app.delete('/api/answers/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM answers WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
        console.error('Error deleting answer:', err);
        return res.status(500).send(err);
    }
    res.json({ message: 'Answer deleted successfully' });
  });
});

// Endpoint to update an answer
app.put('/api/answers/:id', (req, res) => {
  const { id } = req.params;
  const { text_content } = req.body;
  const sql = 'UPDATE answers SET text_content = ?, updated_at = NOW() WHERE id = ?';
  const params = [text_content, id];

  db.query(sql, params, (err, result) => {
    if (err) {
        console.error('Error updating answer:', err);
        return res.status(500).send(err);
    }
    res.json({ message: 'Answer updated successfully' });
  });
});

// Endpoint to serve audio files
app.get('/api/audio/:filename', (req, res) => {
  const { filename } = req.params;
  // Sanitize the filename to prevent path traversal
  const sanitizedFilename = path.basename(filename);
  const uploadsDir = path.join(__dirname, '..', 'server', 'uploads');
  const filePath = path.join(uploadsDir, sanitizedFilename);

  // Verify the resolved path is within the uploads directory
  if (filePath.indexOf(uploadsDir) !== 0) {
    return res.status(403).send('Forbidden');
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.sendFile(filePath);
  });
});

// --- Metrics Endpoints ---

// Endpoint for raw submissions data
app.get('/api/metrics/submissions', (req, res) => {
  const sql = `
    SELECT
      id,
      station_id,
      timestamp,
      gender,
      age,
      resident,
      created_at
    FROM submissions
    ORDER BY created_at ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching metrics/submissions:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// Endpoint for raw answers data
app.get('/api/metrics/answers', (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.submission_id,
      s.station_id,
      a.question_id,
      a.type,
      a.created_at
    FROM answers a
    JOIN submissions s ON a.submission_id = s.id
    ORDER BY a.created_at ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching metrics/answers:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Admin server listening at http://localhost:${port}`);
});
