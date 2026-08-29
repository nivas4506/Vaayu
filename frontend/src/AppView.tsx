import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { OfflineOutboxBanner } from './components/OfflineOutboxBanner';
import { PatientDiscovery } from './views/PatientDiscovery';
import { ChwWorkspace } from './views/ChwWorkspace';
import { FacilityWorkspace } from './views/FacilityWorkspace';
import { AdminDashboard } from './views/AdminDashboard';
import { HeartPulse, Globe } from 'lucide-react';

export const AppView: React.FC = () => {
  const { currentRole } = useAppStore();

  const renderActiveView = () => {
    switch (currentRole) {
      case 'PATIENT':
        return <PatientDiscovery />;
      case 'ASHA':
        return <ChwWorkspace />;
      case 'FACILITY_STAFF':
        return <FacilityWorkspace />;
      case 'DISTRICT_ADMIN':
        return <AdminDashboard />;
      default:
        return <PatientDiscovery />;
    }
  };

  return (
    <div style={styles.appShell}>
      <Header />

      <main style={styles.mainContent}>
        <div className="app-container">
          <OfflineOutboxBanner />
          {renderActiveView()}
        </div>
      </main>

      <footer style={styles.footer}>
        <div className="app-container" style={styles.footerInner}>
          <div style={styles.footerLeft}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={16} color="var(--color-sage-light)" />
              <span style={styles.footerBrand}>Vaayu SehatReach Healthcare Platform</span>
            </div>
            <p style={styles.footerCopyright}>
              Low-Bandwidth Rural Health Discovery &amp; Digital Referral Coordination Network
            </p>
          </div>

          <div style={styles.footerRight}>
            <span style={styles.footerTag}>
              <Globe size={12} />
              <span>All-India PIN Directory (19,300+ Postal Codes Supported)</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  appShell: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  mainContent: {
    flex: 1,
    padding: '28px 0 56px 0',
  },
  footer: {
    borderTop: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '24px 0',
    marginTop: 'auto',
  },
  footerInner: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  footerBrand: {
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--text-pure)',
  },
  footerCopyright: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    margin: 0,
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  footerTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: 'var(--text-subtle)',
    backgroundColor: 'var(--bg-elevated)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid var(--border-subtle)',
  },
};

export default AppView;
