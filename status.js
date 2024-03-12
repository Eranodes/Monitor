const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('./logger');

dotenv.config();

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

const discordWebhookUrl = process.env.DISCORD_WEBHOOK;

const sendDiscordNotification = (websiteName, status) => {
  if (discordWebhookUrl && status === 'DOWN') {
    const embed = {
      title: 'Website Status Update',
      description: `${websiteName}: ${status}`,
      color: status === 'UP' ? 0x00ff00 : 0xff0000, // Green for UP, Red for DOWN
      timestamp: new Date().toISOString(),
    };

    axios.post(discordWebhookUrl, {
      embeds: [embed],
    })
    .then(() => {
      logger.info('Discord notification sent successfully.');
    })
    .catch((error) => {
      logger.error(`Error sending Discord notification: ${error.message}`);
    });
  }
};

const checkWebsiteStatus = async (websiteUrl, websiteName, folderName) => {
  try {
    logger.info(`Checking status of ${websiteName} (${websiteUrl})...`);

    const response = await axiosInstance.get(`http://${websiteUrl}`);
    let status;

    if (response.status === 200) {
      status = 'UP';
    } else if (response.status === 502) {
      logger.warn(`${websiteName} (${websiteUrl}) returned a 502 status. Skipping JSON log.`);
      return; // Do nothing for 502 status
    } else {
      status = 'DOWN';
    }

    // Log status to data file
    logStatus(websiteName, status, folderName);

    // Send Discord notification
    sendDiscordNotification(websiteName, status);
  } catch (error) {
    // Handle specific errors
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // other than 2xx (e.g., 404, 500).
        logger.error(`Server responded with status ${error.response.status} for ${websiteName} (${websiteUrl}).`);
      } else if (error.request) {
        // The request was made but no response was received.
        logger.error(`No response received for ${websiteName} (${websiteUrl}).`);
      } else {
        // Something happened in setting up the request that triggered an Error.
        logger.error(`Error setting up request for ${websiteName} (${websiteUrl}): ${error.message}`);
      }
    } else {
      // Handle other types of errors (e.g., network issues, timeouts)
      logger.error(`Error checking status for ${websiteName} (${websiteUrl}): ${error.message}`);
    }

    // Log status to data file for DOWN status
    logStatus(websiteName, 'DOWN', folderName);

    // Send Discord notification for DOWN status
    sendDiscordNotification(websiteName, 'DOWN');
  }
};

const logStatus = (websiteName, status, folderName) => {
  const statusEntry = {
    timestamp: new Date().toISOString(),
    status: status,
  };

  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = String(currentDate.getFullYear());

  const fileName = `${day}${month}${year}.json`;
  const filePath = path.join(__dirname, 'public', 'assets', 'data', folderName);

  // Ensure the directory structure exists
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  const fullPath = path.join(filePath, fileName);

  let statusData = [];

  try {
    const existingStatus = fs.readFileSync(fullPath, 'utf8');
    statusData = JSON.parse(existingStatus);
  } catch (error) {
    // File doesn't exist or is empty
  }

  statusData.push({
    ...statusEntry,
  });

  fs.writeFileSync(fullPath, JSON.stringify(statusData, null, 2), 'utf8');
  logger.info(`Status of ${websiteName} updated to: ${status}`);
};

const checkStatusOnStartup = async () => {
  for (const website of websites) {
    await checkWebsiteStatus(website.url, website.name, website.folder);
  }

  // Schedule status checks every 1 minute (60000 milliseconds)
  setInterval(async () => {
    for (const website of websites) {
      await checkWebsiteStatus(website.url, website.name, website.folder);
    }
  }, 60000);
};

const websites = [
  { url: process.env.MAIN_WEBSITE, name: 'Main Website', folder: 'main' },
  { url: process.env.DASHBOARD_WEBSITE, name: 'Dashboard Website', folder: 'dashboard' },
  { url: process.env.PANEL_WEBSITE, name: 'Panel Website', folder: 'panel' },
];

const port = process.env.PORT_2 || 3001;

logger.info(`Status check server is running on http://localhost:${port}`);
// Check website status on startup
checkStatusOnStartup();

module.exports = {
  checkStatusOnStartup,
  checkWebsiteStatus,
};
