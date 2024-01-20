// script.js

async function fetchStatus() {
    const response = await fetch('/status');
    const statusArray = await response.json();
  
    updateStatus('main', statusArray.find(server => server.name === 'Main Website').status === 'UP');
    updateStatus('dashboard', statusArray.find(server => server.name === 'Dashboard Website').status === 'UP');
    updateStatus('panel', statusArray.find(server => server.name === 'Panel Website').status === 'UP');
  }
  
  function updateStatus(serverName, isOnline) {
    const statusElement = document.getElementById(`${serverName}-status`);
    if (statusElement) {
      statusElement.textContent = isOnline ? 'Online' : 'Offline';
      statusElement.style.color = isOnline ? 'green' : 'red';
    }
  }
  
  // Fetch status on page load
  fetchStatus();
  
  // Fetch status every 30 seconds
  setInterval(fetchStatus, 30000);  // 30 seconds in milliseconds
  