import React, { useState, useEffect } from 'react';
import { getAdminDashboardMetrics, getAdminIssuesReport } from '../../../api/admin';
import { AdminKPIs, AdminIssuesResponse } from '../types/index';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  CheckCircle2,
  Activity,
  AlertOctagon,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [kpis, setKpis] = useState<AdminKPIs | null>(null);
  const [issues, setIssues] = useState<AdminIssuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, issuesRes] = await Promise.all([
        getAdminDashboardMetrics(),
        getAdminIssuesReport(),
      ]);
      setKpis(kpiRes);
      setIssues(issuesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load district healthcare administration metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Banner */}
      <div className="organic-card" style={styles.bannerCard}>
        <div style={styles.bannerLeft}>
          <div style={styles.bannerTag}>
            <ShieldCheck size={14} color="var(--color-sage-light)" />
            <span>District Health Administration Portal</span>
          </div>
          <h2 style={styles.bannerTitle}>Jabalpur District Healthcare Operations</h2>
          <p style={styles.bannerDesc}>
            Real-time telemetry on facility service gaps, stale availability records, digital referral velocity, and citizen data quality feedback.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '12.5px' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner-icon' : ''} />
          <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      {kpis && (
        <div style={styles.kpiGrid}>
          {/* KPI 1: Total Facilities */}
          <div className="organic-card" style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Active Facilities</span>
              <Building2 size={16} color="var(--color-sage-light)" />
            </div>
            <div style={styles.kpiValue}>{kpis.totalFacilities}</div>
            <span style={styles.kpiSub}>Registered in District</span>
          </div>

          {/* KPI 2: Active Services */}
          <div className="organic-card" style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Active Services</span>
              <Activity size={16} color="var(--color-sage-light)" />
            </div>
            <div style={styles.kpiValue}>{kpis.activeServices}</div>
            <span style={styles.kpiSub}>Available OPD &amp; Care</span>
          </div>

          {/* KPI 3: Total Referrals */}
          <div className="organic-card" style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Total Referrals</span>
              <FileText size={16} color="var(--color-sand-light)" />
            </div>
            <div style={styles.kpiValue}>{kpis.totalReferrals}</div>
            <span style={styles.kpiSub}>ASHA Digital Tickets</span>
          </div>

          {/* KPI 4: Completed Referrals */}
          <div className="organic-card" style={styles.kpiCard}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Completed</span>
              <CheckCircle2 size={16} color="var(--color-sage-light)" />
            </div>
            <div style={{ ...styles.kpiValue, color: 'var(--color-sage-light)' }}>
              {kpis.completedReferrals}
            </div>
            <span style={styles.kpiSub}>Successfully Treated</span>
          </div>

          {/* KPI 5: Stale Updates */}
          <div className="organic-card" style={{ ...styles.kpiCard, borderLeft: '3px solid var(--color-sand)' }}>
            <div style={styles.kpiTop}>
              <span style={styles.kpiLabel}>Stale Updates</span>
              <Clock size={16} color="var(--color-sand-light)" />
            </div>
            <div style={{ ...styles.kpiValue, color: 'var(--color-sand-light)' }}>
              {kpis.staleAvailabilityUpdates}
            </div>
            <span style={{ ...styles.kpiSub, color: 'var(--color-sand-light)' }}>
              &gt; 48 Hours Unconfirmed
            </span>
          </div>
        </div>
      )}

      {/* Service Gaps & Feedback Grid */}
      {issues && (
        <div style={styles.issuesGrid}>
          {/* Left: Service Gap Alerts */}
          <div className="organic-card">
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon size={18} color="var(--color-terracotta-light)" />
                <h3 style={styles.cardHeaderTitle}>Critical Service Gap Alerts</h3>
              </div>
              <span style={styles.gapCountBadge}>{issues.serviceGaps.length} Active Gaps</span>
            </div>

            <div style={styles.gapsList}>
              {issues.serviceGaps.length > 0 ? (
                issues.serviceGaps.map((gap, idx) => (
                  <div key={idx} style={styles.gapItem}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={styles.gapServiceName}>{gap.service_name}</span>
                        <span className="badge-pill badge-unavailable" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {gap.status}
                        </span>
                      </div>
                      <span style={styles.gapFacilityName}>{gap.facility_name}</span>
                      {gap.capacity_note && (
                        <p style={styles.gapReason}>Reason: {gap.capacity_note}</p>
                      )}
                      <span style={styles.gapTime}>
                        Updated: {new Date(gap.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyStateBox}>
                  <CheckCircle2 size={24} color="var(--color-sage-light)" />
                  <p style={{ color: 'var(--text-subtle)', fontSize: '13px', marginTop: '6px' }}>
                    No critical service gaps detected across the district.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Data Quality Reports */}
          <div className="organic-card">
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--color-sand-light)" />
                <h3 style={styles.cardHeaderTitle}>Community Data Quality Reports</h3>
              </div>
              <span style={styles.feedbackCountBadge}>
                {issues.pendingFeedback.length} Pending
              </span>
            </div>

            <div style={styles.feedbackList}>
              {issues.pendingFeedback.length > 0 ? (
                issues.pendingFeedback.map((fb) => (
                  <div key={fb.id} style={styles.feedbackItem}>
                    <div style={styles.feedbackTop}>
                      <span style={styles.feedbackCategory}>{fb.category}</span>
                      <span style={styles.feedbackRole}>{fb.reporter_role}</span>
                    </div>
                    <p style={styles.feedbackDesc}>{fb.description}</p>
                    <span style={styles.feedbackDate}>
                      Submitted: {new Date(fb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyStateBox}>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '13px' }}>
                    No pending data discrepancy reports.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  bannerCard: {
    backgroundColor: 'rgba(32, 92, 67, 0.25)',
    borderLeft: '4px solid var(--color-sage)',
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  bannerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  bannerTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: 'var(--color-sage-light)',
  },
  bannerTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: 'var(--text-pure)',
    margin: 0,
  },
  bannerDesc: {
    fontSize: '13px',
    color: 'var(--text-subtle)',
    margin: 0,
    maxWidth: '680px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--status-unavailable-bg)',
    border: '1px solid var(--status-unavailable-border)',
    color: 'var(--status-unavailable-text)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  kpiCard: {
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  kpiTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: 900,
    color: 'var(--text-pure)',
    lineHeight: 1.1,
  },
  kpiSub: {
    fontSize: '11px',
    color: 'var(--text-subtle)',
  },
  issuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  cardHeaderTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-pure)',
    margin: 0,
  },
  gapCountBadge: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(196, 93, 62, 0.2)',
    color: 'var(--color-terracotta-light)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid rgba(196, 93, 62, 0.4)',
  },
  feedbackCountBadge: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: 'rgba(212, 151, 59, 0.2)',
    color: 'var(--color-sand-light)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid rgba(212, 151, 59, 0.4)',
  },
  gapsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  gapItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  gapServiceName: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: 'var(--color-terracotta-light)',
  },
  gapFacilityName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-pure)',
    display: 'block',
    marginTop: '2px',
  },
  gapReason: {
    fontSize: '12px',
    color: 'var(--color-sand-light)',
    marginTop: '4px',
  },
  gapTime: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '4px',
  },
  feedbackList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  feedbackItem: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '14px',
  },
  feedbackTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  feedbackCategory: {
    fontSize: '11.5px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'var(--color-sand-light)',
  },
  feedbackRole: {
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  feedbackDesc: {
    fontSize: '12.5px',
    color: 'var(--text-pure)',
    marginBottom: '6px',
  },
  feedbackDate: {
    fontSize: '10.5px',
    color: 'var(--text-muted)',
  },
  emptyStateBox: {
    textAlign: 'center' as const,
    padding: '36px 16px',
  },
};
