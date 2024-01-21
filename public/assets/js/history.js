document.addEventListener("DOMContentLoaded", function () {
    // Load status data from the JSON file
    fetch("assets/status.json")
      .then(response => response.json())
      .then(data => {
        // Filter data to include only entries where status is "DOWN"
        const downEntries = data.filter(entry => entry.status === "DOWN");
  
        // Generate HTML for the timeline
        const timelineContainer = document.getElementById("timeline-container");
        const timelineList = document.createElement("ul");
        timelineList.classList.add("timeline");
  
        downEntries.forEach(entry => {
          const listItem = document.createElement("li");
          listItem.classList.add("timeline-item");
  
          const arrow = document.createElement("div");
          arrow.classList.add("timeline-item-arrow");
          listItem.appendChild(arrow);
  
          const timestamp = new Date(entry.timestamp).toLocaleString();
          const content = document.createElement("div");
          content.classList.add("timeline-item-content");
          content.innerHTML = `<strong>${timestamp}</strong><br>${entry.website} was down.`;
          listItem.appendChild(content);
  
          timelineList.appendChild(listItem);
        });
  
        timelineContainer.appendChild(timelineList);
      })
      .catch(error => console.error("Error fetching status data:", error));
  });
  