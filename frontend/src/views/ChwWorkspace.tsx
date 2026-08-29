import React, { useState } from 'react';
import { createReferral, getReferralByCode } from '../../../api/referrals';
import { Referral } from '../types/index';
import {
  Stethoscope,
  Send,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ChwWorkspace: React.FC = () => {
  const [form, setForm] = useState({
    originFacilityId: 'nandgaon_hwc',
    destFacilityId: 'seva_chc',
    serviceId: 'blood_test',
    patientName: '',
    patientPhone: '',
    urgency: 'ROUTINE' as 'ROUTINE' | 'URGENT',
    notes: '',
  });

  const [createdReferral, setCreatedReferral] = useState<Referral | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [trackedReferral, setTrackedReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim() || !form.patientPhone.trim()) {
      setError('Please provide both patient full name and contact phone number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createReferral({
        originFacilityId: form.originFacilityId,
        destFacilityId: form.destFacilityId,
        serviceId: form.serviceId,
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        urgency: form.urgency,
        notes: form.notes.trim() || undefined,
      });
      setCreatedReferral(res);
      setForm({
        originFacilityId: 'nandgaon_hwc',
        destFacilityId: 'seva_chc',
        serviceId: 'blood_test',
        patientName: '',
        patientPhone: '',
        urgency: 'ROUTINE',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to issue digital referral.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getReferralByCode(searchCode.trim().toUpperCase());
      setTrackedReferral(res);
    } catch (err: any) {
      setError(err.message || `No referral found for tracking code "${searchCode}".`);
      setTrackedReferral(null);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div className="organic-card" style={styles.bannerCard}>
        <div style={styles.bannerLeft}>
          <div style={styles.bannerTag}>
            <Stethoscope size={14} color="var(--color-sage-light)" />
            <span>Community Health Worker Portal</span>
          </div>
          <h2 style={styles.bannerTitle}>ASHA Assisted Patient Referral Desk</h2>
          <p style={styles.bannerDesc}>
            Issue structured digital patient referrals with unique public tracking codes (`REF-XXXX`) to ensure seamless higher facility triage and care continuity.
          </p>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Left Column: Create Referral Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="organic-card">
            <h3 style={styles.sectionHeading}>
              <Send size={16} color="var(--color-sage-light)" />
              <span>Issue New Patient Referral</span>
            </h3>

            {error && (
              <div style={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.formContainer}>
              <div>
                <label style={styles.fieldLabel}>Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rani Devi, Mohan Kumar"
                  value={form.patientName}
                  onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                  className="organic-input"
                />
              </div>

              <div style={styles.twoCol}>
                <div>
                  <label style={styles.fieldLabel}>Patient Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={form.patientPhone}
                    onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                    className="organic-input"
                  />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Triage Urgency *</label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value as 'ROUTINE' | 'URGENT' })}
                    className="organic-select"
                  >
                    <option value="ROUTINE">Routine (Standard Consultation)</option>
                    <option value="URGENT">Urgent (Within 24 Hours)</option>
                  </select>
                </div>
              </div>

              <div style={styles.twoCol}>
                <div>
                  <label style={styles.fieldLabel}>Origin Health Post *</label>
                  <select
                    value={form.originFacilityId}
                    onChange={(e) => setForm({ ...form, originFacilityId: e.target.value })}
                    className="organic-select"
                  >
                    <option value="nandgaon_hwc">Nandgaon HWC (Sub-Centre)</option>
                    <option value="rampur_phc">Rampur PHC</option>
                    <option value="mobile_unit_01">Mobile Diagnostic Unit 01</option>
                  </select>
                </div>

                <div>
                  <label style={styles.fieldLabel}>Destination Facility *</label>
                  <select
                    value={form.destFacilityId}
                    onChange={(e) => setForm({ ...form, destFacilityId: e.target.value })}
                    className="organic-select"
                  >
                    <option value="seva_chc">Seva Community Health Centre (CHC)</option>
                    <option value="district_civil_hosp">District Civil Hospital Jabalpur</option>
                    <option value="rampur_phc">Rampur PHC</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>Service Required *</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="organic-select"
                >
                  <option value="blood_test">CBC Blood Test / Lab Diagnostics</option>
                  <option value="maternal_care">Maternal Care / High-Risk ANC</option>
                  <option value="xray">Chest X-Ray Machine</option>
                  <option value="emergency_triage">Trauma Stabilization &amp; Emergency</option>
                  <option value="icu_bed">ICU Bed Admission</option>
                  <option value="ambulance">Emergency Ambulance Transport</option>
                </select>
              </div>

              <div>
                <label style={styles.fieldLabel}>Clinical Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Referred due to local lab technician unavailability; patient exhibits fever for 5 days."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="organic-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '12px 0' }}
              >
                <Send size={15} />
                <span>{loading ? 'Creating Referral...' : 'Issue Digital Referral Ticket'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Issued Ticket & Tracking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Issued Ticket Display */}
          {createdReferral && (
            <div className="organic-card" style={styles.ticketCard}>
              <div style={styles.ticketHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--color-sage-light)" />
                  <span style={styles.ticketTag}>Referral Issued Successfully</span>
                </div>
                <button
                  onClick={() => copyCode(createdReferral.public_code || (createdReferral as any).publicCode)}
                  style={styles.copyBtn}
                  title="Copy code"
                >
                  <Copy size={13} />
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div style={styles.codeBox}>
                <span style={styles.codeLabel}>Public Tracking Code</span>
                <div style={styles.codeText}>
                  {createdReferral.public_code || (createdReferral as any).publicCode}
                </div>
                <p style={styles.codeHint}>
                  Share this code with the patient via SMS or slip for priority triage at arrival.
                </p>
              </div>

              <div style={styles.ticketDetails}>
                <div style={styles.ticketRow}>
                  <span>Patient:</span>
                  <strong>
                    {createdReferral.patient_name || (createdReferral as any).patientName} (
                    {createdReferral.patient_phone || (createdReferral as any).patientPhone})
                  </strong>
                </div>
                <div style={styles.ticketRow}>
                  <span>Urgency:</span>
                  <span style={styles.urgencyTag}>{createdReferral.urgency}</span>
                </div>
                <div style={styles.ticketRow}>
                  <span>Current Status:</span>
                  <span style={{ color: 'var(--color-sage-light)', fontWeight: 700 }}>
                    {createdReferral.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Referral Status Tracker */}
          <div className="organic-card">
            <h3 style={styles.sectionHeading}>
              <Search size={16} color="var(--color-sand-light)" />
              <span>Track Referral Lifecycle</span>
            </h3>

            <form onSubmit={handleTrack} style={styles.trackForm}>
              <input
                type="text"
                placeholder="Enter Code (e.g. REF-4821)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="organic-input"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}
              />
              <button type="submit" disabled={loading} className="btn-secondary" style={{ padding: '0 20px' }}>
                Track
              </button>
            </form>

            {trackedReferral && (
              <div style={styles.trackedResultBox}>
                <div style={styles.trackedTopRow}>
                  <span style={styles.trackedCode}>
                    {trackedReferral.public_code || (trackedReferral as any).publicCode}
                  </span>
                  <span className={`badge-pill badge-${trackedReferral.status === 'COMPLETED' ? 'available' : 'limited'}`}>
                    {trackedReferral.status}
                  </span>
                </div>

                <div style={styles.trackedMeta}>
                  <p><strong>Patient:</strong> {trackedReferral.patient_name || (trackedReferral as any).patientName}</p>
                  <p>
                    <strong>Route:</strong> {trackedReferral.origin_facility_name || (trackedReferral as any).originFacilityName || trackedReferral.origin_facility_id || (trackedReferral as any).originFacilityId}{' '}
                    <ArrowRight size={12} style={{ display: 'inline', margin: '0 4px' }} />{' '}
                    {trackedReferral.dest_facility_name || (trackedReferral as any).destFacilityName || trackedReferral.dest_facility_id || (trackedReferral as any).destFacilityId}
                  </p>
                  <p><strong>Service:</strong> {trackedReferral.service_name || (trackedReferral as any).serviceName || trackedReferral.service_id || (trackedReferral as any).serviceId}</p>
                  {trackedReferral.notes && (
                    <p style={{ color: 'var(--text-muted)' }}><strong>Notes:</strong> {trackedReferral.notes}</p>
                  )}
                </div>

                {/* Timeline Events */}
                {((trackedReferral.events || (trackedReferral as any).timeline) && (trackedReferral.events || (trackedReferral as any).timeline).length > 0) && (
                  <div style={styles.timelineBox}>
                    <span style={styles.timelineHeading}>Audit &amp; Status Transitions:</span>
                    <div style={styles.timelineList}>
                      {(trackedReferral.events || (trackedReferral as any).timeline).map((evt: any) => (
                        <div key={evt.id} style={styles.timelineItem}>
                          <div style={styles.timelineDot} />
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-pure)' }}>
                              {evt.to_status || evt.toStatus || evt.status}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                              ({new Date(evt.created_at || evt.createdAt || Date.now()).toLocaleTimeString()})
                            </span>
                            {evt.reason && <p style={styles.timelineReason}>{evt.reason}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bannerCard: {
    backgroundColor: 'rgba(32, 92, 67, 0.25)',
    borderLeft: '4px solid var(--color-sage)',
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
    maxWidth: '720px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  sectionHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-pure)',
    marginBottom: '16px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--status-unavailable-bg)',
    border: '1px solid var(--status-unavailable-border)',
    color: 'var(--status-unavailable-text)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '12.5px',
    marginBottom: '16px',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-subtle)',
    marginBottom: '6px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  ticketCard: {
    backgroundColor: 'rgba(32, 92, 67, 0.3)',
    border: '1px solid var(--color-sage)',
    boxShadow: 'var(--shadow-glow-sage)',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '10px',
    marginBottom: '12px',
  },
  ticketTag: {
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'var(--color-sage-light)',
  },
  copyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-pure)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  codeBox: {
    textAlign: 'center' as const,
    padding: '12px 0',
  },
  codeLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  codeText: {
    fontSize: '32px',
    fontWeight: 900,
    fontFamily: 'monospace',
    letterSpacing: '0.15em',
    color: '#ffffff',
    margin: '4px 0',
  },
  codeHint: {
    fontSize: '12px',
    color: 'var(--text-subtle)',
    maxWidth: '380px',
    margin: '0 auto',
  },
  ticketDetails: {
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    fontSize: '12.5px',
  },
  ticketRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-subtle)',
  },
  urgencyTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--color-terracotta-light)',
  },
  trackForm: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  trackedResultBox: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  trackedTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '8px',
  },
  trackedCode: {
    fontSize: '16px',
    fontWeight: 800,
    fontFamily: 'monospace',
    color: 'var(--color-sand-light)',
  },
  trackedMeta: {
    fontSize: '12.5px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    color: 'var(--text-pure)',
  },
  timelineBox: {
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '10px',
  },
  timelineHeading: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '8px',
  },
  timelineList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '12px',
  },
  timelineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-sage)',
    marginTop: '5px',
    flexShrink: 0,
  },
  timelineReason: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
    margin: '2px 0 0 0',
  },
};
