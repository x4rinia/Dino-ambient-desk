import React from 'react';
import { Activity } from 'lucide-react';
import { SystemVitalsData } from '../types';

interface SystemVitalsWidgetProps {
  vitals: SystemVitalsData;
}

export const SystemVitalsWidget: React.FC<SystemVitalsWidgetProps> = ({ vitals }) => {
  const cpu = Math.round(vitals.cpu_percent);
  const ram = Math.round(vitals.ram_percent);
  const gpu = Math.round(vitals.gpu_percent);

  const getBarColor = (val: number, baseColor: string) => {
    if (val >= 85) return 'var(--accent-amber)';
    return baseColor;
  };

  return (
    <section className="glass-panel vitals-panel">
      <div className="widget-header">
        <div className="widget-title">
          <Activity size={13} color="var(--accent-emerald)" />
          <span>Hardware System Vitals</span>
        </div>
        <span className="widget-badge">
          {vitals.ram_used_gb.toFixed(1)} / {vitals.ram_total_gb.toFixed(0)} GB RAM
        </span>
      </div>

      <div className="vitals-grid">
        <div className="vital-row">
          <span className="vital-label">CPU</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, cpu)}%`,
                background: getBarColor(cpu, 'var(--accent-blue)'),
              }}
            />
          </div>
          <span className="vital-value">{cpu}%</span>
        </div>

        <div className="vital-row">
          <span className="vital-label">RAM</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, ram)}%`,
                background: getBarColor(ram, 'var(--accent-emerald)'),
              }}
            />
          </div>
          <span className="vital-value">{ram}%</span>
        </div>

        <div className="vital-row">
          <span className="vital-label">GPU</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, gpu)}%`,
                background: getBarColor(gpu, 'var(--accent-amber)'),
              }}
            />
          </div>
          <span className="vital-value">{gpu}%</span>
        </div>
      </div>
    </section>
  );
};

