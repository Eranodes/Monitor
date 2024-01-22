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

const sendDiscordLog = async (embed) => {
  let retryAttempts = 3; // Number of retry attempts
  let backoffDelay = 1000; // Initial backoff delay (1 second)
  let lastRetryTimestamp = 0;

  while (retryAttempts > 0) {
    try {
      const webhookUrl = getNextWebhookUrl();

      if (embed.description && embed.description.length > 2000) {
        const logFilePath = getLogFilePath();
        fs.writeFileSync(logFilePath, embed.description);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(logFilePath));

        await axios.post(webhookUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        fs.unlinkSync(logFilePath);
      } else {
        await axios.post(webhookUrl, { embeds: [embed] });
      }

      return; // If successful, exit the retry loop
    } catch (error) {
      console.error('Error sending Discord log:', error.message);

      if (error.response && error.response.status === 429) {
        const currentTime = Date.now();

        if (currentTime - lastRetryTimestamp < RETRY_INTERVAL) {
          logToConsole(
            LOG_LEVELS.WARN,
            `Webhook is rate-limited. Adding log to queue. Retry in ${(RETRY_INTERVAL - (currentTime - lastRetryTimestamp)) / 1000} seconds.`
          );
          logToQueue(embed);
          return;
        }

        backoffDelay = 1000;
        lastRetryTimestamp = currentTime;
      } else {
        logToConsole(LOG_LEVELS.ERROR, `Failed to send log to Discord webhook. Retrying... (${retryAttempts} attempts left)`);
        backoffDelay = Math.min(backoffDelay * 2, BACKOFF_MAX_DELAY);
      }

      await sleep(backoffDelay);

      retryAttempts--;
    }
  }

  logToConsole(LOG_LEVELS.ERROR, 'Failed to send log to Discord webhook after multiple attempts. Check error above.');
};

const logToQueue = (embed) => {
  log(LOG_LEVELS.ERROR, 'Adding log to queue for later retry.');
  LOG_QUEUE.push({ level: LOG_LEVELS.ERROR, message: '', embed });
  processLogQueue();
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
    const { level, message, embed } = LOG_QUEUE.shift();

    logToConsole(level, message);

    const logFilePath = getLogFilePath();
    logToFile(logFilePath, `[${level.toUpperCase()}] ${message}`);

    if (LOG_WEBHOOK_URLS.length > 0) {
      const newEmbed = embed || {
        title: `[${level.toUpperCase()}] Log Update`,
        description: message,
        color: level === LOG_LEVELS.ERROR ? 0xff0000 : level === LOG_LEVELS.WARN ? 0xffcc00 : 0x00ff00,
        timestamp: new Date().toISOString(),
      };
      await sendDiscordLog(newEmbed);
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
