document.addEventListener("DOMContentLoaded", function () {
    // Define the number of bars to display
    const numBars = 30;
  
    // Function to create a status bar element
    function createStatusBar(status) {
      const statusBar = document.createElement("div");
      statusBar.classList.add("status-bar");
  
      if (status === "DOWN") {
        statusBar.classList.add("orange-bar");
      } else if (status === "UP") {
        statusBar.classList.add("green-bar");
      } else {
        statusBar.classList.add("grey-bar");
      }
  
      return statusBar;
    }
  
    // Function to create an info box element
    function createInfoBox(status, timestamp) {
      const infoBox = document.createElement("div");
      infoBox.classList.add("info-box");
  
      const formattedTimestamp = formatTimestamp(timestamp);
  
      const statusText = document.createElement("p");
      statusText.textContent = `Status: ${status}`;
      infoBox.appendChild(statusText);
  
      const timestampText = document.createElement("p");
      timestampText.textContent = `Timestamp: ${formattedTimestamp}`;
      infoBox.appendChild(timestampText);
  
      return infoBox;
    }
  
    // Function to update the status bars for a given section
    async function updateStatusBars(sectionId) {
      const section = document.getElementById(sectionId);
      const statusBarsContainer = section.querySelector(".status-bars");
  
      // Clear existing content
      statusBarsContainer.innerHTML = "";
  
      // Fetch JSON data for the last 30 days
      const jsonPromises = [];
      for (let i = numBars - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = getFormattedDate(date);
        const jsonDataPath = `assets/data/${sectionId.split("-")[0]}/${formattedDate}.json`;
  
        const jsonPromise = fetch(jsonDataPath)
          .then((response) => response.json())
          .catch(() => null);
  
        jsonPromises.push(jsonPromise);
      }
  
      const jsons = await Promise.all(jsonPromises);
  
      // Iterate through the last 30 days of data
      for (let i = numBars - 1; i >= 0; i--) {
        const data = jsons[i];
        const status = data ? hasDownStatus(data) ? "DOWN" : "UP" : "UNKNOWN"; // Use "UNKNOWN" for missing data
  
        // Create status bar
        const statusBar = createStatusBar(status);
  
        // Create info box
        const infoBox = createInfoBox(status, new Date());
  
        // Append status bar to container
        statusBarsContainer.appendChild(statusBar);
  
        // Add event listener to show info box on hover
        statusBar.addEventListener("mouseover", function (event) {
          const rect = statusBar.getBoundingClientRect();
          infoBox.style.left = `${rect.left}px`;
          infoBox.style.top = `${rect.top - 50}px`;
  
          // Set info box content
          infoBox.innerHTML = `<p>Status: ${status}</p><p>Timestamp: ${formatTimestamp(new Date())}</p>`;
  
          // Append info box to body
          document.body.appendChild(infoBox);
        });
  
        // Remove info box on mouseout
        statusBar.addEventListener("mouseout", function () {
          document.body.removeChild(infoBox);
        });
      }
    }
  
    // Check if there is at least one "DOWN" status in the data
    function hasDownStatus(data) {
      return data.some(entry => entry.status === "DOWN");
    }
  
    // Fetch and update status bars for each section
    const sections = ["main-website-section", "dashboard-website-section", "panel-website-section"];
  
    sections.forEach((sectionId) => {
      updateStatusBars(sectionId);
    });
  
    // Function to format timestamp to 12hr time and DD-MM-YYYY format
    function formatTimestamp(timestamp) {
      const dateObj = new Date(timestamp);
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
  
      const formattedTime = `${(hours % 12) || 12}:${String(minutes).padStart(2, "0")} ${ampm}`;
      const formattedDate = `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;
  
      return `${formattedTime} on ${formattedDate}`;
    }
  
    // Function to get formatted date for the file path
    function getFormattedDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
  
      return `${day}${month}${year}`;
    }
  });
  