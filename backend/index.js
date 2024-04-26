const express = require('express');
const { fork } = require('child_process');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors'); // Import cors middleware

// Use cors middleware to allow all origins
app.use(cors());

// Function to handle errors
const errorHandler = (res, error) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
};

// Function to get database connection
const getDB = (dbName) => {
  const dbPath = path.join(__dirname, 'data', dbName);
  return new sqlite3.Database(dbPath);
};

// Fork a child process for backend/status.js
const statusProcess = fork('backend/status.js');
console.log('Status child process started.');

// Forward events from the child process to the parent process
statusProcess.on('message', (message) => {
  console.log('Message from status child process:', message);
});

statusProcess.on('exit', (code, signal) => {
  console.log(`Status child process exited with code ${code} and signal ${signal}`);
});

// Route to get data from main website
app.get('/api/main', (req, res) => {
  const db = getDB('main.db');
  db.all('SELECT * FROM status', (err, rows) => {
    if (err) {
      errorHandler(res, err);
      return;
    }
    res.json(rows);
  });
  db.close();
});

// Route to get data from dashboard website
app.get('/api/dashboard', (req, res) => {
  const db = getDB('dashboard.db');
  db.all('SELECT * FROM status', (err, rows) => {
    if (err) {
      errorHandler(res, err);
      return;
    }
    res.json(rows);
  });
  db.close();
});

// Route to get data from panel website
app.get('/api/panel', (req, res) => {
  const db = getDB('panel.db');
  db.all('SELECT * FROM status', (err, rows) => {
    if (err) {
      errorHandler(res, err);
      return;
    }
    res.json(rows);
  });
  db.close();
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server is shut down.');
    process.exit(0);
  });
});
