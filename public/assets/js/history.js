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

  // Function to format timestamp in DD-MM-YYYY HH:mm format
  const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      const formattedDate = `${date.getDate()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;
      return `${formattedDate} ${formattedTime}`;
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

          let mergedEvents = mergeDownEvents(data);

          for (const event of mergedEvents) {
              const { status, startTimestamp, endTimestamp, resolvedTimestamp } = event;

              // Create card for the merged event
              const card = createCard(status, getStatusColor(status));
              card.innerHTML += `  Started: ${formatTimestamp(startTimestamp)}, Ended: ${formatTimestamp(endTimestamp)}`;

              // Add additional line for resolved timestamp if applicable
              if (resolvedTimestamp) {
                  card.innerHTML += `<br>Resolved at: ${formatTimestamp(resolvedTimestamp)}`;
              }

              timelineContainer.appendChild(card);
          }
      } catch (error) {
          console.error(`Error fetching data for ${folderName}: ${error.message}`);
      }
  };

  // Function to merge consecutive DOWN events
  const mergeDownEvents = (data) => {
      let mergedEvents = [];
      let currentEvent = null;

      for (const event of data) {
          if (event.status === 'DOWN') {
              if (!currentEvent) {
                  // Start a new event
                  currentEvent = {
                      status: 'DOWN',
                      startTimestamp: event.timestamp,
                      endTimestamp: event.timestamp,
                      resolvedTimestamp: null,
                  };
              } else {
                  // Continue the current event
                  currentEvent.endTimestamp = event.timestamp;
              }
          } else if (event.status === 'UP' && currentEvent) {
              // Resolve the current DOWN event and store resolved timestamp
              currentEvent.resolvedTimestamp = event.timestamp;
              mergedEvents.push(currentEvent);
              currentEvent = null;
          }
      }

      // If there is an ongoing DOWN event at the end, add it to the merged events
      if (currentEvent) {
          mergedEvents.push(currentEvent);
      }

      return mergedEvents;
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
