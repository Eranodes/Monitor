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
function createBarChart(containerId, websiteData, dateRange) {
    const container = document.getElementById(containerId);

    // Group data by date
    const groupedData = groupByDate(websiteData);

    // Loop through the specified date range in reverse order
    dateRange.reverse().forEach(day => {
        const dayData = groupedData[day] || [];

        // Check if there is any 'DOWN' status for the website on that day
        const isDown = dayData.some(entry => entry.status === 'DOWN');

        // Check if data exists for the day
        const hasData = dayData.length > 0;

        // Create a bar for the day
        const bar = document.createElement('div');
        bar.classList.add('status-bar');

        // Set the background color based on status or yellow if no data
        bar.style.backgroundColor = hasData ? (isDown ? 'red' : 'green') : 'yellow';

        bar.title = hasData
            ? `${websiteData[0].website} - ${day}\nStatus: ${isDown ? 'DOWN' : 'UP'}`
            : `No data available for ${websiteData[0].website} on ${day}`;

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

// Function to get the last 90 days
function getLast90Days() {
    const today = new Date();
    const last90Days = Array.from({ length: 90 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - index);
        return date.toISOString().split('T')[0];
    });
    return last90Days;
}

// Load the JSON data
const jsonUrl = '/assets/status.json';

fetchData(jsonUrl)
    .then((statusData) => {
        if (statusData) {
            console.log('JSON data loaded successfully:', statusData);

            // Create bar charts for each website with the last 90 days in reverse order
            createBarChart('main-section', statusData.filter(entry => entry.website === 'Main Website'), getLast90Days());
            createBarChart('dashboard-section', statusData.filter(entry => entry.website === 'Dashboard Website'), getLast90Days());
            createBarChart('panel-section', statusData.filter(entry => entry.website === 'Panel Website'), getLast90Days());
        }
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
