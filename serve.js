const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

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
    const response = await axiosInstance.get(`http://${websiteUrl}`);
    const status = response.status === 200 ? 'UP' : 'DOWN';

    // Append full response details to sites.log
    const logMessage = `${new Date().toISOString()} - ${websiteName} (${websiteUrl}) is ${status}. Full Response: ${JSON.stringify(response.data)}\n`;
    fs.appendFile(path.join(__dirname, 'sites.log'), logMessage, (err) => {
      if (err) {
        console.error('Error appending to sites.log:', err);
      }
    });
  } catch (error) {
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
const websites = [
  { url: process.env.MAIN_WEBSITE, name: 'Main Website' },
  { url: process.env.DASHBOARD_WEBSITE, name: 'Dashboard Website' },
  { url: process.env.PANEL_WEBSITE, name: 'Panel Website' },
];

app.get('/status', async (req, res) => {
  const statusArray = [];

  for (const website of websites) {
    try {
      const response = await axiosInstance.get(`http://${website.url}`);
      const status = response.status === 200 ? 'UP' : 'DOWN';
      statusArray.push({ name: website.name, status });
    } catch (error) {
      statusArray.push({ name: website.name, status: 'DOWN' });
    }
  }

  res.json(statusArray);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
