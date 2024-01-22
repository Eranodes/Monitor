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

const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;
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

const sendDiscordLog = async (embed) => {
  let retryAttempts = 3; // Number of retry attempts
  let backoffDelay = 1000; // Initial backoff delay (1 second)
  let lastRetryTimestamp = 0;

  while (retryAttempts > 0) {
    try {
      if (embed.description && embed.description.length > 2000) {
        // If the embed description is too long, send as a text file
        const logFilePath = getLogFilePath();
        fs.writeFileSync(logFilePath, embed.description);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(logFilePath));

        await axios.post(LOG_WEBHOOK_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Remove the temporary log file after sending
        fs.unlinkSync(logFilePath);
      } else {
        // If the embed description is within limits, send as embed
        await axios.post(LOG_WEBHOOK_URL, { embeds: [embed] });
      }

      return; // If successful, exit the retry loop
    } catch (error) {
      console.error('Error sending Discord log:', error.message);

      // If the error is due to rate limiting
      if (error.response && error.response.status === 429) {
        const currentTime = Date.now();

        // If it's been less than 10 minutes since the last retry, add to the queue
        if (currentTime - lastRetryTimestamp < RETRY_INTERVAL) {
          logToConsole(
            LOG_LEVELS.WARN,
            `Webhook is rate-limited. Adding log to queue. Retry in ${(RETRY_INTERVAL - (currentTime - lastRetryTimestamp)) / 1000} seconds.`
          );
          logToQueue(embed); // Add the log to the queue
          return;
        }

        // If it's been 10 minutes or more, reset backoff delay and retry
        backoffDelay = 1000; // Reset backoff delay to 1 second
        lastRetryTimestamp = currentTime;
      } else {
        // Log to console in case of other errors
        logToConsole(LOG_LEVELS.ERROR, `Failed to send log to Discord webhook. Retrying... (${retryAttempts} attempts left)`);

        // Adjust backoff delay using exponential backoff
        backoffDelay = Math.min(backoffDelay * 2, BACKOFF_MAX_DELAY);
      }

      // Sleep for the backoff delay before retrying
      await sleep(backoffDelay);

      retryAttempts--;
    }
  }

  // Log an error message if all retry attempts fail
  logToConsole(LOG_LEVELS.ERROR, 'Failed to send log to Discord webhook after multiple attempts. Check error above.');
};

// Function to add log to the queue
const logToQueue = (embed) => {
  log(LOG_LEVELS.ERROR, 'Adding log to queue for later retry.');
  LOG_QUEUE.push({ level: LOG_LEVELS.ERROR, message: '', embed });
  processLogQueue(); // Attempt to process the queue immediately
};

// Function to sleep for a given duration
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

    // Log to console
    logToConsole(level, message);

    // Log to file
    const logFilePath = getLogFilePath();
    logToFile(logFilePath, `[${level.toUpperCase()}] ${message}`);

    // Log to Discord webhook
    if (LOG_WEBHOOK_URL) {
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
