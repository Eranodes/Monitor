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
const port1 = process.env.PORT_1 || 3000;
const port2 = process.env.PORT_2 || 3001;
const useHttps = process.env.USE_HTTPS === 'true';

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// Start Message
const startMessage = `
\x1b[1m\x1b[36m  ███▄ ▄███▓ ▒█████   ███▄    █  ██▓▄▄▄█████▓ ▒█████   ██▀███  \x1b[0m
\x1b[1m\x1b[36m  ▓██▒▀█▀ ██▒▒██▒  ██▒ ██ ▀█   █ ▓██▒▓  ██▒ ▓▒▒██▒  ██▒▓██ ▒ ██▒\x1b[0m
\x1b[1m\x1b[36m  ▓██    ▓██░▒██░  ██▒▓██  ▀█ ██▒▒██▒▒ ▓██░ ▒░▒██░  ██▒▓██ ░▄█ ▒\x1b[0m
\x1b[1m\x1b[36m  ▒██    ▒██ ▒██   ██░▓██▒  ▐▌██▒░██░░ ▓██▓ ░ ▒██   ██░▒██▀▀█▄  \x1b[0m
\x1b[1m\x1b[36m  ▒██▒   ░██▒░ ████▓▒░▒██░   ▓██░░██░  ▒██▒ ░ ░ ████▓▒░░██▓ ▒██▒\x1b[0m
\x1b[1m\x1b[36m  ░ ▒░   ░  ░░ ▒░▒░▒░ ░ ▒░   ▒ ▒ ░▓    ▒ ░░   ░ ▒░▒░▒░ ░ ▒▓ ░▒▓░\x1b[0m
\x1b[1m\x1b[36m  ░  ░      ░  ░ ▒ ▒░ ░ ░░   ░ ▒░ ▒ ░    ░      ░ ▒ ▒░   ░▒ ░ ▒░\x1b[0m
\x1b[1m\x1b[36m  ░      ░   ░ ░ ░ ▒     ░   ░ ░  ▒ ░  ░      ░ ░ ░ ▒    ░░   ░ \x1b[0m
\x1b[1m\x1b[36m           ░       ░ ░           ░  ░               ░ ░     ░     \x1b[0m

\x1b[1m\x1b[32m-----------------------
Author: \x1b[0m\x1b[1m\x1b[35mG9 Aerospace\x1b[0m
\x1b[1m\x1b[32mWebsite: \x1b[0m\x1b[1m\x1b[4mhttps://g9aerospace.in\x1b[0m
\x1b[1m\x1b[32mRepository: \x1b[0m\x1b[1m\x1b[4mhttps://github.com/Eranodes/Monitor\x1b[0m
\x1b[1m\x1b[32m-----------------------
Please read the license and readme.
Ensure your .env file is properly filled.
Serving pages on port \x1b[0m\x1b[1m\x1b[33m${port1}\x1b[0m
\x1b[1m\x1b[32mQuering websites on port \x1b[0m\x1b[1m\x1b[33m${port2}\x1b[0m
\x1b[1m\x1b[32mFor support, join our Discord server: \x1b[0m\x1b[1m\x1b[4mhttps://discord.gg/jhju3spUbE\x1b[0m
\x1b[1m\x1b[32m-----------------------
Server is running on port: \x1b[0m\x1b[1m\x1b[33m${port1}\x1b[0m (\x1b[0m\x1b[1m\x1b[35m${useHttps ? 'HTTPS' : 'HTTP'}\x1b[0m\x1b[1m\x1b[32m)\x1b[0m
\x1b[1m\x1b[32mVersion: \x1b[0m\x1b[1m\x1b[33m${packageJson.version}\x1b[0m`;

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
