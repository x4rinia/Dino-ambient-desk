import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface CountdownWidgetProps {
  label: string;
  targetIso: string;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  label,
  targetIso,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const targetDate = new Date(targetIso);
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((diffMs % 60000) / 1000);

  return (
    <section className="glass-panel countdown-panel">
      <div className="widget-header">
        <div className="widget-title">
          <Compass size={13} color="var(--accent-blue)" />
          <span>Countdown — {label || 'Meilenstein'}</span>
        </div>
        <span className="widget-badge">
          {!isNaN(targetDate.getTime())
            ? targetDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : ''}
        </span>
      </div>

      <div className="countdown-units">
        <div className="countdown-unit">
          <div className="countdown-number">{days}</div>
          <div className="countdown-unit-label">Tage</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-number">{String(hours).padStart(2, '0')}</div>
          <div className="countdown-unit-label">Std</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-number">{String(minutes).padStart(2, '0')}</div>
          <div className="countdown-unit-label">Min</div>
        </div>
        <div className="countdown-unit">
          <div className="countdown-number" style={{ color: 'var(--accent-emerald)' }}>
            {String(seconds).padStart(2, '0')}
          </div>
          <div className="countdown-unit-label">Sek</div>
        </div>
      </div>
    </section>
  );
};
