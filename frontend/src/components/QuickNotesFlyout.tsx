import React from 'react';
import { FileText } from 'lucide-react';

interface AmbientNotesWidgetProps {
  notes: string;
}

export const AmbientNotesWidget: React.FC<AmbientNotesWidgetProps> = ({ notes }) => {
  const hasNotes = Boolean(notes && notes.trim().length > 0);

  return (
    <section className="glass-panel notes-card" style={{ padding: '12px 16px' }}>
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
          color: hasNotes ? 'var(--text-secondary)' : 'var(--text-muted)',
          whiteSpace: 'pre-wrap',
          maxHeight: 110,
          overflow: 'hidden',
          fontStyle: hasNotes ? 'normal' : 'italic',
        }}
      >
        {hasNotes ? notes : 'Keine Notizen eingetragen'}
      </div>
    </section>
  );
};
