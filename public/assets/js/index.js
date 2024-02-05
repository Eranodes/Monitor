// Function to fetch status data from JSON files
const getStatusData = async (folderName) => {
    try {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear());
        const fileName = `${day}${month}${year}.json`;

        const response = await fetch(`assets/data/${folderName}/${fileName}`);
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(`Error fetching status data: ${error.message}`);
        return [];
    }
};

// Function to create and update information box
const createInfoBox = (status, start, end) => {
    const infoBox = document.createElement('div');
    infoBox.classList.add('info-box');

    let statusText;
    switch (status) {
        case 'UP':
            statusText = 'Site was UP';
            break;
        case 'DOWN':
            statusText = `Site was DOWN from ${new Date(start).toLocaleString()} to ${new Date(end).toLocaleString()}`;
            break;
        default:
            statusText = 'Data unavailable';
    }

    infoBox.textContent = statusText;

    return infoBox;
};

// Function to generate status bars
const generateStatusBars = async (sectionId, folderName, numDays) => {
    const section = document.getElementById(sectionId);

    if (!section) {
        console.error(`Section not found for ${folderName}`);
        return;
    }

    // Fetch status data for the corresponding website
    const statusData = await getStatusData(folderName);

    // Group status entries by day
    const statusByDay = statusData.reduce((acc, entry) => {
        const day = new Date(entry.timestamp).toLocaleDateString();
        if (!acc[day]) {
            acc[day] = { status: entry.status, start: entry.timestamp, end: entry.timestamp };
        } else if (entry.status === 'DOWN') {
            if (acc[day].status === 'DOWN') {
                acc[day].end = entry.timestamp;
            } else {
                acc[day] = { status: 'DOWN', start: entry.timestamp, end: entry.timestamp };
            }
        }
        return acc;
    }, {});

    // Find the bars container within the section
    const barsContainer = section.querySelector('.status-bars');

    if (!barsContainer) {
        console.error(`Bars container not found for ${folderName}`);
        return;
    }

    // Loop through the last numDays and create bars accordingly
    const currentDate = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
        const day = new Date(currentDate);
        day.setDate(currentDate.getDate() - i);

        const formattedDay = day.toLocaleDateString();
        const { status, start, end } = statusByDay[formattedDay] || { status: 'MISSING' };

        const bar = document.createElement('div');
        bar.classList.add('status-bar');

        if (status === 'DOWN') {
            bar.classList.add('orange-bar');
        } else if (status === 'UP') {
            bar.classList.add('green-bar');
        } else {
            bar.classList.add('grey-bar');
        }

        barsContainer.appendChild(bar);

        // Handle hover events
        handleHover(bar, status, start, end);
    }
};

// Function to handle hover events
const handleHover = (bar, status, start, end) => {
    bar.addEventListener('mouseover', () => {
        const infoBox = createInfoBox(status, start, end);
        bar.appendChild(infoBox);
    });

    bar.addEventListener('mouseout', () => {
        const infoBox = bar.querySelector('.info-box');
        if (infoBox) {
            infoBox.remove();
        }
    });
};

// Call the function for each website section after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    generateStatusBars('main-website-section', 'main', 30); // Show bars for the last 30 days
    generateStatusBars('dashboard-website-section', 'dashboard', 30); // Show bars for the last 30 days
    generateStatusBars('panel-website-section', 'panel', 30); // Show bars for the last 30 days
});
