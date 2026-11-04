import React, { useEffect, useState } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

interface ClockWidgetProps {
  showSeconds?: boolean;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ showSeconds = true }) => {
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

  return (
    <section className="glass-panel clock-widget-card" style={{ padding: '14px 18px' }}>
      <div className="widget-header" style={{ marginBottom: 6 }}>
        <div className="widget-title">
          <ClockIcon size={13} color="var(--accent-blue)" />
          <span>Uhrzeit & Datum</span>
        </div>
      </div>
      <div className="digital-time" style={{ marginBottom: 4 }}>
        {hours}:{minutes}
        {showSeconds && <span className="digital-seconds">:{seconds}</span>}
      </div>
      <div className="live-date">{dateFormatted}</div>
    </section>
  );
};

