import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Calendar,
  ClipboardList,
  Clock,
  Droplet,
  FileHeart,
  Heart,
  HelpCircle,
  MapPin,
  Phone,
  Pill,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Thermometer,
  User,
  UserCheck,
  Weight,
} from 'lucide-react';
import { useAppStore } from '../store';
import { t } from '../i18n';
import { HealthRecord, Referral } from '../types';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading, StatusBadge } from './ui';
import PatientFlow from './PatientFlow';

export type PatientTab = 'dashboard' | 'find-care' | 'records' | 'referrals';

interface PatientDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEmergency?: () => void;
}

export default function PatientDashboard({
  activeTab = 'dashboard',
  onTabChange,
  onEmergency,
}: PatientDashboardProps) {
  const { language, session, users, healthRecords, referrals, facilities } = useAppStore((s) => ({
    language: s.language,
    session: s.session,
    users: s.users,
    healthRecords: s.healthRecords,
    referrals: s.referrals,
    facilities: s.facilities,
  }));

  // Resolve logged-in patient details
  const patient = useMemo(() => {
    return session ? users.find((u) => u.id === session.userId) : null;
  }, [session, users]);

  // Isolate records strictly for this patient
  const myRecords = useMemo(() => {
    if (!session) return [];
    return healthRecords.filter((r) => r.patientId === session.userId);
  }, [healthRecords, session]);

  // Isolate referrals for this patient
  const myReferrals = useMemo(() => {
    if (!patient) return [];
    return referrals.filter(
      (r) =>
        r.patientPhone === patient.mobile ||
        r.patientName.toLowerCase() === patient.name.toLowerCase()
    );
  }, [referrals, patient]);

  const activeReferralsCount = useMemo(() => {
    return myReferrals.filter((r) => r.status !== 'completed' && r.status !== 'redirected').length;
  }, [myReferrals]);

  const latestRecord = myRecords[0] || null;

  const setTab = (tab: PatientTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const currentTab = activeTab === 'find-care' || activeTab === 'records' || activeTab === 'referrals'
    ? activeTab
    : 'dashboard';

  return (
    <div className="safe-page mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Tab Navigation Sub-bar */}
      <div className="mb-6 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {[
            { id: 'dashboard', label: t('nav_dashboard', language), icon: FileHeart },
            { id: 'find-care', label: t('nav_find_care', language), icon: Search },
            { id: 'records', label: t('nav_health_records', language), icon: Activity },
            { id: 'referrals', label: t('nav_referrals', language), icon: ClipboardList, count: activeReferralsCount },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as PatientTab)}
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
            <span className="hidden sm:inline">{t('emergency_sos', language)}</span>
            <span className="sm:hidden">{t('sos_btn', language)}</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Patient Greeting & Profile Card */}
            <GlassCard strong className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-mint-800">
                      <Sparkles size={13} /> {t('role_patient', language)}
                    </span>
                    <span className="text-xs text-sage-500 font-semibold">{t('demo_health_portal', language)}</span>
                  </div>
                  <h1 className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-3xl">
                    {t('welcome_user', language)}, {patient?.name || 'Patient'}
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-sage-600 sm:text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={14} className="text-mint-600" />
                      {patient?.mobile || '9876543210'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} className="text-mint-600" />
                      {patient?.district || 'Jabalpur'}, {patient?.state || 'Madhya Pradesh'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <User size={14} className="text-mint-600" />
                      {patient?.address || 'Local Community Member'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:self-start">
                  <PrimaryButton
                    className="text-xs sm:text-sm px-4 py-2.5"
                    onClick={() => setTab('find-care')}
                  >
                    <Search size={16} /> {t('nav_find_care', language)}
                  </PrimaryButton>
                  <SecondaryButton
                    className="text-xs sm:text-sm px-4 py-2.5"
                    onClick={() => setTab('records')}
                  >
                    <Activity size={16} /> {t('previous_health_records', language)}
                  </SecondaryButton>
                </div>
              </div>
            </GlassCard>

            {/* Health Overview Summary Cards */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold uppercase tracking-wider text-sage-700">
                  {t('health_overview', language)}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <GlassCard className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                      {t('last_checkup', language)}
                    </span>
                    <Calendar size={17} className="text-mint-600" />
                  </div>
                  <b className="mt-2 block text-xl sm:text-2xl text-sage-900">
                    {latestRecord?.checkupDate || t('no_record', language)}
                  </b>
                  <span className="text-xs text-sage-600">
                    {latestRecord ? (latestRecord.facilityName || t('facility', language)) : t('no_record', language)}
                  </span>
                </GlassCard>

                <GlassCard className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                      {t('total_checkups', language)}
                    </span>
                    <FileHeart size={17} className="text-mint-600" />
                  </div>
                  <b className="mt-2 block text-xl sm:text-2xl text-sage-900">{myRecords.length}</b>
                  <span className="text-xs text-sage-600">{t('documented_visits', language)}</span>
                </GlassCard>

                <GlassCard className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                      {t('active_referrals', language)}
                    </span>
                    <ClipboardList size={17} className="text-mint-600" />
                  </div>
                  <b className="mt-2 block text-xl sm:text-2xl text-sage-900">{activeReferralsCount}</b>
                  <span className="text-xs text-sage-600">
                    {activeReferralsCount > 0 ? t('visit_in_progress', language) : t('no_active_referral', language)}
                  </span>
                </GlassCard>

                <GlassCard className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                      {t('last_recorded_status', language)}
                    </span>
                    <Heart size={17} className="text-mint-600" />
                  </div>
                  <b className="mt-2 block text-base sm:text-lg text-sage-900 font-bold">
                    {latestRecord?.status === 'completed'
                      ? t('vitals_stable', language)
                      : latestRecord?.status === 'follow_up'
                      ? t('follow_up_due', language)
                      : latestRecord?.status === 'referred'
                      ? 'Referred'
                      : t('normal', language)}
                  </b>
                  <span className="text-xs text-sage-600">
                    {latestRecord ? `${latestRecord.bloodPressure || '120/80'} mmHg` : t('normal_profile', language)}
                  </span>
                </GlassCard>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={() => setTab('find-care')}
                className="group text-left"
              >
                <GlassCard className="h-full p-5 transition-all hover:border-mint-300 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-100 text-mint-700 group-hover:bg-mint-600 group-hover:text-white transition-colors">
                      <Search size={20} />
                    </span>
                    <ArrowRight size={16} className="text-sage-400 group-hover:text-mint-600 transition-colors" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-sage-900">{t('nav_find_care', language)}</h3>
                  <p className="mt-1 text-xs text-sage-600">
                    {t('find_care_desc', language)}
                  </p>
                </GlassCard>
              </button>

              <button
                onClick={() => setTab('records')}
                className="group text-left"
              >
                <GlassCard className="h-full p-5 transition-all hover:border-mint-300 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-100 text-mint-700 group-hover:bg-mint-600 group-hover:text-white transition-colors">
                      <Activity size={20} />
                    </span>
                    <ArrowRight size={16} className="text-sage-400 group-hover:text-mint-600 transition-colors" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-sage-900">{t('nav_health_records', language)}</h3>
                  <p className="mt-1 text-xs text-sage-600">
                    {t('records_desc', language)}
                  </p>
                </GlassCard>
              </button>

              <button
                onClick={() => setTab('referrals')}
                className="group text-left"
              >
                <GlassCard className="h-full p-5 transition-all hover:border-mint-300 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-100 text-mint-700 group-hover:bg-mint-600 group-hover:text-white transition-colors">
                      <ClipboardList size={20} />
                    </span>
                    <ArrowRight size={16} className="text-sage-400 group-hover:text-mint-600 transition-colors" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-sage-900">{t('nav_referrals', language)}</h3>
                  <p className="mt-1 text-xs text-sage-600">
                    {t('referrals_desc', language)}
                  </p>
                </GlassCard>
              </button>
            </div>

            {/* Previous Health Records Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-sage-900">{t('previous_health_records', language)}</h2>
                  <p className="text-xs text-sage-500">{t('verified_history', language)}</p>
                </div>
                {myRecords.length > 2 && (
                  <button
                    onClick={() => setTab('records')}
                    className="text-xs font-bold text-mint-700 hover:underline"
                  >
                    {t('view_all', language)} ({myRecords.length})
                  </button>
                )}
              </div>

              {myRecords.length === 0 ? (
                <GlassCard className="p-6 text-center">
                  <FileHeart className="mx-auto text-sage-400" size={36} />
                  <p className="mt-2 text-sm font-semibold text-sage-700">{t('no_records_yet', language)}</p>
                  <p className="mt-1 text-xs text-sage-500">{t('asha_can_log', language)}</p>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {myRecords.slice(0, 2).map((record) => (
                    <HealthRecordCard key={record.id} record={record} language={language} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Find Care Tab - Integrates existing PatientFlow seamlessly */}
        {currentTab === 'find-care' && (
          <motion.div
            key="find-care"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <button
                onClick={() => setTab('dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
              >
                ← Back to Dashboard
              </button>
            </div>
            <PatientFlow />
          </motion.div>
        )}

        {/* My Health Records Tab */}
        {currentTab === 'records' && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => setTab('dashboard')}
                  className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
                >
                  ← {t('nav_dashboard', language)}
                </button>
                <h1 className="text-2xl font-extrabold text-sage-900">{t('previous_health_records', language)}</h1>
                <p className="text-xs text-sage-500">{t('historical_records', language)}</p>
              </div>
            </div>

            {myRecords.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <FileHeart className="mx-auto text-sage-400" size={42} />
                <p className="mt-3 text-base font-semibold text-sage-800">{t('no_records_yet', language)}</p>
                <p className="mt-1 text-xs text-sage-500">{t('records_appear', language)}</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {myRecords.map((record) => (
                  <HealthRecordCard key={record.id} record={record} language={language} expanded />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* My Referrals Tab */}
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
              <h1 className="text-2xl font-extrabold text-sage-900">{t('nav_referrals', language)}</h1>
              <p className="text-xs text-sage-500">Track care coordination and visits initiated for you</p>
            </div>

            {myReferrals.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ClipboardList className="mx-auto text-sage-400" size={42} />
                <p className="mt-3 text-base font-semibold text-sage-800">{t('no_referrals_yet', language)}</p>
                <p className="mt-1 text-xs text-sage-500">You do not have any active or past care referrals.</p>
                <div className="mt-5">
                  <PrimaryButton onClick={() => setTab('find-care')}>
                    <Search size={16} /> {t('nav_find_care', language)}
                  </PrimaryButton>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {myReferrals.map((ref) => {
                  const originFacility = facilities.find((f) => f.id === ref.originFacilityId);
                  const destFacility = facilities.find((f) => f.id === ref.destFacilityId);
                  return (
                    <GlassCard key={ref.code} className="p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-mint-700 text-lg">{ref.code}</span>
                            <span className="rounded-full bg-mint-50 px-2 py-0.5 text-xs font-semibold text-mint-700 border border-mint-200">
                              {t(ref.urgency === 'urgent' ? 'urgency_urgent' : 'urgency_routine', language)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-sage-600">
                            {originFacility?.name || 'Local Clinic'} → <b className="text-sage-800">{destFacility?.name || 'Target Facility'}</b>
                          </p>
                        </div>

                        <div>
                          <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700">
                            {t(`status_${ref.status}` as any, language)}
                          </span>
                        </div>
                      </div>

                      {ref.notes && (
                        <p className="mt-3 rounded-xl bg-sage-50/70 p-3 text-xs text-sage-700">
                          <b>Notes:</b> {ref.notes}
                        </p>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HealthRecordCard({
  record,
  language,
  expanded = false,
}: {
  record: HealthRecord;
  language: any;
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(expanded);

  const statusLabel =
    record.status === 'completed'
      ? t('status_completed', language) || 'Completed'
      : record.status === 'follow_up'
      ? t('status_follow_up', language) || 'Follow-up'
      : t('status_referred', language) || 'Referred';

  const statusBg =
    record.status === 'completed'
      ? 'bg-status-available/10 text-status-available'
      : record.status === 'follow_up'
      ? 'bg-status-limited/15 text-status-limited'
      : 'bg-mint-100 text-mint-800';

  return (
    <GlassCard className="p-5 transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint-100 text-mint-700">
              <Stethoscope size={16} />
            </span>
            <div>
              <h3 className="font-extrabold text-sage-900 text-base">Health Checkup</h3>
              <p className="text-xs text-sage-500">{record.checkupDate}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-sage-600">
            {record.facilityName && (
              <span>
                <b>Facility:</b> {record.facilityName}
              </span>
            )}
            {record.healthWorkerName && (
              <span>
                <b>Health Worker:</b> {record.healthWorkerName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBg}`}>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-xs font-bold text-mint-700 hover:underline px-1 py-1"
          >
            {open ? 'Hide details' : 'View details'}
          </button>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {record.bloodPressure && (
          <div className="rounded-xl border border-sage-100 bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-sage-500 text-[11px] font-semibold">
              <Heart size={13} className="text-red-500" />
              <span>{t('blood_pressure', language)}</span>
            </div>
            <b className="mt-1 block text-sm text-sage-900">{record.bloodPressure}</b>
          </div>
        )}

        {record.bloodSugar && (
          <div className="rounded-xl border border-sage-100 bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-sage-500 text-[11px] font-semibold">
              <Droplet size={13} className="text-blue-500" />
              <span>{t('blood_sugar', language)}</span>
            </div>
            <b className="mt-1 block text-sm text-sage-900">{record.bloodSugar}</b>
          </div>
        )}

        {record.weight && (
          <div className="rounded-xl border border-sage-100 bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-sage-500 text-[11px] font-semibold">
              <Weight size={13} className="text-amber-500" />
              <span>{t('weight', language)}</span>
            </div>
            <b className="mt-1 block text-sm text-sage-900">{record.weight}</b>
          </div>
        )}

        {record.temperature && (
          <div className="rounded-xl border border-sage-100 bg-white/70 p-2.5">
            <div className="flex items-center gap-1.5 text-sage-500 text-[11px] font-semibold">
              <Thermometer size={13} className="text-orange-500" />
              <span>{t('temperature', language)}</span>
            </div>
            <b className="mt-1 block text-sm text-sage-900">{record.temperature}</b>
          </div>
        )}
      </div>

      {/* Expanded Details Section */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2.5 border-t border-sage-100 pt-3 text-xs"
        >
          {record.symptoms && (
            <div>
              <span className="font-bold text-sage-700">{t('symptoms', language)}:</span>{' '}
              <span className="text-sage-600">{record.symptoms}</span>
            </div>
          )}

          {record.diagnosis && (
            <div>
              <span className="font-bold text-sage-700">{t('diagnosis', language)}:</span>{' '}
              <span className="text-sage-600">{record.diagnosis}</span>
            </div>
          )}

          {record.medicines && record.medicines.length > 0 && (
            <div>
              <span className="font-bold text-sage-700">{t('medicines', language)}:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {record.medicines.map((med, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg bg-mint-50 px-2 py-0.5 text-mint-800 font-medium border border-mint-100"
                  >
                    <Pill size={11} /> {med}
                  </span>
                ))}
              </div>
            </div>
          )}

          {record.notes && (
            <div className="rounded-xl bg-sage-50 p-2.5 text-sage-700">
              <span className="font-bold">{t('notes', language)}:</span> {record.notes}
            </div>
          )}
        </motion.div>
      )}
    </GlassCard>
  );
}
