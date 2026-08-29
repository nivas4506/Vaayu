import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { updateServiceAvailability } from '../../../api/availability';
import { updateReferralStatus } from '../../../api/referrals';
import { StatusBadge } from '../components/StatusBadge';
import { ServiceAvailabilityStatus, ReferralStatus } from '../types/index';
import {
  Building2,
  Save,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const FacilityWorkspace: React.FC = () => {
  const { isOnline, enqueueOfflineItem } = useAppStore();

  // Availability Update State
  const [facilityId, setFacilityId] = useState('rampur_phc');
  const [serviceId, setServiceId] = useState('blood_test');
  const [status, setStatus] = useState<ServiceAvailabilityStatus>('UNAVAILABLE');
  const [capacityNote, setCapacityNote] = useState('Lab technician unavailable due to training');

  // Inbound Referral Desk State
  const [refPublicCode, setRefPublicCode] = useState('REF-4821');
  const [refStatus, setRefStatus] = useState<ReferralStatus>('ACCEPTED');
  const [refReason, setRefReason] = useState('Accepted by Rampur PHC desk');

  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'offline'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      facilityId,
      serviceId,
      status,
      capacityNote: capacityNote.trim() || undefined,
      source: 'FACILITY_REPORTED' as const,
    };

    if (!isOnline) {
      enqueueOfflineItem({
        facility_id: facilityId,
        service_id: serviceId,
        status,
        capacity_note: capacityNote,
      });
      setMessage({
        type: 'offline',
        text: 'Network offline! Update queued into Local Browser Outbox for auto-sync when reconnected.',
      });
      setLoading(false);
      return;
    }

    try {
      await updateServiceAvailability(payload);
      setMessage({
        type: 'success',
        text: 'Service capability & availability updated successfully on district server!',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: `Server error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateReferralStatus(
        refPublicCode.trim().toUpperCase(),
        refStatus,
        'usr_staff_rampur',
        refReason.trim() || undefined
      );
      setMessage({
        type: 'success',
        text: `Referral ${refPublicCode.toUpperCase()} transitioned to ${refStatus}!`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: `Referral update failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Banner Card */}
      <div className="organic-card" style={styles.bannerCard}>
        <div style={styles.bannerLeft}>
          <div style={styles.bannerTag}>
            <Building2 size={14} color="var(--color-sand-light)" />
            <span>Facility Operations Desk</span>
          </div>
          <h2 style={styles.bannerTitle}>Real-Time Capacity &amp; Inbound Triage</h2>
          <p style={styles.bannerDesc}>
            Broadcast live equipment, diagnostic, and bed availability across the district network and manage incoming digital patient referrals.
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          style={{
            ...styles.alertBanner,
            backgroundColor:
              message.type === 'success'
                ? 'var(--status-available-bg)'
                : message.type === 'offline'
                ? 'var(--status-limited-bg)'
                : 'var(--status-unavailable-bg)',
            borderColor:
              message.type === 'success'
                ? 'var(--status-available-border)'
                : message.type === 'offline'
                ? 'var(--status-limited-border)'
                : 'var(--status-unavailable-border)',
            color:
              message.type === 'success'
                ? 'var(--status-available-text)'
                : message.type === 'offline'
                ? 'var(--status-limited-text)'
                : 'var(--status-unavailable-text)',
          }}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : message.type === 'offline' ? (
            <Clock size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column: Update Service Capability */}
        <div className="organic-card">
          <h3 style={styles.sectionHeading}>
            <Activity size={16} color="var(--color-sage-light)" />
            <span>Update Live Service Capability</span>
          </h3>

          <form onSubmit={handleUpdateAvailability} style={styles.formContainer}>
            <div>
              <label style={styles.fieldLabel}>Select Healthcare Facility *</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="organic-select"
              >
                <option value="rampur_phc">Rampur PHC (Primary Health Centre)</option>
                <option value="nandgaon_hwc">Nandgaon HWC (Health &amp; Wellness Centre)</option>
                <option value="seva_chc">Seva Community Health Centre (CHC)</option>
                <option value="district_civil_hosp">District Civil Hospital Jabalpur</option>
              </select>
            </div>

            <div>
              <label style={styles.fieldLabel}>Select Medical Service / Facility Department *</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="organic-select"
              >
                <option value="blood_test">CBC Blood Test / Lab Diagnostics</option>
                <option value="maternal_care">Maternal ANC Checkup</option>
                <option value="xray">Chest X-Ray Machine</option>
                <option value="emergency_triage">Emergency Trauma Stabilization</option>
                <option value="icu_bed">ICU Bed Availability</option>
                <option value="ambulance">Emergency Ambulance Transport</option>
              </select>
            </div>

            <div>
              <label style={styles.fieldLabel}>Live Availability Status *</label>
              <div style={styles.statusButtonsGrid}>
                {(['AVAILABLE', 'LIMITED', 'UNAVAILABLE'] as ServiceAvailabilityStatus[]).map((st) => {
                  const isSelected = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      style={{
                        ...styles.statusSelectBtn,
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                        borderColor: isSelected ? 'var(--color-sage-light)' : 'var(--border-subtle)',
                        boxShadow: isSelected ? '0 0 12px var(--color-sage-glow)' : 'none',
                        opacity: isSelected ? 1 : 0.65,
                      }}
                    >
                      <StatusBadge status={st} size="sm" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={styles.fieldLabel}>Capacity Note / Reason (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. 2 beds remaining, Reagent stock depleted, Power maintenance"
                value={capacityNote}
                onChange={(e) => setCapacityNote(e.target.value)}
                className="organic-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 0' }}
            >
              <Save size={15} />
              <span>{loading ? 'Saving...' : 'Broadcast Live Status'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Inbound Referral Desk */}
        <div className="organic-card">
          <h3 style={styles.sectionHeading}>
            <Layers size={16} color="var(--color-sand-light)" />
            <span>Inbound Referral Desk</span>
          </h3>

          <form onSubmit={handleUpdateReferral} style={styles.formContainer}>
            <div>
              <label style={styles.fieldLabel}>Referral Public Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. REF-4821"
                value={refPublicCode}
                onChange={(e) => setRefPublicCode(e.target.value)}
                className="organic-input"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.08em' }}
              />
            </div>

            <div>
              <label style={styles.fieldLabel}>Transition To New Status *</label>
              <select
                value={refStatus}
                onChange={(e) => setRefStatus(e.target.value as ReferralStatus)}
                className="organic-select"
              >
                <option value="ACCEPTED">ACCEPTED (Acknowledged by triage desk)</option>
                <option value="READY_FOR_VISIT">READY_FOR_VISIT (Bed / Doctor Assigned)</option>
                <option value="COMPLETED">COMPLETED (Care delivered &amp; discharged)</option>
                <option value="REJECTED">REJECTED (No capacity / redirected)</option>
                <option value="REDIRECTED">REDIRECTED (Forwarded to Higher Hospital)</option>
              </select>
            </div>

            <div>
              <label style={styles.fieldLabel}>Staff Clinical Note / Reason</label>
              <textarea
                rows={3}
                placeholder="e.g. Patient admitted to Ward B; blood drawn for testing."
                value={refReason}
                onChange={(e) => setRefReason(e.target.value)}
                className="organic-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-terracotta"
              style={{ width: '100%', padding: '12px 0' }}
            >
              <CheckCircle2 size={15} />
              <span>{loading ? 'Updating...' : 'Update Referral Status'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  bannerCard: {
    backgroundColor: 'rgba(212, 151, 59, 0.15)',
    borderLeft: '4px solid var(--color-sand)',
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
    color: 'var(--color-sand-light)',
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
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 600,
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
  statusButtonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  statusSelectBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 6px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};
