import React from 'react';
import { FileText } from 'lucide-react';

interface AmbientNotesWidgetProps {
  notes: string;
}

export const AmbientNotesWidget: React.FC<AmbientNotesWidgetProps> = ({ notes }) => {
  if (!notes || !notes.trim()) return null;

  return (
    <section className="glass-panel" style={{ padding: '12px 16px' }}>
      <div className="widget-header" style={{ marginBottom: 6 }}>
        <div className="widget-title">
          <FileText size={13} color="var(--accent-emerald)" />
          <span>Notizen</span>
        </div>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          lineHeight: 1.48,
          color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap',
          maxHeight: 110,
          overflow: 'hidden',
        }}
      >
        {notes}
      </div>
    </section>
  );
};
