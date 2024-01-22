const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

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

const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;
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

const sendDiscordLog = async (embed) => {
  try {
    await axios.post(LOG_WEBHOOK_URL, { embeds: [embed] });
  } catch (error) {
    console.error('Error sending Discord log:', error.message);
  }
};

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

    // Log to console
    logToConsole(level, message);

    // Log to file
    const logFilePath = getLogFilePath();
    logToFile(logFilePath, `[${level.toUpperCase()}] ${message}`);

    // Log to Discord webhook
    if (LOG_WEBHOOK_URL) {
      const embed = {
        title: `[${level.toUpperCase()}] Log Update`,
        description: message,
        color: level === LOG_LEVELS.ERROR ? 0xff0000 : level === LOG_LEVELS.WARN ? 0xffcc00 : 0x00ff00,
        timestamp: new Date().toISOString(),
      };
      await sendDiscordLog(embed);
    }
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
