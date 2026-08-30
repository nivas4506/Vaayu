import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileHeart,
  HeartHandshake,
  MapPin,
  Phone,
  Plus,
  Search,
  Siren,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { useAppStore, TAXONOMY_SERVICES } from '../store';
import { t } from '../i18n';
import { DemoUser, HealthRecord, Referral } from '../types';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading, StatusBadge } from './ui';
import { HealthRecordCard } from './PatientDashboard';

export type AshaTab = 'dashboard' | 'patients' | 'referrals' | 'assist';

const needs = [
  'Doctor Consultation',
  'Medicine',
  'Diagnostic Test',
  'Maternal Care',
  'Child Healthcare',
  'Emergency',
  'Follow-up',
  'Other',
];

interface AshaWorkspaceProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEmergency?: () => void;
}

export default function AshaWorkspace({
  activeTab = 'dashboard',
  onTabChange,
  onEmergency,
}: AshaWorkspaceProps) {
  const {
    language,
    session,
    users,
    facilities,
    referrals,
    healthRecords,
    getAssignedPatients,
    addReferral,
    updateReferralStatus,
    addHealthRecord,
  } = useAppStore((s) => ({
    language: s.language,
    session: s.session,
    users: s.users,
    facilities: s.facilities,
    referrals: s.referrals,
    healthRecords: s.healthRecords,
    getAssignedPatients: s.getAssignedPatients,
    addReferral: s.addReferral,
    updateReferralStatus: s.updateReferralStatus,
    addHealthRecord: s.addHealthRecord,
  }));

  const ashaUser = useMemo(() => {
    return session ? users.find((u) => u.id === session.userId) : null;
  }, [session, users]);

  // Isolate assigned patients for this ASHA
  const patients = useMemo(() => {
    return getAssignedPatients(session?.userId || '');
  }, [getAssignedPatients, session]);

  // Selected patient for deep inspection
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(patients[0]?.id || null);
  const selectedPatient = useMemo(() => {
    return users.find((u) => u.id === selectedPatientId) || patients[0] || null;
  }, [users, selectedPatientId, patients]);

  // Checkup Modal / Form state
  const [showCheckupModal, setShowCheckupModal] = useState(false);
  const [bp, setBp] = useState('120/80 mmHg');
  const [sugar, setSugar] = useState('98 mg/dL');
  const [weight, setWeight] = useState('65 kg');
  const [temp, setTemp] = useState('98.4°F');
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medsInput, setMedsInput] = useState('');
  const [checkupNotes, setCheckupNotes] = useState('');
  const [checkupFacilityId, setCheckupFacilityId] = useState(facilities[0]?.id || '');
  const [checkupStatus, setCheckupStatus] = useState<'completed' | 'follow_up' | 'referred'>('completed');

  // Assist referral form state
  const [assistPatientId, setAssistPatientId] = useState(patients[0]?.id || '');
  const [need, setNeed] = useState(needs[0]);
  const [facilityId, setFacilityId] = useState(facilities[0]?.id || '');
  const [notes, setNotes] = useState('');

  const setTab = (tab: AshaTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const currentTab: AshaTab =
    activeTab === 'patients' || activeTab === 'referrals' || activeTab === 'assist'
      ? activeTab
      : 'dashboard';

  // Metrics
  const pendingReferrals = useMemo(() => {
    return referrals.filter((r) => r.status === 'created' || r.status === 'accepted');
  }, [referrals]);

  const completedCheckups = useMemo(() => {
    return healthRecords.filter(
      (r) => r.ashaId === session?.userId || patients.some((p) => p.id === r.patientId)
    );
  }, [healthRecords, session, patients]);

  const followUpRequired = useMemo(() => {
    return healthRecords.filter(
      (r) => r.status === 'follow_up' && patients.some((p) => p.id === r.patientId)
    );
  }, [healthRecords, patients]);

  const createReferralAction = () => {
    const patient = users.find((u) => u.id === assistPatientId);
    if (!patient) return;
    addReferral({
      patientName: patient.name,
      patientPhone: patient.mobile,
      originFacilityId: facilities[0]?.id || 'jabalpur_phc',
      destFacilityId: facilityId,
      requestedServiceId: need === 'Emergency' ? 'consultation' : 'consultation',
      urgency: need === 'Emergency' ? 'urgent' : 'routine',
      status: 'created',
      notes: `${need}: ${notes}`,
    });
    setNotes('');
    setTab('referrals');
  };

  const handleSaveCheckup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const chosenFacility = facilities.find((f) => f.id === checkupFacilityId);
    addHealthRecord({
      patientId: selectedPatient.id,
      checkupDate: new Date().toISOString().split('T')[0],
      facilityId: checkupFacilityId,
      facilityName: chosenFacility?.name || 'Local Primary Health Centre',
      ashaId: session?.userId,
      healthWorkerName: ashaUser?.name || 'ASHA Worker',
      bloodPressure: bp.trim() || undefined,
      bloodSugar: sugar.trim() || undefined,
      weight: weight.trim() || undefined,
      temperature: temp.trim() || undefined,
      symptoms: symptoms.trim() || undefined,
      diagnosis: diagnosis.trim() || undefined,
      medicines: medsInput ? medsInput.split(',').map((m) => m.trim()).filter(Boolean) : undefined,
      notes: checkupNotes.trim() || undefined,
      status: checkupStatus,
    });

    setShowCheckupModal(false);
    setSymptoms('');
    setDiagnosis('');
    setMedsInput('');
    setCheckupNotes('');
  };

  return (
    <div className="safe-page mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Tab Navigation Sub-bar */}
      <div className="mb-6 flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-2">
          {[
            { id: 'dashboard', label: t('nav_dashboard', language), icon: Activity },
            { id: 'patients', label: t('nav_assigned_patients', language), icon: Users, count: patients.length },
            { id: 'referrals', label: t('nav_referrals', language), icon: ClipboardList, count: pendingReferrals.length },
            { id: 'assist', label: t('nav_patient_assistance', language), icon: HeartHandshake },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as AshaTab)}
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
        {/* DASHBOARD TAB */}
        {currentTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Welcome Banner */}
            <GlassCard strong className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-mint-800">
                      <Sparkles size={13} /> {t('role_asha', language)}
                    </span>
                    <span className="text-xs text-sage-500 font-semibold">{t('care_coordinator', language)}</span>
                  </div>
                  <h1 className="mt-2 text-2xl font-extrabold text-sage-900 sm:text-3xl">
                    {t('welcome_user', language)}, {ashaUser?.name || 'Sunita ASHA'}
                  </h1>
                  <p className="mt-1 text-xs text-sage-600 sm:text-sm">
                    {t('patients_assigned_desc', language)} · {ashaUser?.district || 'Jabalpur'} {t('district', language)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <PrimaryButton className="text-xs sm:text-sm px-4 py-2.5" onClick={() => setTab('assist')}>
                    <HeartHandshake size={16} /> {t('assist_patient', language)}
                  </PrimaryButton>
                  <SecondaryButton className="text-xs sm:text-sm px-4 py-2.5" onClick={() => setTab('patients')}>
                    <Users size={16} /> {t('assigned_patients', language)}
                  </SecondaryButton>
                </div>
              </div>
            </GlassCard>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    {t('assigned_patients', language)}
                  </span>
                  <UserRound className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{patients.length}</b>
                <span className="text-xs text-sage-600">{t('active_assigned', language)}</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    {t('pending_referrals', language)}
                  </span>
                  <ClipboardList className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{pendingReferrals.length}</b>
                <span className="text-xs text-sage-600">{t('awaiting_visit', language)}</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    {t('total_checkups', language)}
                  </span>
                  <FileHeart className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{completedCheckups.length}</b>
                <span className="text-xs text-sage-600">{t('logged_checkups', language)}</span>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-500">
                    {t('follow_up_status', language)}
                  </span>
                  <Activity className="text-mint-600" size={20} />
                </div>
                <b className="mt-2 block text-2xl sm:text-3xl text-sage-900">{followUpRequired.length}</b>
                <span className="text-xs text-sage-600">{t('require_follow_up', language)}</span>
              </GlassCard>
            </div>

            {/* Assigned Patients Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-sage-900">{t('assigned_patients', language)}</h2>
                  <p className="text-xs text-sage-500">{t('only_assigned', language)}</p>
                </div>
                <button
                  onClick={() => setTab('patients')}
                  className="text-xs font-bold text-mint-700 hover:underline"
                >
                  {t('view_full_details', language)} ({patients.length}) →
                </button>
              </div>

              {patients.length === 0 ? (
                <GlassCard className="p-6 text-center">
                  <Users className="mx-auto text-sage-400" size={36} />
                  <p className="mt-2 text-sm font-semibold text-sage-700">{t('no_patients_assigned', language)}</p>
                </GlassCard>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {patients.map((patient) => {
                    const pRecords = healthRecords.filter((r) => r.patientId === patient.id);
                    const lastRec = pRecords[0];
                    return (
                      <GlassCard key={patient.id} className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-extrabold text-sage-900 text-base">{patient.name}</p>
                            <p className="text-xs text-sage-600 mt-0.5">{patient.mobile} · {patient.district}</p>
                          </div>
                          <span className="rounded-full bg-mint-50 px-2.5 py-0.5 text-[11px] font-bold text-mint-700 border border-mint-200">
                            {lastRec?.status === 'follow_up' ? t('follow_up_due', language) : t('status_available', language)}
                          </span>
                        </div>

                        <div className="mt-3 rounded-xl bg-sage-50/70 p-3 text-xs space-y-1">
                          <p className="text-sage-600">
                            <b>{t('last_checkup_label', language)}:</b> {lastRec?.checkupDate || t('no_record', language)}
                          </p>
                          <p className="text-sage-600">
                            <b>Vitals:</b> {lastRec?.bloodPressure ? `${lastRec.bloodPressure} · ${lastRec.bloodSugar || 'Normal'}` : 'Vitals pending'}
                          </p>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <PrimaryButton
                            className="text-xs px-3 py-2"
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setTab('patients');
                            }}
                          >
                            <UserCheck size={14} /> {t('view_patient', language)}
                          </PrimaryButton>
                          <SecondaryButton
                            className="text-xs px-3 py-2"
                            onClick={() => {
                              setAssistPatientId(patient.id);
                              setTab('assist');
                            }}
                          >
                            <HeartHandshake size={14} /> {t('assist_patient', language)}
                          </SecondaryButton>
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ASSIGNED PATIENTS TAB */}
        {currentTab === 'patients' && (
          <motion.div
            key="patients"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div>
              <button
                onClick={() => setTab('dashboard')}
                className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-sage-600 hover:text-mint-700"
              >
                ← {t('nav_dashboard', language)}
              </button>
              <h1 className="text-2xl font-extrabold text-sage-900">{t('nav_assigned_patients', language)}</h1>
              <p className="text-xs text-sage-500">{t('historical_records', language)}</p>
            </div>

            {/* Patient Selector Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`tap-target rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                    selectedPatient?.id === p.id
                      ? 'bg-mint-600 text-white shadow-soft'
                      : 'bg-white/80 text-sage-700 border border-sage-100 hover:bg-mint-50'
                  }`}
                >
                  {p.name} ({p.mobile})
                </button>
              ))}
            </div>

            {selectedPatient ? (
              <div className="space-y-5">
                {/* Patient Profile Card */}
                <GlassCard strong className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-100 text-mint-700">
                          <User size={20} />
                        </span>
                        <div>
                          <h2 className="text-xl font-extrabold text-sage-900">{selectedPatient.name}</h2>
                          <p className="text-xs text-sage-500">{t('assigned_patient_profile', language)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-sage-600 sm:text-sm">
                        <span>
                          <Phone size={13} className="inline mr-1 text-mint-600" />
                          {selectedPatient.mobile}
                        </span>
                        <span>
                          <MapPin size={13} className="inline mr-1 text-mint-600" />
                          {selectedPatient.address}, {selectedPatient.district}
                        </span>
                        <span>
                          <b>{t('language_label', language)}:</b> {selectedPatient.language?.toUpperCase() || 'EN'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:self-start">
                      <PrimaryButton
                        className="text-xs sm:text-sm px-4 py-2.5"
                        onClick={() => setShowCheckupModal(true)}
                      >
                        <Plus size={16} /> {t('record_new_checkup', language)}
                      </PrimaryButton>
                      <SecondaryButton
                        className="text-xs sm:text-sm px-4 py-2.5"
                        onClick={() => {
                          setAssistPatientId(selectedPatient.id);
                          setTab('assist');
                        }}
                      >
                        <HeartHandshake size={16} /> {t('create_referral', language)}
                      </SecondaryButton>
                    </div>
                  </div>
                </GlassCard>

                {/* Patient's Health Records History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-sage-900">
                      {t('previous_health_records', language)} ({healthRecords.filter((r) => r.patientId === selectedPatient.id).length})
                    </h3>
                  </div>

                  {healthRecords.filter((r) => r.patientId === selectedPatient.id).length === 0 ? (
                    <GlassCard className="p-6 text-center">
                      <FileHeart className="mx-auto text-sage-400" size={36} />
                      <p className="mt-2 text-sm font-semibold text-sage-700">No previous checkup records found.</p>
                      <p className="mt-1 text-xs text-sage-500">Click &quot;Record New Checkup&quot; above to log vitals.</p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-3">
                      {healthRecords
                        .filter((r) => r.patientId === selectedPatient.id)
                        .map((rec) => (
                          <HealthRecordCard key={rec.id} record={rec} language={language} expanded />
                        ))}
                    </div>
                  )}
                </div>

                {/* Patient's Referrals */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-sage-900">
                    {t('patient_referrals', language)} {selectedPatient.name}
                  </h3>
                  {referrals.filter(
                    (r) =>
                      r.patientPhone === selectedPatient.mobile ||
                      r.patientName.toLowerCase() === selectedPatient.name.toLowerCase()
                  ).length === 0 ? (
                    <GlassCard className="p-5 text-center">
                      <p className="text-xs text-sage-500">{t('no_active_patient_referrals', language)}</p>
                    </GlassCard>
                  ) : (
                    <div className="space-y-2">
                      {referrals
                        .filter(
                          (r) =>
                            r.patientPhone === selectedPatient.mobile ||
                            r.patientName.toLowerCase() === selectedPatient.name.toLowerCase()
                        )
                        .map((ref) => (
                          <GlassCard key={ref.code} className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <b className="text-mint-700 text-sm">{ref.code}</b>
                                <span className="ml-2 text-xs text-sage-600">{ref.notes || 'Care coordination'}</span>
                              </div>
                              <span className="text-xs font-semibold text-sage-500">
                                {t(`status_${ref.status}` as any, language)}
                              </span>
                            </div>
                          </GlassCard>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sage-600">No patient selected.</p>
            )}
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
              <h1 className="text-2xl font-extrabold text-sage-900">{t('referrals_label', language)}</h1>
              <p className="text-xs text-sage-500">{t('care_referrals_status', language)}</p>
            </div>

            {referrals.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ClipboardList className="mx-auto text-sage-400" size={42} />
                <p className="mt-3 text-base font-semibold text-sage-800">{t('no_referrals_yet', language)}</p>
                <div className="mt-4">
                  <PrimaryButton onClick={() => setTab('assist')}>
                    <HeartHandshake size={16} /> {t('assist_patient', language)}
                  </PrimaryButton>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <GlassCard key={ref.code} className="p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <b className="text-mint-700 text-lg">{ref.code}</b>
                          <span className="text-xs font-bold text-sage-800">{ref.patientName}</span>
                          <span className="text-xs text-sage-500">({ref.patientPhone})</span>
                        </div>
                        <p className="mt-1 text-xs text-sage-600">{ref.notes || t('care_coordination', language)}</p>
                      </div>
                      <span className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold text-sage-700 self-start sm:self-auto">
                        {t(`status_${ref.status}` as any, language)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-sage-100 pt-3">
                      {ref.status === 'created' && (
                        <PrimaryButton
                          className="px-3 py-1.5 text-xs"
                          onClick={() => updateReferralStatus(ref.code, 'accepted')}
                        >
                          {t('accept_referral', language)}
                        </PrimaryButton>
                      )}
                      {ref.status === 'accepted' && (
                        <PrimaryButton
                          className="px-3 py-1.5 text-xs"
                          onClick={() => updateReferralStatus(ref.code, 'ready_for_visit')}
                        >
                          {t('mark_ready', language)}
                        </PrimaryButton>
                      )}
                      {ref.status === 'ready_for_visit' && (
                        <PrimaryButton
                          className="px-3 py-1.5 text-xs"
                          onClick={() => updateReferralStatus(ref.code, 'completed')}
                        >
                          {t('complete', language)}
                        </PrimaryButton>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* PATIENT ASSISTANCE TAB */}
        {currentTab === 'assist' && (
          <motion.div
            key="assist"
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
              <SectionHeading
                eyebrow={t('asha_workspace', language)}
                title={t('assist_patient_title', language)}
                sub={t('patient_info', language)}
              />
            </div>

            <GlassCard className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="text-xs font-bold text-sage-800">
                {t('patient_select', language)}
                <select
                  className="mt-1.5 w-full rounded-xl border border-sage-200 bg-white/80 p-3 text-sm focus:border-mint-500 focus:outline-none"
                  value={assistPatientId}
                  onChange={(e) => setAssistPatientId(e.target.value)}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.mobile}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold text-sage-800">
                {t('healthcare_need', language)}
                <select
                  className="mt-1.5 w-full rounded-xl border border-sage-200 bg-white/80 p-3 text-sm focus:border-mint-500 focus:outline-none"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                >
                  {needs.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold text-sage-800 sm:col-span-2">
                {t('select_facility', language)}
                <select
                  className="mt-1.5 w-full rounded-xl border border-sage-200 bg-white/80 p-3 text-sm focus:border-mint-500 focus:outline-none"
                  value={facilityId}
                  onChange={(e) => setFacilityId(e.target.value)}
                >
                  {facilities
                    .filter((f) => f.status !== 'inactive')
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type} · {f.village})
                      </option>
                    ))}
                </select>
              </label>

              <label className="text-xs font-bold text-sage-800 sm:col-span-2">
                {t('notes', language)}
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-sage-200 bg-white/80 p-3 text-sm focus:border-mint-500 focus:outline-none"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('add_notes_placeholder', language)}
                />
              </label>

              <div className="sm:col-span-2">
                <PrimaryButton className="w-full" onClick={createReferralAction}>
                  {t('create_referral_btn', language)}
                </PrimaryButton>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECORD CHECKUP MODAL */}
      {showCheckupModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-sage-200 bg-white p-6 shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-sage-100 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-sage-900">{t('record_new_checkup', language)}</h2>
                <p className="text-xs text-sage-500">Patient: <b>{selectedPatient.name}</b></p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckupModal(false)}
                className="rounded-full p-1.5 text-sage-400 hover:bg-sage-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCheckup} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-700">{t('blood_pressure', language)}</label>
                  <input
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80 mmHg"
                    className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-700">{t('blood_sugar', language)}</label>
                  <input
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    placeholder="98 mg/dL"
                    className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sage-700">{t('weight', language)}</label>
                  <input
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="65 kg"
                    className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sage-700">{t('temperature', language)}</label>
                  <input
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="98.4°F"
                    className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">{t('facility', language)}</label>
                <select
                  value={checkupFacilityId}
                  onChange={(e) => setCheckupFacilityId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">{t('symptoms', language)}</label>
                <input
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Mild headache, feverish"
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">{t('diagnosis', language)}</label>
                <input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Normal seasonal viral symptoms"
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">{t('medicines', language)} (comma separated)</label>
                <input
                  value={medsInput}
                  onChange={(e) => setMedsInput(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg, ORS, Iron Tablets"
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">Checkup Status</label>
                <select
                  value={checkupStatus}
                  onChange={(e) => setCheckupStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                >
                  <option value="completed">Completed (Vitals Stable)</option>
                  <option value="follow_up">Follow-up Required in 2 weeks</option>
                  <option value="referred">Referred to Specialist / Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-sage-700">{t('notes', language)}</label>
                <textarea
                  value={checkupNotes}
                  onChange={(e) => setCheckupNotes(e.target.value)}
                  rows={2}
                  placeholder="Advice given, observations..."
                  className="mt-1 w-full rounded-xl border border-sage-200 p-2.5 text-xs focus:border-mint-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-2">
                <SecondaryButton type="button" onClick={() => setShowCheckupModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Checkup
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
