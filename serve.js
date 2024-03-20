const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');
const logger = require('./logger');
const packageJson = require('./package.json');

dotenv.config();

const app = express();
const port1 = process.env.PORT || 3000;
const port2 = process.env.PORT_2 || 3001;
const useHttps = process.env.USE_HTTPS === 'true';

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Start Message
const startMessage = `
  ███▄ ▄███▓ ▒█████   ███▄    █  ██▓▄▄▄█████▓ ▒█████   ██▀███  
  ▓██▒▀█▀ ██▒▒██▒  ██▒ ██ ▀█   █ ▓██▒▓  ██▒ ▓▒▒██▒  ██▒▓██ ▒ ██▒
  ▓██    ▓██░▒██░  ██▒▓██  ▀█ ██▒▒██▒▒ ▓██░ ▒░▒██░  ██▒▓██ ░▄█ ▒
  ▒██    ▒██ ▒██   ██░▓██▒  ▐▌██▒░██░░ ▓██▓ ░ ▒██   ██░▒██▀▀█▄  
  ▒██▒   ░██▒░ ████▓▒░▒██░   ▓██░░██░  ▒██▒ ░ ░ ████▓▒░░██▓ ▒██▒
  ░ ▒░   ░  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒ ░▓    ▒ ░░   ░ ▒░▒░▒░ ░ ▒▓ ░▒▓░
  ░  ░      ░  ░ ▒ ▒░ ░ ░░   ░ ▒░ ▒ ░    ░      ░ ▒ ▒░   ░▒ ░ ▒░
  ░      ░   ░ ░ ░ ▒     ░   ░ ░  ▒ ░  ░      ░ ░ ░ ▒    ░░   ░ 
           ░       ░ ░           ░  ░               ░ ░     ░     
                                                                                              
-----------------------
Author: G9 Aerospace
Website: https://g9aerospace.in
Repository: https://github.com/Eranodes/Monitor
-----------------------
Please read the license and readme.
Ensure your .env file is properly filled.
Using ${port1} for serving the status page and ${port2} for querying the eranodes sites!
For support, join our Discord server: https://discord.gg/jhju3spUbE
-----------------------
Server is running on port: ${port1} (${useHttps ? 'HTTPS' : 'HTTP'})
Version: ${packageJson.version}`;

// Function to check version from GitHub repository
async function checkVersion() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/Eranodes/Monitor/main/package.json');
        const githubPackageJson = response.data;
        const githubVersion = githubPackageJson.version;
        const localVersion = packageJson.version;

        if (githubVersion !== localVersion) {
            logger.warn(`The local version (${localVersion}) is different from the version at the repository (${githubVersion}). Please consider updating.`);
        } else {
            logger.info(`Local version matches the version at the repository (${localVersion}).`);
        }
    } catch (error) {
        logger.error(`Error checking version from the repository: ${error.message}`);
    }
}

if (useHttps) {
  // Load SSL certificate and private key
  const privateKey = fs.readFileSync('ssl/private-key.pem', 'utf8');
  const certificate = fs.readFileSync('ssl/certificate.pem', 'utf8');
  const credentials = { key: privateKey, cert: certificate };

  // Create an HTTPS server
  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(port1, () => {
    logger.info(startMessage);

    // Run the status check script on startup
    const statusCheckScript = require('./status');
    statusCheckScript.checkStatusOnStartup();

    // Check version from the repository
    checkVersion();
  });
} else {
  // Create an HTTP server
  const httpServer = http.createServer(app);

  httpServer.listen(port1, () => {
    logger.info(startMessage);

    // Run the status check script on startup
    const statusCheckScript = require('./status');
    statusCheckScript.checkStatusOnStartup();

    // Check version from the repository
    checkVersion();
  });
}
