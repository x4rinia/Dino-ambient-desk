import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { CycleTrackerModuleConfig } from '../types';

interface CycleTrackerWidgetProps {
  config: CycleTrackerModuleConfig;
}

export const CycleTrackerWidget: React.FC<CycleTrackerWidgetProps> = ({ config }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!config.enabled) return null;

  const cycleLen = Math.max(20, Math.min(45, config.cycle_length_days || 28));
  const periodLen = Math.max(2, Math.min(10, config.period_length_days || 5));

  const startDate = new Date(config.last_period_start || '2026-10-12');
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMidnight = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const diffDays = isNaN(startMidnight.getTime())
    ? 0
    : Math.max(0, Math.floor((todayMidnight.getTime() - startMidnight.getTime()) / 86400000));

  const cycleDay = (diffDays % cycleLen) + 1;
  const daysUntilNextPeriod = cycleLen - cycleDay + 1;
  const nextPeriodDate = new Date(todayMidnight.getTime() + daysUntilNextPeriod * 86400000);

  const isDuringPeriod = cycleDay <= periodLen;
  const statusColor = isDuringPeriod ? '#fb7185' : 'var(--accent-emerald)';

  const statusText = isDuringPeriod
    ? `🔴 Aktuell in der Periode (Tag ${cycleDay} von ${periodLen})`
    : `Zyklustag ${cycleDay} von ${cycleLen}`;

  const progressPercent = Math.min(100, Math.max(4, (cycleDay / cycleLen) * 100));
  const periodZonePercent = Math.min(100, (periodLen / cycleLen) * 100);

  return (
    <section className="glass-panel pomodoro-panel">
      <div className="widget-header" style={{ marginBottom: 6 }}>
        <div className="widget-title">
          <Heart size={13} color={statusColor} />
          <span>Zyklus-Kalender</span>
        </div>
        <span className="widget-badge" style={{ color: statusColor }}>
          Tag {cycleDay} / {cycleLen}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-primary)',
          fontWeight: 500,
          marginBottom: 8,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: isDuringPeriod ? '#fda4af' : 'var(--text-primary)' }}>
          {statusText}
        </span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
          Nächster Zyklus in <strong>{daysUntilNextPeriod} Tg.</strong> (
          {nextPeriodDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
          )
        </span>
      </div>

      {/* Leiste mit markiertem Perioden-Bereich & aktuellem Fortschritt bis zum nächsten Zyklus */}
      <div className="progress-track" style={{ position: 'relative', height: 8 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${periodZonePercent}%`,
            background: 'rgba(251, 113, 133, 0.25)',
            borderRight: '1px solid rgba(251, 113, 133, 0.5)',
          }}
          title={`Periode: Tag 1 bis ${periodLen}`}
        />
        <div
          className="progress-fill"
          style={{
            width: `${progressPercent}%`,
            background: isDuringPeriod
              ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
              : `linear-gradient(90deg, #fb7185 0%, var(--accent-emerald) 45%, var(--accent-blue) 100%)`,
          }}
        />
      </div>
    </section>
  );
};
