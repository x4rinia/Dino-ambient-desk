import React, { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CalendarEvent } from '../types';

interface ClockCalendarWidgetProps {
  showSeconds: boolean;
  showNextEvent: boolean;
  events: CalendarEvent[];
}

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const ClockCalendarWidget: React.FC<ClockCalendarWidgetProps> = ({
  showSeconds,
  showNextEvent,
  events,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const dateFormatted = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString('de-DE', {
    month: 'short',
    year: 'numeric',
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventDaySet = new Set<number>();
  events.forEach((ev) => {
    const d = new Date(ev.start_iso);
    if (!isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
      eventDaySet.add(d.getDate());
    }
  });

  const upcomingEventsList = useMemo(() => {
    if (!showNextEvent || !events || events.length === 0) return [];
    const nowMs = now.getTime();
    const upcoming = events
      .map((e) => ({ ...e, timeMs: new Date(e.start_iso).getTime() }))
      .filter((e) => !isNaN(e.timeMs) && e.timeMs > nowMs)
      .sort((a, b) => a.timeMs - b.timeMs)
      .slice(0, 3);

    return upcoming.map((item) => {
      const diffMin = Math.max(1, Math.ceil((item.timeMs - nowMs) / 60000));
      let countdownText = `in ${diffMin} Min.`;
      if (diffMin >= 60 && diffMin < 1440) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        countdownText = m > 0 ? `in ${h}h ${m}m` : `in ${h} Std.`;
      } else if (diffMin >= 1440) {
        const d = Math.floor(diffMin / 1440);
        countdownText = `in ${d} Tg.`;
      }

      const startDate = new Date(item.timeMs);
      const isSameDay =
        startDate.getDate() === now.getDate() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getFullYear() === now.getFullYear();

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
  }, [showNextEvent, events, now]);

  const totalNeeded = startOffset + daysInMonth > 35 ? 42 : 35;
  const cells: { day: number; currentMonth: boolean; isToday: boolean; hasEvent: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      currentMonth: false,
      isToday: false,
      hasEvent: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      currentMonth: true,
      isToday: d === now.getDate(),
      hasEvent: eventDaySet.has(d),
    });
  }
  while (cells.length < totalNeeded) {
    cells.push({
      day: cells.length - (startOffset + daysInMonth) + 1,
      currentMonth: false,
      isToday: false,
      hasEvent: false,
    });
  }

  return (
    <section
      className={`glass-panel clock-calendar-panel ${
        showNextEvent ? 'with-next-event' : ''
      }`}
    >
      {/* Left: Clock & Live Date */}
      <div className="clock-display">
        <div className="widget-title">
          <CalendarIcon size={12} color="var(--accent-blue)" />
          <span>Uhrzeit & Datum</span>
        </div>
        <div className="digital-time">
          {hours}:{minutes}
          {showSeconds && <span className="digital-seconds">:{seconds}</span>}
        </div>
        <div className="live-date">{dateFormatted}</div>
      </div>

      {/* Middle (Between Clock and Calendar): Up to 3 Active Upcoming Appointments */}
      {showNextEvent && (
        <div className="clock-next-event-middle">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.64rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
            }}
          >
            <Clock size={11} color="var(--accent-emerald)" />
            <span>Nächste Termine ({upcomingEventsList.length}/3)</span>
          </div>

          {upcomingEventsList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {upcomingEventsList.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: idx > 0 ? 3 : 0,
                    borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: idx === 0 ? '0.78rem' : '0.71rem',
                      fontWeight: idx === 0 ? 600 : 500,
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {ev.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.65rem',
                    }}
                  >
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                      {ev.countdownText}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>• {ev.timeLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Keine aktiven Termine
            </div>
          )}
        </div>
      )}

      {/* Right: Compact Month Calendar */}
      <div className="calendar-matrix-wrap compact">
        <div className="calendar-month-header">
          <span>{monthLabel.toUpperCase()}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem', fontWeight: 600 }}>
            KW {getISOWeekNumber(now)}
          </span>
        </div>
        <div className="calendar-grid compact">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar-weekday">
              {w}
            </div>
          ))}
          {cells.map((c, idx) => (
            <div
              key={idx}
              className={`calendar-day ${!c.currentMonth ? 'other-month' : ''} ${
                c.isToday ? 'today' : ''
              } ${c.hasEvent ? 'has-event' : ''}`}
            >
              {c.day}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
