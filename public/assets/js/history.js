// public/assets/js/history.js

document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch data from JSON file
    const fetchData = async (folderName) => {
      const response = await fetch(`assets/data/${folderName}/${getCurrentDate()}.json`);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Unable to fetch data');
      }
    };
  
    // Function to get the current date in the format: DDMMYYYY
    const getCurrentDate = () => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = String(currentDate.getFullYear());
      return `${day}${month}${year}`;
    };
  
    // Function to render the timeline for a website
    const renderTimeline = async (timelineId, folderName) => {
      const timelineContainer = document.getElementById(timelineId);
  
      try {
        const data = await fetchData(folderName);
  
        if (data.length === 0) {
          // If no data available for the current day, show a grey card
          const card = createCard('No data available', 'card-grey');
          timelineContainer.appendChild(card);
          return;
        }
  
        let currentStatus = data[0].status;
        let currentDownStartDate = data[0].timestamp;
  
        for (let i = 1; i < data.length; i++) {
          const status = data[i].status;
          const currentDate = data[i].timestamp;
  
          if (status !== currentStatus) {
            // Status changed, create a card for the previous status
            const card = createCard(currentStatus, getStatusColor(currentStatus));
            card.innerHTML += ` (${currentDownStartDate} to ${currentDate})`;
            timelineContainer.appendChild(card);
  
            // Update current status and start date
            currentStatus = status;
            currentDownStartDate = currentDate;
          }
        }
  
        // Add the last card
        const lastCard = createCard(currentStatus, getStatusColor(currentStatus));
        lastCard.innerHTML += ` (${currentDownStartDate} to ${data[data.length - 1].timestamp})`;
        timelineContainer.appendChild(lastCard);
      } catch (error) {
        console.error(`Error fetching data for ${folderName}: ${error.message}`);
      }
    };
  
    // Function to create a timeline card based on the status
    const createCard = (status, colorClass) => {
      const card = document.createElement('div');
      card.classList.add('card', colorClass);
      card.innerHTML = `<strong>${status}</strong>`;
      return card;
    };
  
    // Function to determine color based on status
    const getStatusColor = (status) => {
      switch (status) {
        case 'UP':
          return 'card-green';
        case 'DOWN':
          return 'card-red';
        default:
          return 'card-grey';
      }
    };
  
    // Render timelines for each website
    renderTimeline('main-timeline', 'main');
    renderTimeline('dashboard-timeline', 'dashboard');
    renderTimeline('panel-timeline', 'panel');
  });
  