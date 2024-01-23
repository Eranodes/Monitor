// Function to fetch data from the JSON file
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return null;
    }
}

// Create bar charts for each website
function createBarChart(containerId, websiteData) {
    const container = document.getElementById(containerId);

    // Group data by date
    const groupedData = groupByDate(websiteData);

    // Get the last 30 days
    const last30Days = getLast30Days();

    // Loop through the last 30 days
    last30Days.forEach(day => {
        const dayData = groupedData[day] || [];

        // Check if there is any 'DOWN' status for the website on that day
        const isDown = dayData.some(entry => entry.status === 'DOWN');

        // Create a bar for the day
        const bar = document.createElement('div');
        bar.classList.add('status-bar');
        bar.style.backgroundColor = isDown ? 'red' : 'green';
        bar.title = `${websiteData[0].website} - ${day}\nStatus: ${isDown ? 'DOWN' : 'UP'}`;
        container.appendChild(bar);
    });
}

// Function to group data by date
function groupByDate(data) {
    return data.reduce((grouped, entry) => {
        const date = entry.timestamp.split('T')[0];
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(entry);
        return grouped;
    }, {});
}

// Function to get the last 30 days
function getLast30Days() {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - index);
        return date.toISOString().split('T')[0];
    });
    return last30Days;
}

// Load the JSON data
const jsonUrl = '/assets/status.json';

fetchData(jsonUrl)
    .then((statusData) => {
        if (statusData) {
            console.log('JSON data loaded successfully:', statusData);

            // Create bar charts for each website
            createBarChart('main-section', statusData.filter(entry => entry.website === 'Main Website'));
            createBarChart('dashboard-section', statusData.filter(entry => entry.website === 'Dashboard Website'));
            createBarChart('panel-section', statusData.filter(entry => entry.website === 'Panel Website'));
        }
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
