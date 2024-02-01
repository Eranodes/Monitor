// assets/js/index.js

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

// Function to generate status bars
const generateStatusBars = async (sectionId, folderName) => {
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
            acc[day] = entry.status;
        } else if (entry.status === 'DOWN') {
            acc[day] = 'DOWN';
        }
        return acc;
    }, {});

    // Find the bars container within the section
    const barsContainer = section.querySelector('.status-bars');

    if (!barsContainer) {
        console.error(`Bars container not found for ${folderName}`);
        return;
    }

    // Loop through the last 90 days and create bars accordingly
    const currentDate = new Date();
    for (let i = 89; i >= 0; i--) {
        const day = new Date(currentDate);
        day.setDate(currentDate.getDate() - i);

        const formattedDay = day.toLocaleDateString();
        const status = statusByDay[formattedDay] || 'MISSING';

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
    }
};

// Call the function for each website section after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    generateStatusBars('main-website-section', 'main');
    generateStatusBars('dashboard-website-section', 'dashboard');
    generateStatusBars('panel-website-section', 'panel');
});
