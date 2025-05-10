'use client';
import { useEffect, useState } from 'react';

export default function CalendarEvents({ accessToken }: { accessToken: string }) {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      setEvents(data.items || []);
    }

    if (accessToken) {
      fetchEvents();
    }
  }, [accessToken]);

  return (
    <div>
      <h2>Your Upcoming Events:</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>{event.summary} – {event.start?.dateTime || event.start?.date}</li>
        ))}
      </ul>
    </div>
  );
}
