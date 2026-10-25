import React, { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';

interface MoonCalendarWidgetProps {
  enabled: boolean;
}

const SYNODIC_MONTH = 29.53058867;
// Reference known New Moon: 2000-01-06 18:14 UTC
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

export const MoonCalendarWidget: React.FC<MoonCalendarWidgetProps> = ({ enabled }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!enabled) return null;

  const daysSinceRef = (now.getTime() - REF_NEW_MOON_MS) / 86400000;
  const ageDays = ((daysSinceRef % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const phaseFraction = ageDays / SYNODIC_MONTH; // 0.0 = New, 0.5 = Full

  // Illumination percentage (0..100%)
  const illumination = Math.round(((1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2) * 100);

  let phaseName = 'Vollmond';
  let phaseEmoji = '🌕';
  if (phaseFraction < 0.03 || phaseFraction >= 0.97) {
    phaseName = 'Neumond';
    phaseEmoji = '🌑';
  } else if (phaseFraction < 0.22) {
    phaseName = 'Zunehmende Sichel';
    phaseEmoji = '🌒';
  } else if (phaseFraction < 0.28) {
    phaseName = 'Erstes Viertel (Halbmond)';
    phaseEmoji = '🌓';
  } else if (phaseFraction < 0.47) {
    phaseName = 'Zunehmender Mond';
    phaseEmoji = '🌔';
  } else if (phaseFraction < 0.53) {
    phaseName = 'Vollmond';
    phaseEmoji = '🌕';
  } else if (phaseFraction < 0.72) {
    phaseName = 'Abnehmender Mond';
    phaseEmoji = '🌖';
  } else if (phaseFraction < 0.78) {
    phaseName = 'Letztes Viertel (Halbmond)';
    phaseEmoji = '🌗';
  } else {
    phaseName = 'Abnehmende Sichel';
    phaseEmoji = '🌘';
  }

  // Days until next Full Moon (phase 0.5) & next New Moon (phase 1.0)
  const fullMoonAge = SYNODIC_MONTH * 0.5;
  const daysToFullMoon =
    ageDays <= fullMoonAge
      ? Math.ceil(fullMoonAge - ageDays)
      : Math.ceil(SYNODIC_MONTH - ageDays + fullMoonAge);
  const daysToNewMoon = Math.ceil(SYNODIC_MONTH - ageDays);

  const nextFullDate = new Date(now.getTime() + daysToFullMoon * 86400000);
  const nextNewDate = new Date(now.getTime() + daysToNewMoon * 86400000);

  return (
    <section className="glass-panel" style={{ padding: '12px 16px' }}>
      <div className="widget-header" style={{ marginBottom: 6 }}>
        <div className="widget-title">
          <Moon size={13} color="var(--accent-amber)" />
          <span>Mondkalender</span>
        </div>
        <span className="widget-badge" style={{ color: 'var(--accent-amber)' }}>
          {illumination}% beleuchtet
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(251,191,36,0.22), rgba(255,255,255,0.06))',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(251, 191, 36, 0.18)',
          }}
        >
          {phaseEmoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {phaseName}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 3,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
            }}
          >
            <span>
              🌕 Vollmond: in {daysToFullMoon} Tg. (
              {nextFullDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
              })}
              )
            </span>
            <span>
              🌑 Neumond: in {daysToNewMoon} Tg. (
              {nextNewDate.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
              })}
              )
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

