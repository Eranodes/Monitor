const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

const app = express();
const port1 = process.env.PORT || 3000;
const port2 = process.env.PORT_2 || 3001;

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.listen(port1, () => {
  logger.info(`
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
  Using ${port1} for serving status page and ${port2} for querying the eranodes sites!
  For support, join our Discord server: https://discord.gg/jhju3spUbE
  -----------------------
  Server is running on port: ${port1}`);
  
  // Run the status check script on startup
  const statusCheckScript = require('./status');
  statusCheckScript.checkStatusOnStartup();
});
