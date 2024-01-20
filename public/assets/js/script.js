async function fetchStatus() {
  const response = await fetch('/assets/status.json');
  const historyArray = await response.json();

  updateStatus('main', historyArray.filter(entry => entry.website === 'Main Website'));
  updateStatus('dashboard', historyArray.filter(entry => entry.website === 'Dashboard Website'));
  updateStatus('panel', historyArray.filter(entry => entry.website === 'Panel Website'));

  updateHistory('main', historyArray.filter(entry => entry.website === 'Main Website'));
  updateHistory('dashboard', historyArray.filter(entry => entry.website === 'Dashboard Website'));
  updateHistory('panel', historyArray.filter(entry => entry.website === 'Panel Website'));
}

function updateStatus(serverName, historyArray) {
  const statusElement = document.getElementById(`${serverName}-status`);
  if (statusElement) {
      const latestEntry = historyArray[historyArray.length - 1] || {};
      const isOnline = latestEntry.status === 'UP';
      statusElement.textContent = isOnline ? 'Online' : 'Offline';
      statusElement.style.color = isOnline ? 'green' : 'red';
  }
}

function updateHistory(serverName, historyArray) {
  const historyContainer = document.getElementById(`${serverName}-history`);
  if (historyContainer) {
      // Limit the displayed history to the latest 20 entries
      const latestHistory = historyArray.slice(-20);

      // Clear existing history
      historyContainer.innerHTML = '';

      latestHistory.forEach(history => {
          const bar = document.createElement('div');
          bar.classList.add('history-bar');
          bar.style.backgroundColor = history.status === 'UP' ? 'green' : 'red';
          bar.title = `${history.website} - ${history.timestamp} - ${history.status}`;
          historyContainer.appendChild(bar);
      });
  }
}

// Fetch status on page load
fetchStatus();

// Fetch status every 5 minutes
setInterval(fetchStatus, 300000); // 5 minutes in milliseconds

const style = document.createElement('style');
style.innerHTML = `
  .history-bar {
    width: 15px;
    height: 30px;
    display: inline-block;
    margin-right: 5px;
  }
`;
document.head.appendChild(style);
