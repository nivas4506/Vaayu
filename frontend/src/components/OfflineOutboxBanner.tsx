import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { WifiOff, RefreshCw, Trash2 } from 'lucide-react';

export const OfflineOutboxBanner: React.FC = () => {
  const { offlineOutbox, isOnline, isSyncing, syncOutbox, clearOutbox } = useAppStore();

  if (offlineOutbox.length === 0) return null;

  return (
    <div style={styles.bannerWrapper}>
      <div style={styles.bannerInner}>
        <div style={styles.infoGroup}>
          <div style={styles.iconBox}>
            <WifiOff size={18} color="var(--color-sand-light)" />
          </div>
          <div>
            <h4 style={styles.bannerTitle}>
              {offlineOutbox.length} Queued Offline Update{offlineOutbox.length > 1 ? 's' : ''}
            </h4>
            <p style={styles.bannerDesc}>
              {isOnline
                ? 'Network connection restored. Ready to synchronize queued updates with the district server.'
                : 'Offline mode active. All status and capacity updates are saved locally in the browser outbox.'}
            </p>
          </div>
        </div>

        <div style={styles.actionsGroup}>
          {isOnline && (
            <button
              onClick={syncOutbox}
              disabled={isSyncing}
              className="btn-primary"
              style={{
                backgroundColor: 'var(--color-sand)',
                color: '#1a1409',
                padding: '8px 16px',
                fontSize: '12px',
              }}
            >
              <RefreshCw size={13} className={isSyncing ? 'spinner-icon' : ''} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
            </button>
          )}
          <button
            onClick={clearOutbox}
            style={styles.clearBtn}
            title="Discard local queued items"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bannerWrapper: {
    backgroundColor: 'rgba(122, 83, 27, 0.25)',
    border: '1px solid var(--border-medium)',
    borderLeft: '4px solid var(--color-sand)',
    borderRadius: 'var(--radius-md)',
    padding: '14px 18px',
    marginBottom: '24px',
    boxShadow: 'var(--shadow-sm)',
  },
  bannerInner: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
  },
  infoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(212, 151, 59, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-sand-light)',
    margin: 0,
  },
  bannerDesc: {
    fontSize: '12px',
    color: 'var(--text-subtle)',
    margin: 0,
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    transition: 'color 0.15s ease',
  },
};
