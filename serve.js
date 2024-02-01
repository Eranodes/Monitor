const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Run the status check script on startup
  const statusCheckScript = require('./status');
  statusCheckScript.checkStatusOnStartup();
});
