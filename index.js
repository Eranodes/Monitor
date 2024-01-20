const fs = require('fs');
const path = require('path');
require('dotenv').config();
const axios = require('axios');

const mainWebsiteUrl = process.env.MAIN_WEBSITE;
const dashboardWebsiteUrl = process.env.DASHBOARD_WEBSITE;
const panelWebsiteUrl = process.env.PANEL_WEBSITE;

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

const checkWebsiteStatus = async (websiteUrl, websiteName) => {
  try {
    const response = await axiosInstance.get(`http://${websiteUrl}`); // Add http:// protocol
    const status = response.status === 200 ? 'UP' : 'DOWN';

    // Log online/offline status to console (excluding response for UP case)
    if (status === 'UP') {
      console.log(`${websiteName} (${websiteUrl}) is ${status}`);
    } else {
      console.error(`${websiteName} (${websiteUrl}) is ${status}`);
    }

    // Append full response details to sites.log for both online and offline cases
    const logMessage = `${new Date().toISOString()} - ${websiteName} (${websiteUrl}) is ${status}. Full Response: ${JSON.stringify(response.data)}\n`;
    fs.appendFile(path.join(__dirname, 'sites.log'), logMessage, (err) => {
      if (err) {
        console.error('Error appending to sites.log:', err);
      }
    });
  } catch (error) {
    // Log offline status to console
    console.error(`${websiteName} (${websiteUrl}) is DOWN`);

    // Append full response details to sites.log for offline case
    const logMessage = `${new Date().toISOString()} - ${websiteName} (${websiteUrl}) is DOWN. Error: ${error.message}\n`;
    fs.appendFile(path.join(__dirname, 'sites.log'), logMessage, (err) => {
      if (err) {
        console.error('Error appending to sites.log:', err);
      }
    });
  }
};

// Check the status of each website
checkWebsiteStatus(mainWebsiteUrl, 'Main Website');
checkWebsiteStatus(dashboardWebsiteUrl, 'Dashboard Website');
checkWebsiteStatus(panelWebsiteUrl, 'Panel Website');
