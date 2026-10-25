import React, { useEffect, useState } from 'react';
import { Clock, CalendarClock } from 'lucide-react';
import { CalendarEvent } from '../types';

interface NextUpAgendaWidgetProps {
  events: CalendarEvent[];
}

export const NextUpAgendaWidget: React.FC<NextUpAgendaWidgetProps> = ({ events }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const upcoming = events
    .map((ev) => ({
      ...ev,
      dateObj: new Date(ev.start_iso),
    }))
    .filter((ev) => !isNaN(ev.dateObj.getTime()) && ev.dateObj.getTime() > now.getTime() - 60000)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const nextEvent = upcoming[0];

  const formatRelative = (target: Date): string => {
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return 'Starting now';
    const totalMinutes = Math.ceil(diffMs / 60000);
    if (totalMinutes < 60) {
      return `in ${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours < 24) {
      return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `in ${days}d ${remHours}h`;
  };

  return (
    <section className="glass-panel agenda-panel">
      <div className="widget-header">
        <div className="widget-title">
          <CalendarClock size={13} color="var(--accent-amber)" />
          <span>Next-Up Agenda</span>
        </div>
        {nextEvent && (
          <span className="widget-badge">
            {nextEvent.dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {nextEvent ? (
        <div>
          <div className="agenda-event-title">{nextEvent.title}</div>
          <div className="agenda-countdown">
            <Clock size={12} />
            <span>
              {nextEvent.title} {formatRelative(nextEvent.dateObj)}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', padding: '6px 0' }}>
          No upcoming events scheduled. Enjoy clear focus time.
        </div>
      )}
    </section>
  );
};

