document.addEventListener("DOMContentLoaded", function () {
    // Load status data from the JSON file
    fetch("assets/status.json")
      .then(response => response.json())
      .then(data => {
        // Sort data by timestamp
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
        // Process data to calculate downtime and patch time
        const processedData = processStatusData(data);
  
        // Generate HTML for the timeline
        const timelineContainer = document.getElementById("timeline-container");
        const timelineList = document.createElement("ul");
        timelineList.classList.add("timeline");
  
        processedData.forEach(entry => {
          const listItem = document.createElement("li");
          listItem.classList.add("timeline-item");
  
          const arrow = document.createElement("div");
          arrow.classList.add("timeline-item-arrow");
          listItem.appendChild(arrow);
  
          const timestamp = new Date(entry.timestamp).toLocaleString();
          const patchTime = entry.patchTime ? new Date(entry.patchTime).toLocaleString() : "N/A";
  
          const content = document.createElement("div");
          content.classList.add("timeline-item-content");
          content.innerHTML = `<strong>${timestamp}</strong><br>${entry.website} was down. Patch time: ${patchTime}`;
          listItem.appendChild(content);
  
          timelineList.appendChild(listItem);
        });
  
        timelineContainer.appendChild(timelineList);
  
        // Add filter button
        addFilterButton(processedData);
      })
      .catch(error => console.error("Error fetching status data:", error));
  });
  
  function processStatusData(data) {
    const processedData = [];
    let currentEntry = null;
  
    data.forEach(entry => {
      if (entry.status === "DOWN") {
        if (!currentEntry || (currentEntry && isWithinFiveMinutes(currentEntry.timestamp, entry.timestamp))) {
          currentEntry = currentEntry || { website: entry.website, timestamp: entry.timestamp, downtime: 0 };
          currentEntry.downtime += 1;
        } else {
          currentEntry.patchTime = entry.timestamp;
          processedData.push(currentEntry);
          currentEntry = { website: entry.website, timestamp: entry.timestamp, downtime: 1 };
        }
      } else if (entry.status === "UP" && currentEntry) {
        currentEntry.patchTime = entry.timestamp;
        processedData.push(currentEntry);
        currentEntry = null;
      }
    });
  
    // Add the last entry if it exists
    if (currentEntry) {
      processedData.push(currentEntry);
    }
  
    return processedData;
  }
  
  function isWithinFiveMinutes(time1, time2) {
    const diffInMinutes = (new Date(time2) - new Date(time1)) / (1000 * 60);
    return diffInMinutes <= 5;
  }
  
  function addFilterButton(processedData) {
    const uniqueWebsites = [...new Set(processedData.map(entry => entry.website))];
    const filterContainer = document.getElementById("filter-container");
  
    uniqueWebsites.forEach(website => {
      const filterButton = document.createElement("button");
      filterButton.innerText = website;
      filterButton.addEventListener("click", () => filterTimeline(processedData, website));
      filterContainer.appendChild(filterButton);
    });
  }
  
  function filterTimeline(data, website) {
    const timelineItems = document.querySelectorAll(".timeline-item");
  
    timelineItems.forEach(item => {
      const content = item.querySelector(".timeline-item-content");
      const isVisible = website === "All" || content.innerHTML.includes(`${website} was down`);
  
      item.style.display = isVisible ? "block" : "none";
    });
  }
  