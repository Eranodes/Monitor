//I created this script so you can generate a random list of status to test! You do not need it in production!

const fs = require('fs');

// Function to generate a random timestamp between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Function to generate random status (UP or DOWN) based on probabilities
function randomStatus() {
  return Math.random() < 0.8 ? 'UP' : 'DOWN'; // 4/5 probability for UP
}

// Websites from the provided JSON
const websites = ["Main Website", "Dashboard Website", "Panel Website"];

// Generate random data
const startDate = new Date('2023-10-03T14:15:00.000Z');
const endDate = new Date('2024-01-23T10:35:00.000Z');
const newData = [];

let currentDate = startDate;

while (currentDate <= endDate) {
  websites.forEach((website) => {
    newData.push({
      website,
      timestamp: currentDate.toISOString(),
      status: randomStatus(),
    });
  });

  currentDate.setTime(currentDate.getTime() + 5 * 60 * 1000); // Add 5 minutes
}

// Write the generated data to status.json
const filePath = 'public/assets/status.json';
fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));

console.log(`Random data generated and written to ${filePath}`);
