import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { CalendarEvent } from '../types';

interface NextUpAgendaWidgetProps {
  events: CalendarEvent[];
}

export const NextUpAgendaWidget: React.FC<NextUpAgendaWidgetProps> = ({ events }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const upcomingEventsList = useMemo(() => {
    if (!events || events.length === 0) return [];
    const nowMs = now.getTime();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const upcoming = events
      .map((e) => {
        const d = new Date(e.start_iso);
        return { ...e, date: d, timeMs: d.getTime() };
      })
      .filter((e) => {
        if (isNaN(e.timeMs)) return false;
        const eventDayStart = new Date(e.date.getFullYear(), e.date.getMonth(), e.date.getDate()).getTime();
        return eventDayStart >= startOfToday;
      })
      .sort((a, b) => a.timeMs - b.timeMs)
      .slice(0, 4);

    return upcoming.map((item) => {
      const diffMs = item.timeMs - nowMs;
      const startDate = item.date;
      const isSameDay =
        startDate.getDate() === now.getDate() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getFullYear() === now.getFullYear();

      let countdownText = 'Heute';
      if (diffMs > 0) {
        const diffMin = Math.max(1, Math.ceil(diffMs / 60000));
        if (diffMin < 60) {
          countdownText = `in ${diffMin} Min.`;
        } else if (diffMin < 1440) {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          countdownText = m > 0 ? `in ${h}h ${m}m` : `in ${h} Std.`;
        } else {
          const d = Math.floor(diffMin / 1440);
          countdownText = `in ${d} Tg.`;
        }
      } else if (isSameDay) {
        countdownText = 'Heute';
      }

      const timeLabel = isSameDay
        ? startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : startDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });

      return {
        id: item.id,
        title: item.title,
        timeLabel,
        countdownText,
      };
    });
  }, [events, now]);

  return (
    <section className="glass-panel agenda-widget-card" style={{ padding: '14px 18px' }}>
      <div className="widget-header" style={{ marginBottom: 10 }}>
        <div className="widget-title">
          <CalendarClock size={13} color="var(--accent-emerald)" />
          <span>Nächste Termine</span>
        </div>
        {upcomingEventsList.length > 0 && (
          <span className="widget-badge" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
            {upcomingEventsList.length} aktiv
          </span>
        )}
      </div>

      {upcomingEventsList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcomingEventsList.map((ev, idx) => (
            <div
              key={ev.id || idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingTop: idx > 0 ? 6 : 0,
                borderTop: idx > 0 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.7)',
                }}
              >
                {ev.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.72rem',
                }}
              >
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>
                  {ev.countdownText}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>• {ev.timeLabel}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '6px 0' }}>
          Keine anstehenden Termine eingetragen.
        </div>
      )}
    </section>
  );
};
