import React, { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';

interface CountdownWidgetProps {
  label?: string;
  targetIso?: string;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  label = 'Countdown',
  targetIso,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parsed = targetIso ? new Date(targetIso) : null;
  const isValid = parsed !== null && !isNaN(parsed.getTime());
  // Default to 30 days ahead if not configured yet
  const targetDate = isValid ? parsed! : new Date(now.getTime() + 30 * 86400000);
  const diffMs = Math.max(0, targetDate.getTime() - now.getTime());

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor((diffMs % 60000) / 1000);

  const isDone = diffMs <= 0;

  return (
    <section className="glass-panel countdown-panel" style={{ width: 'max-content', minWidth: 205, maxWidth: 260 }}>
      <div className="widget-header" style={{ marginBottom: 6 }}>
        <div className="widget-title" style={{ fontSize: '0.74rem' }}>
          <Compass size={12} color="var(--accent-blue)" />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>
            {label || 'Countdown'}
          </span>
        </div>
        <span
          className="widget-badge"
          style={{
            fontSize: '0.64rem',
            color: isDone ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            fontWeight: 700,
          }}
        >
          {isDone
            ? 'Erreicht! 🎉'
            : targetDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
        </span>
      </div>

      <div className="countdown-units" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginTop: 4 }}>
        <div className="countdown-unit" style={{ padding: '4px 2px', textAlign: 'center' }}>
          <div className="countdown-number" style={{ fontSize: '1.05rem', lineHeight: 1.1 }}>{days}</div>
          <div className="countdown-unit-label" style={{ fontSize: '0.6rem', marginTop: 1 }}>Tg</div>
        </div>
        <div className="countdown-unit" style={{ padding: '4px 2px', textAlign: 'center' }}>
          <div className="countdown-number" style={{ fontSize: '1.05rem', lineHeight: 1.1 }}>{String(hours).padStart(2, '0')}</div>
          <div className="countdown-unit-label" style={{ fontSize: '0.6rem', marginTop: 1 }}>Std</div>
        </div>
        <div className="countdown-unit" style={{ padding: '4px 2px', textAlign: 'center' }}>
          <div className="countdown-number" style={{ fontSize: '1.05rem', lineHeight: 1.1 }}>{String(minutes).padStart(2, '0')}</div>
          <div className="countdown-unit-label" style={{ fontSize: '0.6rem', marginTop: 1 }}>Min</div>
        </div>
        <div className="countdown-unit" style={{ padding: '4px 2px', textAlign: 'center' }}>
          <div
            className="countdown-number"
            style={{ fontSize: '1.05rem', lineHeight: 1.1, color: isDone ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}
          >
            {String(seconds).padStart(2, '0')}
          </div>
          <div className="countdown-unit-label" style={{ fontSize: '0.6rem', marginTop: 1 }}>Sek</div>
        </div>
      </div>
    </section>
  );
};
