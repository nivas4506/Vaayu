import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { UserRole } from '../types/index';
import { HeartPulse, Wifi, WifiOff, User, Stethoscope, Building2, ShieldCheck, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, setRole, isOnline, setOnline, offlineOutbox, isSyncing, syncSuccessMessage } = useAppStore();

  const roles: Array<{ role: UserRole; label: string; icon: React.ReactNode }> = [
    { role: 'PATIENT', label: 'Patient Discovery', icon: <User size={15} /> },
    { role: 'ASHA', label: 'ASHA Worker Portal', icon: <Stethoscope size={15} /> },
    { role: 'FACILITY_STAFF', label: 'Facility Desk', icon: <Building2 size={15} /> },
    { role: 'DISTRICT_ADMIN', label: 'District Admin', icon: <ShieldCheck size={15} /> },
  ];

  return (
    <header style={styles.headerWrapper}>
      {syncSuccessMessage && (
        <div style={styles.syncBanner}>
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      <div style={styles.headerInner}>
        {/* Brand & Logo */}
        <div style={styles.brandGroup}>
          <div style={styles.logoBadge}>
            <HeartPulse size={20} color="#0c1812" strokeWidth={2.5} />
          </div>
          <div>
            <div style={styles.brandTitleRow}>
              <h1 style={styles.brandName}>VAAYU</h1>
              <span style={styles.brandSubBadge}>Rural Health</span>
            </div>
            <span style={styles.brandTagline}>SehatReach Discovery &amp; Care Coordination</span>
          </div>
        </div>

        {/* Role Selector Nav */}
        <nav style={styles.roleNav}>
          {roles.map(({ role, label, icon }) => {
            const isActive = currentRole === role;
            return (
              <button
                key={role}
                onClick={() => setRole(role)}
                style={{
                  ...styles.roleButton,
                  backgroundColor: isActive ? 'var(--color-sage)' : 'transparent',
                  color: isActive ? '#0c1812' : 'var(--text-subtle)',
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? '0 2px 10px rgba(45, 122, 88, 0.35)' : 'none',
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Network & Offline Mode Simulator */}
        <div style={styles.actionsGroup}>
          <button
            onClick={() => setOnline(!isOnline)}
            title={isOnline ? 'Online (Connected to server). Click to simulate offline mode.' : 'Offline Mode (Updates queue locally). Click to reconnect.'}
            style={{
              ...styles.networkToggle,
              backgroundColor: isOnline ? 'var(--status-available-bg)' : 'var(--status-limited-bg)',
              borderColor: isOnline ? 'var(--status-available-border)' : 'var(--status-limited-border)',
              color: isOnline ? 'var(--status-available-text)' : 'var(--status-limited-text)',
            }}
          >
            {isSyncing ? (
              <RefreshCw size={14} className="spinner-icon" />
            ) : isOnline ? (
              <Wifi size={14} />
            ) : (
              <WifiOff size={14} />
            )}
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline Mode'}
            </span>

            {offlineOutbox.length > 0 && (
              <span style={styles.outboxBadge}>
                {offlineOutbox.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Role Switcher (Compact Bar) */}
      <div style={styles.mobileRoleNav}>
        {roles.map(({ role, label, icon }) => {
          const isActive = currentRole === role;
          return (
            <button
              key={role}
              onClick={() => setRole(role)}
              style={{
                ...styles.mobileRoleBtn,
                color: isActive ? 'var(--color-sage-light)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                borderBottom: isActive ? '2px solid var(--color-sage)' : '2px solid transparent',
              }}
            >
              {icon}
              <span style={{ fontSize: '11px' }}>{label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

const styles = {
  headerWrapper: {
    backgroundColor: 'rgba(17, 22, 20, 0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  syncBanner: {
    backgroundColor: 'var(--color-sage-dark)',
    color: '#a7f3d0',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center' as const,
    padding: '6px 16px',
    borderBottom: '1px solid var(--border-medium)',
  },
  headerInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 16px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--color-sage-light), var(--color-sage))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(59, 163, 119, 0.35)',
  },
  brandTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '900',
    letterSpacing: '0.05em',
    color: 'var(--text-pure)',
    margin: 0,
  },
  brandSubBadge: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    backgroundColor: 'rgba(59, 163, 119, 0.15)',
    color: 'var(--color-sage-light)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(59, 163, 119, 0.3)',
  },
  brandTagline: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '-1px',
  },
  roleNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-secondary)',
    padding: '4px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-subtle)',
  },
  roleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    fontSize: '12.5px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  networkToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  outboxBadge: {
    backgroundColor: 'var(--color-terracotta)',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: '9999px',
    marginLeft: '2px',
  },
  mobileRoleNav: {
    display: 'none',
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '4px 8px',
  },
  mobileRoleBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    padding: '6px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
};
