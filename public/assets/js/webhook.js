function validateWebhook() {
    var webhookUrl = document.getElementById('webhookUrl').value;
  
    // Perform validation and send test message
    sendTestMessage(webhookUrl);
  }
  
  function sendTestMessage(webhookUrl) {
    // You can customize this part based on the requirements
    var testMessage = {
      content: 'This is a test message from your application!'
    };
  
    // Perform the actual webhook test
    // For simplicity, let's assume a successful test if the URL is not empty
    var testSuccess = webhookUrl.trim() !== '';
  
    // Handle the result
    handleTestResult(testSuccess, webhookUrl);
  }
  
  function handleTestResult(success, webhookUrl) {
    var resultMessageElement = document.getElementById('resultMessage');
  
    if (success) {
      // Webhook test succeeded
      resultMessageElement.innerHTML = 'Webhook test succeeded! Adding webhook...';
  
      // Save the webhook data to webhooks.json (you may want to use a server for this)
      saveWebhook(webhookUrl);
    } else {
      // Webhook test failed
      resultMessageElement.innerHTML = 'Webhook test failed. Please check the URL and try again.';
    }
  }
  
  function saveWebhook(webhookUrl) {
    // Assuming a server environment, you would handle the storage on the server side
    // For demonstration purposes, let's assume you have a Node.js backend with fs module
  
    // This is a simplified example, you would need appropriate error handling and security measures
    const fs = require('fs');
    const path = 'src/webhooks.json';
  
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
  
      const webhooks = JSON.parse(data);
  
      // Add the new webhook
      webhooks.push({
        url: webhookUrl,
        added_at: new Date().toISOString()
      });
  
      // Save the updated data back to the file
      fs.writeFile(path, JSON.stringify(webhooks, null, 2), 'utf-8', (err) => {
        if (err) {
          console.error(err);
          return;
        }
  
        // Inform the user about the successful addition of the webhook
        document.getElementById('resultMessage').innerHTML = 'Webhook added successfully!';
      });
    });
  }
  