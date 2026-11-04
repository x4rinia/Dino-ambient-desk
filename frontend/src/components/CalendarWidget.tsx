import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarWidgetProps {
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

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  const firstDayOfMonth = new Date(year, month, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const eventDaySet = new Set<number>();
  (events || []).forEach((ev) => {
    const d = new Date(ev.start_iso);
    if (!isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === month) {
      eventDaySet.add(d.getDate());
    }
  });

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
    <section className="glass-panel calendar-widget-card" style={{ padding: '14px 18px' }}>
      <div className="widget-header" style={{ marginBottom: 10 }}>
        <div className="widget-title" style={{ textTransform: 'capitalize' }}>
          <CalendarIcon size={13} color="var(--accent-blue)" />
          <span>{monthLabel}</span>
        </div>
        <span className="widget-badge" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
          KW {getISOWeekNumber(now)}
        </span>
      </div>

      <div
        className="calendar-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 4,
          textAlign: 'center',
        }}
      >
        {WEEKDAYS.map((w, idx) => (
          <div
            key={w}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: idx >= 5 ? 'var(--accent-emerald)' : 'var(--accent-blue)',
              paddingBottom: 4,
            }}
          >
            {w}
          </div>
        ))}

        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
              fontWeight: c.isToday ? 800 : c.currentMonth ? 600 : 400,
              minHeight: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              background: c.isToday
                ? 'var(--accent-rose, #f43f5e)'
                : c.hasEvent
                ? 'rgba(56, 189, 248, 0.22)'
                : 'transparent',
              color: c.isToday
                ? '#ffffff'
                : c.currentMonth
                ? 'var(--text-primary)'
                : 'rgba(255, 255, 255, 0.22)',
              border: c.isToday
                ? '1px solid rgba(255, 255, 255, 0.5)'
                : c.hasEvent
                ? '1px solid var(--accent-blue)'
                : '1px solid transparent',
              boxShadow: c.isToday ? '0 0 10px rgba(244, 63, 94, 0.45)' : 'none',
              boxSizing: 'border-box',
            }}
          >
            {c.day}
          </div>
        ))}
      </div>
    </section>
  );
};

