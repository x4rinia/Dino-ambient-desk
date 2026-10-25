import React from 'react';
import { MessageCircle, Mail } from 'lucide-react';
import { CommsModuleConfig, CommsStatusData } from '../types';

interface CommsWidgetProps {
  config: CommsModuleConfig;
  status: CommsStatusData;
}

export const CommsWidget: React.FC<CommsWidgetProps> = ({ config, status }) => {
  if (!config.enabled || (!config.whatsapp_enabled && !config.email_enabled)) {
    return null;
  }

  const filteredItems = status.recent_items.filter(
    (item) =>
      (item.app === 'whatsapp' && config.whatsapp_enabled) ||
      (item.app === 'email' && config.email_enabled)
  );

  return (
    <section className="glass-panel comms-panel">
      <div className="widget-header">
        <div className="widget-title">
          <MessageCircle size={13} color="var(--accent-emerald)" />
          <span>Nachrichten & E-Mail Status</span>
        </div>
      </div>

      <div className="comms-cards-row">
        {config.whatsapp_enabled && (
          <div
            className={`comms-pill-card whatsapp ${status.whatsapp_unread > 0 ? 'has-unread' : ''}`}
          >
            <div className="comms-icon-wrap whatsapp">
              <MessageCircle size={16} />
            </div>
            <div className="comms-card-info">
              <div className="comms-card-title">
                <span>WhatsApp</span>
              </div>
              <div className="comms-card-sub">
                {status.whatsapp_unread > 0
                  ? `${status.whatsapp_unread} neue Nachricht(en)`
                  : status.whatsapp_running
                  ? 'Aktiv — Keine neuen'
                  : 'Keine neuen Nachrichten'}
              </div>
            </div>
            {status.whatsapp_unread > 0 && (
              <span className="comms-unread-badge emerald">{status.whatsapp_unread}</span>
            )}
          </div>
        )}

        {config.email_enabled && (
          <div
            className={`comms-pill-card email ${status.email_unread > 0 ? 'has-unread' : ''}`}
          >
            <div className="comms-icon-wrap email">
              <Mail size={16} />
            </div>
            <div className="comms-card-info">
              <div className="comms-card-title">
                <span>E-Mail</span>
              </div>
              <div className="comms-card-sub">
                {status.email_unread > 0
                  ? `${status.email_unread} ungelesene Mail(s)`
                  : 'Keine neuen E-Mails'}
              </div>
            </div>
            {status.email_unread > 0 && (
              <span className="comms-unread-badge blue">{status.email_unread}</span>
            )}
          </div>
        )}
      </div>

      {filteredItems.length > 0 && (
        <div className="comms-recent-list">
          {filteredItems.slice(0, 3).map((item) => (
            <div key={item.id} className="comms-recent-item">
              <span
                className="comms-recent-tag"
                style={{
                  color:
                    item.app === 'whatsapp'
                      ? 'var(--accent-emerald)'
                      : 'var(--accent-blue)',
                }}
              >
                {item.app === 'whatsapp' ? 'WA' : 'MAIL'}
              </span>
              <span className="comms-recent-sender">{item.sender}:</span>
              <span className="comms-recent-preview">{item.preview}</span>
              <span className="comms-recent-time">{item.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
