// Import necessary modules
require('dotenv').config();
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Function to fetch the status of a website
async function getWebsiteStatus(url) {
    try {
        const response = await axios.get(url);
        return response.status === 200 ? "UP" : "DOWN"; // Return "UP" if status code is 200, otherwise "DOWN"
    } catch (error) {
        return "DOWN"; // Return "DOWN" if there's an error fetching the status
    }
}

// Function to create directory if not exists
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

// Main function to get website status and store it in a SQLite database
async function main() {
    const mainWebsiteUrl = process.env.MAIN_WEBSITE_URL; // Get main website URL from .env file
    const dashboardWebsiteUrl = process.env.DASHBOARD_WEBSITE_URL; // Get dashboard website URL from .env file
    const panelWebsiteUrl = process.env.PANEL_WEBSITE_URL; // Get panel website URL from .env file

    const websites = [
        { url: mainWebsiteUrl, dbName: 'main.db' },
        { url: dashboardWebsiteUrl, dbName: 'dashboard.db' },
        { url: panelWebsiteUrl, dbName: 'panel.db' }
    ];

    for (const website of websites) {
        const url = website.url;
        const dbName = website.dbName;

        const status = await getWebsiteStatus(url); // Get website status
        const timestamp = new Date().toISOString(); // Get current timestamp

        // Create directory if not exists
        const dataDir = path.join(__dirname, 'data');
        ensureDirectoryExistence(dataDir);

        // Connect to SQLite database
        const dbPath = path.join(dataDir, dbName);
        const db = new sqlite3.Database(dbPath);

        // Create table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS status (timestamp TEXT, status TEXT)`);

        // Insert status into the table
        db.run(`INSERT INTO status (timestamp, status) VALUES (?, ?)`, [timestamp, status], function(err) {
            if (err) {
                console.error(`Error inserting status data for ${url} into database:`, err);
            } else {
                console.log(`Status data for ${url} successfully inserted into database.`);
            }
            db.close(); // Close database connection
        });
    }

    // Schedule the next execution after 1 minute
    setTimeout(main, 60000); // 60000 milliseconds = 1 minute
}

// Call main function to start the process
main();