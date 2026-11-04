import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight, Clock, Calendar as CalIcon } from 'lucide-react';
import { CalendarEvent } from '../types';

interface NextUpAgendaWidgetProps {
  events: CalendarEvent[];
}

export const NextUpAgendaWidget: React.FC<NextUpAgendaWidgetProps> = ({ events }) => {
  const [now, setNow] = useState(() => new Date());
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Update clock every 30 seconds to refresh countdowns and auto-expire passed events
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const upcomingEventsList = useMemo(() => {
    if (!events || events.length === 0) return [];
    const nowMs = now.getTime();

    // An event is active if its scheduled time is in the future
    // or if it's on the current day within 30 minutes after start time.
    const upcoming = events
      .map((e) => {
        const d = new Date(e.start_iso);
        return { ...e, date: d, timeMs: d.getTime() };
      })
      .filter((e) => {
        if (isNaN(e.timeMs)) return false;
        // Event has expired if its time + 30 minutes has passed
        return e.timeMs + 30 * 60 * 1000 >= nowMs;
      })
      .sort((a, b) => a.timeMs - b.timeMs)
      .slice(0, 3); // Max 3 active events sequentially

    return upcoming.map((item) => {
      const diffMs = item.timeMs - nowMs;
      const startDate = item.date;
      const isSameDay =
        startDate.getDate() === now.getDate() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getFullYear() === now.getFullYear();

      let countdownText = 'Heute';
      let isImminent = false;

      if (diffMs > 0) {
        const diffMin = Math.max(1, Math.ceil(diffMs / 60000));
        if (diffMin < 60) {
          countdownText = `in ${diffMin} Min.`;
          isImminent = true;
        } else if (diffMin < 1440) {
          const h = Math.floor(diffMin / 60);
          const m = diffMin % 60;
          countdownText = m > 0 ? `in ${h}h ${m}m` : `in ${h} Std.`;
          isImminent = true;
        } else {
          const d = Math.floor(diffMin / 1440);
          countdownText = d === 1 ? 'Morgen' : `in ${d} Tg.`;
        }
      } else if (isSameDay) {
        countdownText = 'Jetzt / Heute';
        isImminent = true;
      }

      const timeLabel = startDate.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const dateLabel = startDate.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });

      return {
        id: item.id,
        title: item.title,
        dateLabel,
        timeLabel,
        countdownText,
        isImminent,
      };
    });
  }, [events, now]);

  // Ensure selectedIndex is within range when an event expires and drops out
  const count = upcomingEventsList.length;
  const activeIndex = count > 0 ? Math.min(selectedIndex, count - 1) : 0;
  const currentEvent = count > 0 ? upcomingEventsList[activeIndex] : null;

  return (
    <section className="glass-panel agenda-widget-card">
      {/* Header */}
      <div className="widget-header" style={{ marginBottom: 8 }}>
        <div className="widget-title">
          <CalendarClock size={13} color="var(--accent-emerald)" />
          <span>Nächste Termine</span>
        </div>
        {count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              className="widget-badge"
              style={{
                color: 'var(--accent-emerald)',
                fontWeight: 700,
                fontSize: '0.68rem',
                padding: '2px 6px',
              }}
            >
              {activeIndex + 1}/{count}
            </span>
            {count > 1 && (
              <div style={{ display: 'flex', gap: 2 }}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : count - 1))}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Vorheriger Termin"
                >
                  <ChevronLeft size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIndex((prev) => (prev < count - 1 ? prev + 1 : 0))}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Nächster Termin"
                >
                  <ChevronRight size={11} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Square Content */}
      {currentEvent ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          {/* Top: Countdown Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                background: currentEvent.isImminent
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(245,158,11,0.25))'
                  : 'rgba(56, 189, 248, 0.15)',
                border: currentEvent.isImminent
                  ? '1px solid rgba(245,158,11,0.45)'
                  : '1px solid rgba(56, 189, 248, 0.35)',
                color: currentEvent.isImminent ? '#fbbf24' : '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: currentEvent.isImminent
                  ? '0 2px 8px rgba(251,191,36,0.25)'
                  : 'none',
              }}
            >
              <Clock size={11} />
              <span>{currentEvent.countdownText}</span>
            </span>
          </div>

          {/* Middle: Title */}
          <div
            style={{
              fontSize: '0.96rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              wordBreak: 'break-word',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {currentEvent.title}
          </div>

          {/* Bottom: Date & Time details */}
          <div
            style={{
              paddingTop: 6,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.74rem',
                color: '#cbd5e1',
                fontWeight: 600,
              }}
            >
              <CalIcon size={12} color="var(--accent-blue)" />
              <span>{currentEvent.dateLabel}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-primary)' }}>{currentEvent.timeLabel} Uhr</span>
            </div>

            {count > 1 && (
              <div
                style={{
                  fontSize: '0.67rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: 2,
                }}
              >
                Danach: {upcomingEventsList[(activeIndex + 1) % count].title}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 8,
            padding: '12px 6px',
            color: 'var(--text-muted)',
          }}
        >
          <CalendarClock size={28} opacity={0.35} />
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8' }}>
            Keine anstehenden Termine
          </div>
          <div style={{ fontSize: '0.68rem', lineHeight: 1.3 }}>
            Sobald ein Termin eingetragen ist, wird er hier angezeigt.
          </div>
        </div>
      )}
    </section>
  );
};
