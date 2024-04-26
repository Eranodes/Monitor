import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

interface User {
  timestamp: string;
  status: string;
}

export const useServerData = routeLoader$(async () => {
  try {
    const response = await fetch(`http://ryzen-9-eu.eranodes.xyz:56264/api/main`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as User[];
    } else {
      throw new Error('Unexpected response type: not JSON');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error for the component to handle
  }
});

export default component$(() => {
  const serverData = useServerData();
  
  // Create an array to hold status data for the last 30 days
  const last30DaysData: { timestamp: string, status: string }[] = [];
  
  // Generate dates for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0]; // Get only the date part
    const dayData = serverData.value.find(user => user.timestamp.startsWith(dateString));
    last30DaysData.push(dayData || { timestamp: dateString, status: 'UNKNOWN' });
  }

  // Reverse the order of last30DaysData
  last30DaysData.reverse();

  return (
    <section class="section bright">
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'row', padding: 2 }}>
        {last30DaysData.map((dayData, index) => (
          <li key={index} style={{ marginRight: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '20px',
                height: '100px',
                backgroundColor: dayData.status === 'DOWN' ? 'red' : (dayData.status === 'UP' ? 'green' : 'grey'),
                marginBottom: '2px',
                marginRight: '5px',
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
});
