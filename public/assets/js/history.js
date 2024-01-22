document.addEventListener('DOMContentLoaded', function () {
    // Fetch the status data from the JSON file
    fetch('assets/status.json')
        .then(response => response.json())
        .then(data => displayDowntimeHistory(data));
});

function displayDowntimeHistory(statusData) {
    const historyContainer = document.getElementById('history-container');

    // Group status entries by website
    const websiteData = {};
    statusData.forEach(entry => {
        if (!websiteData[entry.website]) {
            websiteData[entry.website] = [];
        }
        websiteData[entry.website].push(entry);
    });

    // Create a card for each website
    Object.keys(websiteData).forEach(website => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        historyContainer.appendChild(cardContainer);

        const websiteEntries = websiteData[website];
        let currentDowntimeGroup = null;

        websiteEntries.forEach((entry, index) => {
            if (entry.status === 'DOWN') {
                if (!currentDowntimeGroup) {
                    // Start a new downtime group
                    currentDowntimeGroup = {
                        website: entry.website,
                        downtimeStart: new Date(entry.timestamp).toLocaleString(),
                        downtimeEnd: null,
                    };
                }
            } else if (entry.status === 'UP' && currentDowntimeGroup) {
                // End the current downtime group when an UP entry is found
                currentDowntimeGroup.downtimeEnd = new Date(entry.timestamp).toLocaleString();

                // Create and append the downtime entry to the card container
                appendDowntimeEntry(currentDowntimeGroup, cardContainer);

                // Reset the current downtime group
                currentDowntimeGroup = null;
            }
        });

        // Handle the case where the last entry is DOWN without an UP follow-up
        if (currentDowntimeGroup) {
            currentDowntimeGroup.downtimeEnd = 'Ongoing';
            appendDowntimeEntry(currentDowntimeGroup, cardContainer);
        }
    });
}

function appendDowntimeEntry(downtimeGroup, container) {
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
        <p class="website-name">${downtimeGroup.website}</p>
        <p class="downtime-start">Downtime started: ${downtimeGroup.downtimeStart}</p>
    `;

    if (downtimeGroup.downtimeEnd) {
        card.innerHTML += `<p class="downtime-end">Downtime ended: ${downtimeGroup.downtimeEnd}</p>`;
    } else {
        card.innerHTML += `<p class="status-ongoing">Status: Ongoing</p>`;
    }

    container.appendChild(card);
}
