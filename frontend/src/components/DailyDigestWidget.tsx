import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DailyQuote } from '../types';

interface DailyDigestWidgetProps {
  quotes: DailyQuote[];
}

const DEFAULT_QUOTES: DailyQuote[] = [
  {
    id: '1',
    category: 'Coding Tip',
    title: 'Prefer Composition Over Inheritance',
    content: 'Kleine, kombinierbare Module halten Systeme wartbar und übersichtlich.',
    author_or_key: 'Clean Architecture',
  },
  {
    id: '2',
    category: 'Shortcut',
    title: 'Windows Virtueller Desktop',
    content: 'Mit Ctrl + Win + Pfeiltaste Links/Rechts direkt zwischen Desktops wechseln.',
    author_or_key: 'Ctrl + Win + Pfeil',
  },
  {
    id: '3',
    category: 'Quote',
    title: 'Simplicity & Reliability',
    content: '"Simplicity is prerequisite for reliability."',
    author_or_key: 'Edsger W. Dijkstra',
  },
];

export const DailyDigestWidget: React.FC<DailyDigestWidgetProps> = ({ quotes }) => {
  const list = quotes.length > 0 ? quotes : DEFAULT_QUOTES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 60000);
    return () => clearInterval(timer);
  }, [list.length]);

  const active = list[index % list.length];

  return (
    <section className="glass-panel digest-panel">
      <div className="widget-header">
        <div className="widget-title">
          <Sparkles size={13} color="var(--accent-blue)" />
          <span>Impuls — {active.category}</span>
        </div>
        {active.author_or_key && (
          <span className="widget-badge">{active.author_or_key}</span>
        )}
      </div>

      <div className="digest-content">{active.content}</div>

      <div className="digest-footer">
        <span>{active.title}</span>
      </div>
    </section>
  );
};
