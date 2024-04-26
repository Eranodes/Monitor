import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

interface User {
  timestamp: string;
  status: string;
}

// Define a reusable function to fetch data from an API endpoint
async function fetchData(endpoint: string): Promise<User[]> {
  try {
    const response = await fetch(`http://ryzen-9-eu.eranodes.xyz:56264/${endpoint}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as User[];
    } else {
      throw new Error(`Unexpected response type from ${endpoint}: not JSON`);
    }
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    throw error; // Rethrow the error for the component to handle
  }
}

export const useServerData = routeLoader$(async () => {
  try {
    // Fetch data from all three endpoints concurrently
    const [mainData, dashboardData, panelData] = await Promise.all([
      fetchData('api/main'),
      fetchData('api/dashboard'),
      fetchData('api/panel')
    ]);
    // Combine and return the data
    return {
      main: mainData,
      dashboard: dashboardData,
      panel: panelData
    };
  } catch (error) {
    console.error('Error loading server data:', error);
    throw error; // Rethrow the error for the component to handle
  }
});

export default component$(() => {
  const serverData = useServerData();

  // Process data for each site
  const mainData = serverData.value.main || [];
  const dashboardData = serverData.value.dashboard || [];
  const panelData = serverData.value.panel || [];

  return (
    <div>
      <section class="section bright">
        <h2>Main Site Data</h2>
        <ul class="bar-list">
          {mainData.map((user, index) => (
            <li key={index} class="bar-container">
              <div class={`bar ${getStatusClass(user.status)}`} />
            </li>
          ))}
        </ul>
      </section>
      <section class="section bright">
        <h2>Dashboard Site Data</h2>
        <ul class="bar-list">
          {dashboardData.map((user, index) => (
            <li key={index} class="bar-container">
              <div class={`bar ${getStatusClass(user.status)}`} />
            </li>
          ))}
        </ul>
      </section>
      <section class="section bright">
        <h2>Panel Site Data</h2>
        <ul class="bar-list">
          {panelData.map((user, index) => (
            <li key={index} class="bar-container">
              <div class={`bar ${getStatusClass(user.status)}`} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});

function getStatusClass(status: string): string {
  switch (status) {
    case 'DOWN':
      return 'bar-red';
    case 'UP':
      return 'bar-green';
    default:
      return 'bar-grey';
  }
}
