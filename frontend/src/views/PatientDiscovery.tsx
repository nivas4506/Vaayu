import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { lookupPincode } from '../../../api/pincode';
import { discoverFacilities } from '../../../api/discovery';
import { PincodeSearchBar } from '../components/PincodeSearchBar';
import { StatusBadge } from '../components/StatusBadge';
import { Facility, PincodeLookupResponse } from '../types/index';
import {
  Building2,
  Navigation,
  Phone,
  Clock,
  Stethoscope,
  Baby,
  Syringe,
  TestTube2,
  Scan,
  HeartPulse,
  Bed,
  Ambulance,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

export const PatientDiscovery: React.FC = () => {
  const { selectedPincode, setPincode, selectedServiceId, setServiceId } = useAppStore();
  const [pincodeData, setPincodeData] = useState<PincodeLookupResponse | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [alternates, setAlternates] = useState<Facility[]>([]);
  const [gapDetected, setGapDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const servicesList = [
    { id: '', label: 'All Services', icon: <Stethoscope size={14} /> },
    { id: 'consultation', label: 'General OPD', icon: <Stethoscope size={14} /> },
    { id: 'maternal_care', label: 'Maternal & ANC', icon: <Baby size={14} /> },
    { id: 'immunization', label: 'Immunization', icon: <Syringe size={14} /> },
    { id: 'blood_test', label: 'Diagnostics & CBC', icon: <TestTube2 size={14} /> },
    { id: 'xray', label: 'X-Ray Imaging', icon: <Scan size={14} /> },
    { id: 'emergency_triage', label: 'Emergency Trauma', icon: <HeartPulse size={14} /> },
    { id: 'icu_bed', label: 'ICU Beds', icon: <Bed size={14} /> },
    { id: 'ambulance', label: 'Ambulance Transport', icon: <Ambulance size={14} /> },
  ];

  const handleSearch = async (code: string) => {
    setPincode(code);
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch location details from PIN API
      const pinRes = await lookupPincode(code);
      setPincodeData(pinRes);

      // 2. Fetch ranked facilities
      const discRes = await discoverFacilities({
        pincode: code,
        service_id: selectedServiceId || undefined,
      });

      setFacilities(discRes.facilities || []);
      setAlternates(discRes.alternates || []);
      setGapDetected(discRes.gap_detected || false);
    } catch (err: any) {
      setError(err.message || 'Failed to lookup healthcare facilities for this PIN code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(selectedPincode);
  }, [selectedServiceId]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Header */}
      <div style={styles.heroSection}>
        <span style={styles.heroTag}>Rural Healthcare Access</span>
        <h2 style={styles.heroTitle}>Find Verified Healthcare Facilities</h2>
        <p style={styles.heroSubtitle}>
          Instant lookup across Indian PIN codes for Primary Health Centres (PHCs), CHCs, and District Hospitals with verified live service capabilities.
        </p>
      </div>

      {/* Search Bar */}
      <PincodeSearchBar
        initialPincode={selectedPincode}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Service Category Pills */}
      <div style={styles.categoriesScroll}>
        {servicesList.map((svc) => {
          const isSelected = selectedServiceId === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => setServiceId(svc.id)}
              style={{
                ...styles.categoryChip,
                backgroundColor: isSelected ? 'var(--color-sage)' : 'var(--bg-secondary)',
                borderColor: isSelected ? 'var(--color-sage-light)' : 'var(--border-subtle)',
                color: isSelected ? '#0c1812' : 'var(--text-subtle)',
                fontWeight: isSelected ? 700 : 500,
                boxShadow: isSelected ? '0 2px 10px rgba(45, 122, 88, 0.35)' : 'none',
              }}
            >
              {svc.icon}
              <span>{svc.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} color="var(--status-unavailable-text)" />
          <span>{error}</span>
        </div>
      )}

      {/* Service Gap Alert Banner */}
      {gapDetected && (
        <div style={styles.gapBanner}>
          <ShieldAlert size={20} color="var(--color-terracotta-light)" />
          <div>
            <h4 style={styles.gapBannerTitle}>Service Gap Detected in Nearest Facility</h4>
            <p style={styles.gapBannerDesc}>
              The selected service is currently limited or unavailable at your closest facility. Showing recommended higher-tier alternate facilities below.
            </p>
          </div>
        </div>
      )}

      {/* Location & PIN Info Card */}
      {pincodeData && (
        <div className="organic-card" style={styles.pincodeInfoCard}>
          <div style={styles.pincodeInfoLeft}>
            <div style={styles.pincodeTagRow}>
              <span style={styles.pincodeBadge}>PIN Code {pincodeData.pincode}</span>
              <span style={styles.pincodeSource}>
                Directory: <strong>{pincodeData.source === 'LOCAL_CACHE' ? 'Verified Local Cache' : 'India Post Live API'}</strong>
              </span>
            </div>
            <h3 style={styles.districtName}>
              {pincodeData.district}, {pincodeData.state}
              {pincodeData.block && <span style={styles.blockName}> ({pincodeData.block} Block)</span>}
            </h3>
            {pincodeData.villages && pincodeData.villages.length > 0 && (
              <p style={styles.villagesList}>
                Post Offices / Villages: {pincodeData.villages.slice(0, 6).join(', ')}
                {pincodeData.villages.length > 6 ? ` +${pincodeData.villages.length - 6} more` : ''}
              </p>
            )}
          </div>

          <div style={styles.pincodeInfoRight}>
            <span style={styles.facilityCountNum}>{facilities.length}</span>
            <span style={styles.facilityCountLabel}>Facilities Found</span>
          </div>
        </div>
      )}

      {/* Facilities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={styles.loadingBox}>
            <div className="spinner-icon" style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Querying rural facility registry and live service states...</p>
          </div>
        ) : facilities.length > 0 ? (
          facilities.map((facility, index) => (
            <div key={facility.id} className="organic-card" style={styles.facilityCard}>
              <div style={styles.facilityTopRow}>
                <div style={styles.facilityMainInfo}>
                  <div style={styles.facilityIndex}>#{index + 1}</div>
                  <div>
                    <div style={styles.facilityTitleRow}>
                      <h4 style={styles.facilityName}>{facility.name}</h4>
                      <span style={styles.facilityTypeTag}>{facility.type}</span>
                    </div>
                    <p style={styles.facilityAddress}>
                      <span>{facility.address}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-pure)', fontWeight: 600 }}>{facility.village}</span>
                    </p>
                  </div>
                </div>

                <div style={styles.distanceBox}>
                  <Navigation size={13} color="var(--color-sage-light)" />
                  <span>{facility.distance_km ?? 0} km away</span>
                </div>
              </div>

              {/* Operating Info Bar */}
              <div style={styles.facilityMetaRow}>
                <div style={styles.metaItem}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>{facility.hours}</span>
                </div>
                <div style={styles.metaItem}>
                  <Phone size={14} color="var(--text-muted)" />
                  <a href={`tel:${facility.contact}`} style={styles.phoneLink}>
                    {facility.contact}
                  </a>
                </div>
              </div>

              {/* Service Availability Matrix */}
              {facility.services && facility.services.length > 0 && (
                <div style={styles.servicesContainer}>
                  <h5 style={styles.servicesHeader}>Live Medical Capabilities &amp; Status:</h5>
                  <div style={styles.servicesGrid}>
                    {facility.services.map((svc) => (
                      <div key={svc.service_id} style={styles.serviceItem}>
                        <div>
                          <span style={styles.serviceName}>{svc.service_name}</span>
                          {svc.capacity_note && (
                            <span style={styles.capacityNote}>Note: {svc.capacity_note}</span>
                          )}
                        </div>
                        <StatusBadge status={svc.status} isStale={svc.is_stale} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="organic-card" style={styles.emptyState}>
            <Building2 size={36} color="var(--text-muted)" />
            <h4 style={styles.emptyTitle}>No Healthcare Facilities Found</h4>
            <p style={styles.emptyDesc}>
              No registered public facilities in this immediate area. Try selecting another service filter or searching nearby PIN codes.
            </p>
          </div>
        )}
      </div>

      {/* Suggested Alternate Facilities */}
      {alternates && alternates.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h3 style={styles.alternateHeader}>
            <Building2 size={18} color="var(--color-sand-light)" />
            <span>Recommended Alternate Facilities in District</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            {alternates.map((alt) => (
              <div key={alt.id} className="organic-card" style={{ ...styles.facilityCard, borderLeft: '4px solid var(--color-sand)' }}>
                <div style={styles.facilityTopRow}>
                  <div>
                    <h4 style={styles.facilityName}>{alt.name}</h4>
                    <p style={styles.facilityAddress}>{alt.address} • {alt.village}</p>
                  </div>
                  <div style={styles.distanceBox}>
                    <Navigation size={13} color="var(--color-sand-light)" />
                    <span>{alt.distance_km} km away</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  heroSection: {
    textAlign: 'center' as const,
    maxWidth: '680px',
    margin: '0 auto',
  },
  heroTag: {
    display: 'inline-block',
    backgroundColor: 'rgba(59, 163, 119, 0.15)',
    color: 'var(--color-sage-light)',
    border: '1px solid rgba(59, 163, 119, 0.3)',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    padding: '3px 10px',
    borderRadius: 'var(--radius-pill)',
    marginBottom: '8px',
  },
  heroTitle: {
    fontSize: '28px',
    fontWeight: 800,
    color: 'var(--text-pure)',
    marginBottom: '6px',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: 'var(--text-subtle)',
    lineHeight: 1.5,
  },
  categoriesScroll: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto' as const,
    paddingBottom: '6px',
    maxWidth: '100%',
  },
  categoryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    fontSize: '12.5px',
    whiteSpace: 'nowrap' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--status-unavailable-bg)',
    border: '1px solid var(--status-unavailable-border)',
    color: 'var(--status-unavailable-text)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13.5px',
  },
  gapBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    backgroundColor: 'rgba(196, 93, 62, 0.2)',
    border: '1px solid var(--border-medium)',
    borderLeft: '4px solid var(--color-terracotta)',
    padding: '14px 18px',
    borderRadius: 'var(--radius-md)',
  },
  gapBannerTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--color-terracotta-light)',
    margin: 0,
  },
  gapBannerDesc: {
    fontSize: '12.5px',
    color: 'var(--text-subtle)',
    margin: '2px 0 0 0',
  },
  pincodeInfoCard: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    backgroundColor: 'var(--bg-secondary)',
  },
  pincodeInfoLeft: {
    flex: 1,
  },
  pincodeTagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  pincodeBadge: {
    fontSize: '11px',
    fontWeight: 800,
    backgroundColor: 'rgba(59, 163, 119, 0.2)',
    color: 'var(--color-sage-light)',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid rgba(59, 163, 119, 0.4)',
    textTransform: 'uppercase' as const,
  },
  pincodeSource: {
    fontSize: '11.5px',
    color: 'var(--text-muted)',
  },
  districtName: {
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-pure)',
    margin: '2px 0',
  },
  blockName: {
    fontSize: '14px',
    color: 'var(--text-subtle)',
    fontWeight: 500,
  },
  villagesList: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  pincodeInfoRight: {
    textAlign: 'right' as const,
  },
  facilityCountNum: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 900,
    color: 'var(--color-sage-light)',
    lineHeight: 1,
  },
  facilityCountLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
  },
  loadingBox: {
    textAlign: 'center' as const,
    padding: '48px 0',
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'var(--color-sage)',
    borderRadius: '50%',
    margin: '0 auto 12px auto',
  },
  loadingText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  facilityCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  facilityTopRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  facilityMainInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  facilityIndex: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--color-sage-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '13px',
    flexShrink: 0,
  },
  facilityTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  facilityName: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-pure)',
    margin: 0,
  },
  facilityTypeTag: {
    fontSize: '10px',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    padding: '1px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--bg-elevated)',
    color: 'var(--color-sage-light)',
    border: '1px solid var(--border-subtle)',
  },
  facilityAddress: {
    fontSize: '12.5px',
    color: 'var(--text-subtle)',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  distanceBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: 'rgba(59, 163, 119, 0.15)',
    border: '1px solid rgba(59, 163, 119, 0.3)',
    color: 'var(--color-sage-light)',
    fontSize: '12px',
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 'var(--radius-pill)',
  },
  facilityMetaRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '16px',
    padding: '8px 0',
    borderTop: '1px solid var(--border-subtle)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    color: 'var(--text-subtle)',
  },
  phoneLink: {
    color: 'var(--color-sage-light)',
    fontWeight: 600,
  },
  servicesContainer: {
    marginTop: '4px',
  },
  servicesHeader: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '8px',
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
  },
  serviceName: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: 'var(--text-pure)',
    display: 'block',
  },
  capacityNote: {
    fontSize: '10.5px',
    color: 'var(--color-sand-light)',
    display: 'block',
    marginTop: '2px',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: 'var(--bg-secondary)',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-pure)',
    marginTop: '10px',
  },
  emptyDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    maxWidth: '420px',
    margin: '4px auto 0 auto',
  },
  alternateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--color-sand-light)',
  },
};
