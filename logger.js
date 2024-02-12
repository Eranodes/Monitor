const fs = require('fs');
const path = require('path');
require('dotenv').config;
const FormData = require('form-data');

const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const COLORS = {
  INFO: '\x1b[32m', // Green
  WARN: '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m', // Reset color
};

const LOG_QUEUE = [];
let IS_LOGGING = false;

const LOGS_FOLDER = path.join(__dirname, 'logs');

// Ensure the logs folder exists
if (!fs.existsSync(LOGS_FOLDER)) {
  fs.mkdirSync(LOGS_FOLDER);
}

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLogFilePath = () => {
  const currentDate = getCurrentDate();
  return path.join(LOGS_FOLDER, `${currentDate}.log`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logToConsole = (level, message) => {
  const color = COLORS[level.toUpperCase()] || '';
  console.log(`${color}[${level.toUpperCase()}]${COLORS.RESET} ${message}`);
};

const logToFile = (filePath, message) => {
  fs.appendFile(filePath, `${message}\n`, (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
    }
  });
};

const processLogQueue = async () => {
  IS_LOGGING = true;

  while (LOG_QUEUE.length > 0) {
    const { level, message } = LOG_QUEUE.shift();

    logToConsole(level, message);

    const logFilePath = getLogFilePath();
    logToFile(logFilePath, `[${level.toUpperCase()}] ${message}`);
  }

  IS_LOGGING = false;
};

const log = (level, message) => {
  LOG_QUEUE.push({ level, message });

  if (!IS_LOGGING) {
    processLogQueue();
  }
};

module.exports = {
  info: (message) => log(LOG_LEVELS.INFO, message),
  warn: (message) => log(LOG_LEVELS.WARN, message),
  error: (message) => log(LOG_LEVELS.ERROR, message),
};
