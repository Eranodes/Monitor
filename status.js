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
  if (discordWebhookUrl) {
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

const checkWebsiteStatus = async (websiteUrl, websiteName) => {
  try {
    logger.info(`Checking status of ${websiteName} (${websiteUrl})...`);

    const response = await axiosInstance.get(`http://${websiteUrl}`);
    const status = response.status === 200 ? 'UP' : 'DOWN';

    // Append full response details to sites.log
    const logMessage = `${new Date().toISOString()} - ${websiteName} (${websiteUrl}) is ${status}. Full Response: ${JSON.stringify(response.data)}`;
    logger.info(logMessage);

    // Log status to status.json
    logStatus(websiteName, status);

    // Send Discord notification
    sendDiscordNotification(websiteName, status);
  } catch (error) {
    // Append full response details to sites.log for the offline case
    const logMessage = `${new Date().toISOString()} - ${websiteName} (${websiteUrl}) is DOWN. Error: ${error.message}`;
    logger.error(logMessage);

    // Log status to status.json
    logStatus(websiteName, 'DOWN');

    // Send Discord notification for DOWN status
    sendDiscordNotification(websiteName, 'DOWN');
  }
};

const logStatus = (websiteName, status) => {
  const statusEntry = {
    timestamp: new Date().toISOString(),
    status: status,
  };

  const statusFilePath = path.join(__dirname, 'public', 'assets', 'status.json');
  let statusData = [];

  try {
    const existingStatus = fs.readFileSync(statusFilePath, 'utf8');
    statusData = JSON.parse(existingStatus);
  } catch (error) {
    // File doesn't exist or is empty
  }

  statusData.push({
    website: websiteName,
    ...statusEntry,
  });

  fs.writeFileSync(statusFilePath, JSON.stringify(statusData, null, 2), 'utf8');
  logger.info(`Status of ${websiteName} updated to: ${status}`);
};

const checkStatusOnStartup = async () => {
  for (const website of websites) {
    await checkWebsiteStatus(website.url, website.name);
  }
};

const websites = [
  { url: process.env.MAIN_WEBSITE, name: 'Main Website' },
  { url: process.env.DASHBOARD_WEBSITE, name: 'Dashboard Website' },
  { url: process.env.PANEL_WEBSITE, name: 'Panel Website' },
];

const port = process.env.PORT_2 || 3001;

logger.info(`Status check server is running on http://localhost:${port}`);
// Check website status on startup
checkStatusOnStartup();

module.exports = {
  checkStatusOnStartup,
  checkWebsiteStatus,
};
