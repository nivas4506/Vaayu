import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Ambulance,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { useAppStore, TAXONOMY_SERVICES } from '../store';
import { t } from '../i18n';
import { AvailabilityStatus, Facility } from '../types';
import { GlassCard, PrimaryButton, SecondaryButton, StatusBadge, SectionHeading } from './ui';

export type StaffTab = 'dashboard' | 'services' | 'referrals' | 'info';

const statuses: AvailabilityStatus[] = ['available', 'limited', 'unavailable'];

interface StaffWorkspaceProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEmergency?: () => void;
}

export default function StaffWorkspace({
  activeTab = 'dashboard',
  onTabChange,
  onEmergency,
}: StaffWorkspaceProps) {
  const {
    language,
    facilities,
    referrals,
    updateReferralStatus,
    updateFacilityServiceStatus,
  } = useAppStore((s) => ({
    language: s.language,
    facilities: s.facilities,
    referrals: s.referrals,
    updateReferralStatus: s.updateReferralStatus,
    updateFacilityServiceStatus: s.updateFacilityServiceStatus,
  }));

  const [facilityId, setFacilityId] = useState(facilities[2]?.id || facilities[0].id); // default Seva CHC
  const facility = facilities.find((f) => f.id === facilityId) || facilities[0];

  const incoming = useMemo(() => {
    return referrals.filter((r) => r.destFacilityId === facilityId && r.status !== 'completed');
  }, [referrals, facilityId]);

  const availableServicesCount = useMemo(() => {
    return facility.services.filter((s) => s.status === 'available').length;
  }, [facility]);

  const pendingRequestsCount = useMemo(() => {
    return incoming.filter((r) => r.status === 'created').length;
  }, [incoming]);

  const setTab = (tab: StaffTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const currentTab: StaffTab =
    activeTab === 'services' || activeTab === 'referrals' || activeTab === 'info'
      ? activeTab
      : 'dashboard';

  return (
    <div className="safe-page mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Tab Navigation Sub-bar */}
      <div className="mb-6 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {[
            { id: 'dashboard', label: t('nav_dashboard', language), icon: Building2 },
            { id: 'services', label: t('nav_facility_services', language), icon: Stethoscope, count: availableServicesCount },
            { id: 'referrals', label: t('nav_incoming_referrals', language), icon: ClipboardList, count: incoming.length },
            { id: 'info', label: t('nav_facility_info', language), icon: Info },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as StaffTab)}
                className={`tap-target inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                  active
                    ? 'bg-mint-600 text-white shadow-soft'
                    : 'bg-white/80 text-sage-700 hover:bg-mint-50 hover:text-mint-700 border border-sage-100'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                      active ? 'bg-white text-mint-700' : 'bg-mint-100 text-mint-800'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {onEmergency && (
          <button
            onClick={onEmergency}
            className="tap-target inline-flex items-center gap-1.5 rounded-xl bg-status-unavailable px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 sm:px-4"
          >
            <Siren size={15} />
            <span className="hidden sm:inline">EMERGENCY SOS</span>
            <span className="sm:hidden">SOS</span>
          </button>
        )}
      </div>

      {/* Facility Switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-sage-500 mr-1">Active Facility:</span>
        {facilities.map((f) => (
          <button
            key={f.id}
            onClick={() => setFacilityId(f.id)}
            className={`tap-target rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              f.id === facilityId
                ? 'bg-mint-600 text-white shadow-soft'
                : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Facility Header Card */}
            <GlassCard strong className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-mint-800">
                      <Sparkles size={13} /> {t('role_staff', language)}
                    </span>
                    <span className="text-xs text-sage-500 font-semibold">{facility.type} Node</span>
                  </div>
                  <h1 className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-3xl">
                    {facility.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-sage-600 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-mint-600" />
                      {facility.hours}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={14} className="text-mint-600" />
                      {facility.contact}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-mint-600" />
                      {facility.village}, {facility.district || 'Jabalpur'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    className="text-xs sm:text-sm px-4 py-2.5"
                    onClick={() => setTab('services')}
                  >
                    <Stethoscope size={16} /> Manage Services
                  </PrimaryButton>
                  <SecondaryButton
                    className="text-xs sm:text-sm px-4 py-2.5"
                    onClick={() => setTab('referrals')}
                  >
                    <ClipboardList size={16} /> Incoming Referrals ({incoming.length})
                  </SecondaryButton>
                </div>
              </div>
            </GlassCard>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    Available Services
                  </span>
                  <Stethoscope className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{availableServicesCount}</b>
                <span className="text-xs text-sage-600">Active services</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    Incoming Referrals
                  </span>
                  <ClipboardList className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{incoming.length}</b>
                <span className="text-xs text-sage-600">Total queued</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    Pending Requests
                  </span>
                  <AlertCircle className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{pendingRequestsCount}</b>
                <span className="text-xs text-sage-600">Awaiting acceptance</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    Emergency Status
                  </span>
                  <Ambulance className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-base sm:text-lg text-sage-900 font-bold">
                  {facility.emergencyAvailable ? 'Ready' : 'Not 24x7'}
                </b>
                <span className="text-xs text-sage-600">
                  {facility.ambulanceAvailable ? 'Ambulance Standby' : 'Standard Transport'}
                </span>
              </GlassCard>
            </div>

            {/* Quick Service Availability & Referrals preview */}
            <div className="grid gap-6 md:grid-cols-2">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sage-900">Service Availability Snapshot</h3>
                  <button
                    onClick={() => setTab('services')}
                    className="text-xs font-bold text-mint-700 hover:underline"
                  >
                    Edit all →
                  </button>
                </div>
                <div className="space-y-2">
                  {facility.services.slice(0, 4).map((s) => {
                    const svc = TAXONOMY_SERVICES.find((x) => x.id === s.serviceId);
                    return (
                      <div
                        key={s.serviceId}
                        className="flex items-center justify-between rounded-xl bg-sage-50/70 p-3 text-xs"
                      >
                        <span className="font-semibold text-sage-800">
                          {svc ? t(svc.nameKey as any, language) : s.serviceId}
                        </span>
                        <StatusBadge status={s.status} lang={language} />
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sage-900">Incoming Referrals ({incoming.length})</h3>
                  <button
                    onClick={() => setTab('referrals')}
                    className="text-xs font-bold text-mint-700 hover:underline"
                  >
                    View queue →
                  </button>
                </div>
                {incoming.length === 0 ? (
                  <p className="text-xs text-sage-500 py-4 text-center">{t('no_referrals_yet', language)}</p>
                ) : (
                  <div className="space-y-2">
                    {incoming.slice(0, 3).map((r) => {
                      const svc = TAXONOMY_SERVICES.find((s) => s.id === r.requestedServiceId);
                      return (
                        <div
                          key={r.code}
                          className="rounded-xl bg-sage-50/70 p-3 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-mint-700">{r.code}</span> ·{' '}
                            <span className="font-semibold text-sage-800">{r.patientName}</span>
                            <p className="text-[11px] text-sage-500 mt-0.5">
                              {svc ? t(svc.nameKey as any, language) : r.requestedServiceId}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-sage-700">
                            {t(`status_${r.status}` as any, language)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* SERVICES TAB */}
        {currentTab === 'services' && (
          <motion.div
            key="services"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <button
                onClick={() => setTab('dashboard')}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-extrabold text-sage-900">{t('nav_facility_services', language)}</h1>
              <p className="text-xs text-sage-500">Update capacity & service availability in real time</p>
            </div>

            <GlassCard className="p-6">
              <h3 className="mb-4 font-bold text-sage-900">{t('capacity', language)}: {facility.name}</h3>
              <div className="space-y-3">
                {facility.services.map((s) => {
                  const svc = TAXONOMY_SERVICES.find((x) => x.id === s.serviceId);
                  return (
                    <div
                      key={s.serviceId}
                      className="flex flex-col gap-3 rounded-2xl border border-sage-100 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between shadow-soft"
                    >
                      <div>
                        <p className="text-sm font-bold text-sage-900">
                          {svc ? t(svc.nameKey as any, language) : s.serviceId}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={s.status} lang={language} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {statuses.map((st) => (
                          <button
                            key={st}
                            onClick={() => updateFacilityServiceStatus(facility.id, s.serviceId, st)}
                            className={`tap-target rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                              s.status === st
                                ? 'bg-mint-600 text-white shadow-soft'
                                : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
                            }`}
                          >
                            {t(`status_${st}` as any, language)}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* REFERRALS TAB */}
        {currentTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <button
                onClick={() => setTab('dashboard')}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-extrabold text-sage-900">{t('nav_incoming_referrals', language)}</h1>
              <p className="text-xs text-sage-500">Coordinate and process incoming patients arriving at this facility</p>
            </div>

            {incoming.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ClipboardList className="mx-auto text-sage-400" size={42} />
                <p className="mt-3 text-base font-semibold text-sage-800">{t('no_referrals_yet', language)}</p>
                <p className="mt-1 text-xs text-sage-500">New referrals created by patients or ASHA workers will appear here.</p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {incoming.map((r) => {
                  const svc = TAXONOMY_SERVICES.find((s) => s.id === r.requestedServiceId);
                  const origin = facilities.find((f) => f.id === r.originFacilityId);
                  return (
                    <motion.div key={r.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <GlassCard className="p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-extrabold text-mint-700">{r.code}</p>
                              <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-xs font-bold text-mint-800 border border-mint-200">
                                {t(r.urgency === 'urgent' ? 'urgency_urgent' : 'urgency_routine', language)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-sage-800">
                              {r.patientName} · <span className="text-sage-600 font-normal">{r.patientPhone}</span>
                            </p>
                            <p className="text-xs text-sage-500 mt-0.5">
                              {svc ? t(svc.nameKey as any, language) : r.requestedServiceId} · {t('origin_label', language)}: {origin?.name || 'Local clinic'}
                            </p>
                          </div>
                          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700 self-start sm:self-auto">
                            {t(`status_${r.status}` as any, language)}
                          </span>
                        </div>

                        {r.notes && (
                          <p className="mt-3 rounded-xl bg-sage-50/70 p-3 text-xs text-sage-700">
                            <b>Notes:</b> {r.notes}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2 border-t border-sage-100 pt-3">
                          {r.status === 'created' && (
                            <PrimaryButton
                              className="px-4 py-2 text-xs sm:text-sm"
                              onClick={() => updateReferralStatus(r.code, 'accepted')}
                            >
                              {t('accept_referral', language)}
                            </PrimaryButton>
                          )}
                          {r.status === 'accepted' && (
                            <PrimaryButton
                              className="px-4 py-2 text-xs sm:text-sm"
                              onClick={() => updateReferralStatus(r.code, 'ready_for_visit')}
                            >
                              {t('mark_ready', language)}
                            </PrimaryButton>
                          )}
                          {r.status === 'ready_for_visit' && (
                            <PrimaryButton
                              className="px-4 py-2 text-xs sm:text-sm"
                              onClick={() => updateReferralStatus(r.code, 'completed')}
                            >
                              {t('complete', language)}
                            </PrimaryButton>
                          )}
                          <SecondaryButton
                            className="px-4 py-2 text-xs sm:text-sm"
                            onClick={() => updateReferralStatus(r.code, 'redirected')}
                          >
                            {t('redirect', language)}
                          </SecondaryButton>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* FACILITY INFO TAB */}
        {currentTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <button
                onClick={() => setTab('dashboard')}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-extrabold text-sage-900">{t('nav_facility_info', language)}</h1>
              <p className="text-xs text-sage-500">Official registry details and emergency contact configuration</p>
            </div>

            <GlassCard className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-sage-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-500">Facility Type & Code</p>
                  <b className="mt-1 block text-lg text-sage-900">{facility.name}</b>
                  <p className="text-xs text-sage-600 mt-1">{facility.type} · ID: {facility.id}</p>
                </div>

                <div className="rounded-2xl bg-sage-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-500">Operating Hours</p>
                  <b className="mt-1 block text-lg text-sage-900">{facility.hours}</b>
                  <p className="text-xs text-sage-600 mt-1">Status: Active</p>
                </div>

                <div className="rounded-2xl bg-sage-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-500">Location & Village</p>
                  <b className="mt-1 block text-lg text-sage-900">{facility.village}, {facility.pincode}</b>
                  <p className="text-xs text-sage-600 mt-1">{facility.district || 'Jabalpur'}, {facility.state || 'Madhya Pradesh'}</p>
                </div>

                <div className="rounded-2xl bg-sage-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-sage-500">Emergency & Ambulance</p>
                  <b className="mt-1 block text-lg text-sage-900">
                    {facility.emergencyAvailable ? 'Emergency 24x7 Available' : 'Standard Routine Hours'}
                  </b>
                  <p className="text-xs text-sage-600 mt-1">
                    {facility.ambulanceAvailable ? 'Dedicated Ambulance on site' : 'District ambulance link'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
