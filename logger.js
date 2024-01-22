const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const FormData = require('form-data');

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

const EMOJIS = {
  INFO: 'ℹ️', // Information
  WARN: '⚠️', // Warning
  ERROR: '❌', // Error
};

const LOG_QUEUE = [];
let IS_LOGGING = false;

const LOG_WEBHOOK_URLS = process.env.LOG_WEBHOOK_URLS.split(',');
let CURRENT_WEBHOOK_INDEX = 0;

const LOGS_FOLDER = path.join(__dirname, 'logs');

const BACKOFF_MAX_DELAY = 60000; // Maximum backoff delay in milliseconds (1 minute)
const RETRY_INTERVAL = 600000; // Retry interval (10 minutes)

// Ensure the logs folder exists
if (!fs.existsSync(LOGS_FOLDER)) {
  fs.mkdirSync(LOGS_FOLDER);
}

const LOG_BATCH_SIZE = 5; // Number of log messages to include in each batch
let logCollector = [];

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

const getNextWebhookUrl = () => {
  const webhookUrl = LOG_WEBHOOK_URLS[CURRENT_WEBHOOK_INDEX];
  CURRENT_WEBHOOK_INDEX = (CURRENT_WEBHOOK_INDEX + 1) % LOG_WEBHOOK_URLS.length;
  return webhookUrl;
};

const sendBatchedDiscordLogs = async () => {
  if (logCollector.length === 0) {
    return; // No logs to send
  }

  const webhookUrl = getNextWebhookUrl();
  const logFilePath = getLogFilePath();
  const embeds = [];

  for (const { level, message } of logCollector) {
    const logEmbed = {
      title: `${EMOJIS[level.toUpperCase()]} [${level.toUpperCase()}] Log Update`,
      description: `\`\`\`\n${message}\n\`\`\``,
      color: level === LOG_LEVELS.ERROR ? 0xff0000 : level === LOG_LEVELS.WARN ? 0xffcc00 : 0x00ff00,
      timestamp: new Date().toISOString(),
    };
    embeds.push(logEmbed);
  }

  try {
    await axios.post(webhookUrl, { embeds });
    logCollector = []; // Clear the log collector after successful sending
  } catch (error) {
    console.error('Error sending batched Discord logs:', error.message);
    logToConsole(LOG_LEVELS.ERROR, 'Failed to send batched logs to Discord webhook. Retrying...');
    logToQueue({ level: LOG_LEVELS.ERROR, message: '', embed: { description: logCollector.map(({ message }) => message).join('\n\n') } });
    logCollector = []; // Clear the log collector after unsuccessful sending
  }
};

const logToCollector = (level, message) => {
  logCollector.push({ level, message });

  if (logCollector.length >= LOG_BATCH_SIZE) {
    sendBatchedDiscordLogs();
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logToConsole = (level, message) => {
  const emoji = EMOJIS[level.toUpperCase()] || '';
  const color = COLORS[level.toUpperCase()] || '';
  console.log(`${emoji} ${color}[${level.toUpperCase()}]${COLORS.RESET} ${message}`);
};

const logToFile = (filePath, message) => {
  fs.appendFile(filePath, `${message}\n`, (err) => {
    if (err) {
      console.error('Error appending to log file:', err);
    }
  });
};

const logToQueue = (logData) => {
  log(LOG_LEVELS.ERROR, 'Adding log to queue for later retry.');
  LOG_QUEUE.push(logData);
  processLogQueue();
};

const processLogQueue = async () => {
  IS_LOGGING = true;

  while (LOG_QUEUE.length > 0 || logCollector.length > 0) {
    if (LOG_QUEUE.length > 0) {
      const { level, message, embed } = LOG_QUEUE.shift();
      logToConsole(level, message);
      logToCollector(level, message);

      const logFilePath = getLogFilePath();
      logToFile(logFilePath, `[${level.toUpperCase()}] ${message}`);
    } else {
      await sendBatchedDiscordLogs(); // Process the log collector if the queue is empty
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
