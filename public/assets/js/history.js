document.addEventListener('DOMContentLoaded', function () {
    // Fetch the status data from the JSON file
    fetch('assets/status.json')
        .then(response => response.json())
        .then(data => displayDowntimeHistory(data));

    // Event listener for the sort menu
    const sortMenu = document.getElementById('sort-options');
    sortMenu.addEventListener('change', function () {
        sortDowntimeHistory(this.value);
    });

    // Event listener for the sort order menu
    const sortOrderMenu = document.getElementById('sort-order');
    sortOrderMenu.addEventListener('change', function () {
        sortDowntimeHistory(sortMenu.value); // Re-sort when the order changes
    });
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

// Function to sort downtime history based on user selection and order
function sortDowntimeHistory(sortBy) {
    const historyContainer = document.getElementById('history-container');

    // Get all cards inside the history container
    const cards = Array.from(historyContainer.querySelectorAll('.card'));

    // Get the sorting order (ascending or descending)
    const sortOrder = document.getElementById('sort-order').value;

    // Sort cards based on the selected option and sorting order
    cards.sort((a, b) => {
        const aValue = getValueToSort(a, sortBy);
        const bValue = getValueToSort(b, sortBy);

        if (sortOrder === 'asc') {
            return aValue.localeCompare(bValue);
        } else if (sortOrder === 'desc') {
            return bValue.localeCompare(aValue);
        }

        return 0;
    });

    // Clear and append the sorted cards back to the history container
    historyContainer.innerHTML = '';
    cards.forEach(card => historyContainer.appendChild(card));
}

// Helper function to get the value for sorting
function getValueToSort(card, sortBy) {
    switch (sortBy) {
        case 'website':
            return card.querySelector('.website-name').textContent;
        case 'start-time':
            return card.querySelector('.downtime-start').textContent;
        default:
            return '';
    }
}
