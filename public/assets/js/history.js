document.addEventListener("DOMContentLoaded", function () {
    // Load status data from the JSON file
    fetch("assets/status.json")
        .then(response => response.json())
        .then(data => {
            console.log("Raw data from JSON:", data);

            // Sort data by timestamp
            data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            console.log("Sorted data:", data);

            // Process data to calculate downtime and patch time for each website
            const processedData = processStatusData(data);
            console.log("Processed data:", processedData);

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

            // Add filter buttons for all websites
            addFilterButtons(processedData);
        })
        .catch(error => console.error("Error fetching status data:", error));
});

function processStatusData(data) {
    const processedData = [];
    let currentEntry = null;

    data.forEach(entry => {
        if (entry.status === "DOWN") {
            if (!currentEntry || currentEntry.website !== entry.website || !isWithinFiveMinutes(currentEntry.timestamp, entry.timestamp)) {
                // If there is a current entry and it's not the same website or not within 5 minutes, push it to processedData
                if (currentEntry) {
                    processedData.push(currentEntry);
                }

                // Create a new downtime entry
                currentEntry = { website: entry.website, timestamp: entry.timestamp, downtime: 1 };
            } else {
                // Continue adding downtime to the current entry
                currentEntry.downtime += 1;
            }
        } else if (entry.status === "UP" && currentEntry && currentEntry.website === entry.website) {
            // If it's an UP status and matches the current entry's website, set the patch time and push to processedData
            currentEntry.patchTime = entry.timestamp;
            processedData.push(currentEntry);
            currentEntry = null;
        }
    });

    // Add the last entry if it exists
    if (currentEntry) {
        processedData.push(currentEntry);
    }

    console.log("Processed data during processing function:", processedData);
    return processedData;
}


function isWithinFiveMinutes(time1, time2) {
    const diffInMinutes = (new Date(time2) - new Date(time1)) / (1000 * 60);
    return diffInMinutes <= 5;
}

function addFilterButtons(processedData) {
    const uniqueWebsites = [...new Set(processedData.map(entry => entry.website))];
    const filterContainer = document.getElementById("filter-container");

    uniqueWebsites.forEach(website => {
        const filterButton = document.createElement("button");
        filterButton.innerText = website;
        filterButton.addEventListener("click", () => {
            console.log(`Filtering timeline for ${website}`);
            filterTimeline(processedData, website);
        });
        filterContainer.appendChild(filterButton);
    });
}
