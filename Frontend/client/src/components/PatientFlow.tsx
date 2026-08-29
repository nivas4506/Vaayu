import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, Droplet, Bone, Activity, Pill, Baby, ShieldCheck, UserRoundCheck,
  MapPin, Navigation, ArrowRight, ArrowLeft, Clock, Phone, AlertTriangle, CheckCircle2, Search, Flag, type LucideIcon
} from 'lucide-react';
import { useAppStore, TAXONOMY_SERVICES } from '../store';
import { t } from '../i18n';
import { AvailabilityStatus, Facility } from '../types';
import { GlassCard, PrimaryButton, SecondaryButton, StatusBadge, SectionHeading } from './ui';
import FeedbackModal from './FeedbackModal';
import { getCurrentLocation } from '../services/locationService';
import { Coordinates } from '../types';

const iconMap: Record<string, LucideIcon> = {
  Stethoscope, Droplet, Bone, Activity, Pill, Baby, ShieldCheck, UserRoundCheck,
};

type Step = 'service' | 'location' | 'searching' | 'results' | 'detail' | 'referral' | 'track';

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}
function isStale(iso: string) {
  return Date.now() - new Date(iso).getTime() > 48 * 3600 * 1000;
}

export default function PatientFlow() {
  const { language, facilities, session, users } = useAppStore((s) => ({ language: s.language, facilities: s.facilities, session: s.session, users: s.users }));
  const patientProfile = session ? users.find((user) => user.id === session.userId) : null;
  const [step, setStep] = useState<Step>('service');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState(patientProfile?.address || patientProfile?.district || 'Jabalpur');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!serviceId) return [];
    const query = locationInput.trim().toLowerCase();
    return [...facilities]
      .map((f) => ({ f, avail: f.services.find((s) => s.serviceId === serviceId), match: !query || `${f.name} ${f.village} ${f.pincode} ${f.district || ''} ${f.address || ''}`.toLowerCase().includes(query) }))
      .sort((a, b) => {
        if (a.match !== b.match) return a.match ? -1 : 1;
        const rank = (s?: AvailabilityStatus) => s === 'available' ? 0 : s === 'limited' ? 1 : s === 'unknown' ? 2 : 3;
        const r = rank(a.avail?.status) - rank(b.avail?.status);
        if (r !== 0) return r;
        return a.f.distanceKm - b.f.distanceKm;
      });
  }, [facilities, serviceId, locationInput]);

  const recommended = results.find((r) => r.avail?.status === 'available');
  const nearest = [...results].sort((a, b) => a.f.distanceKm - b.f.distanceKm)[0];

  const useCurrentLocation = async () => {
    setLocating(true);
    setLocationError('');
    try { const found = await getCurrentLocation(); setCoordinates(found); setLocationInput(`Current location (${found.latitude.toFixed(4)}, ${found.longitude.toFixed(4)})`); }
    catch (reason) { setLocationError(reason instanceof Error ? reason.message : 'Unable to detect your location. You can enter a village or pincode instead.'); }
    finally { setLocating(false); }
  };

  const search = () => {
    setStep('searching');
    setTimeout(() => setStep('results'), 2200);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <AnimatePresence mode="wait">
        {step === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
            <SectionHeading title={t('search_need', language)} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TAXONOMY_SERVICES.map((svc) => {
                const Icon = iconMap[svc.icon] || Stethoscope;
                const active = serviceId === svc.id;
                return (
                  <button key={svc.id} onClick={() => setServiceId(svc.id)}>
                    <GlassCard strong={active} className={`flex flex-col items-center gap-2 p-4 text-center transition-shadow ${active ? 'shadow-lift ring-2 ring-mint-500' : 'shadow-soft'}`}>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? 'bg-mint-600 text-white' : 'bg-mint-100 text-mint-700'}`}><Icon size={20} /></span>
                      <span className="text-sm font-semibold text-sage-800">{t(svc.nameKey as any, language)}</span>
                    </GlassCard>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <PrimaryButton disabled={!serviceId} className={!serviceId ? 'opacity-40' : ''} onClick={() => setStep('location')}>
                {t('next', language)} <ArrowRight size={18} />
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
            <SectionHeading title={t('search_location', language)} />
            <GlassCard className="space-y-4 p-5">
              <button onClick={useCurrentLocation} className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-mint-50 py-3 font-semibold text-mint-700 hover:bg-mint-100">
                {locating ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Navigation size={18} />
                    </motion.span>
                    {t('locating', language)}
                  </>
                ) : (
                  <><Navigation size={18} /> {t('use_current_location', language)}</>
                )}
              </button>
              <div className="flex items-center gap-3 text-sage-400"><div className="h-px flex-1 bg-sage-200" /><span className="text-xs">OR</span><div className="h-px flex-1 bg-sage-200" /></div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400" size={18} />
                <input
                  value={locationInput} onChange={(e) => setLocationInput(e.target.value)}
                  placeholder={t('enter_village', language)}
                  className="w-full rounded-2xl border border-sage-200 bg-white/70 py-3 pl-10 pr-3 text-sage-800 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200"
                />
              </div>
              {coordinates && <p className="rounded-xl bg-mint-50 px-3 py-2 text-xs font-semibold text-mint-700">Location detected. You can continue to see the available care network.</p>}
              {locationError && <p role="alert" className="rounded-xl bg-status-unavailable/10 px-3 py-2 text-xs font-semibold text-status-unavailable">{locationError}</p>}
            </GlassCard>
            <div className="mt-8 flex justify-between">
              <SecondaryButton onClick={() => setStep('service')}><ArrowLeft size={18} /> {t('back', language)}</SecondaryButton>
              <PrimaryButton disabled={!locationInput} className={!locationInput ? 'opacity-40' : ''} onClick={search}>
                <Search size={18} /> {t('find_facilities', language)}
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {step === 'searching' && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <SearchingAnimation language={language} />
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <SectionHeading title={t('closest_cannot_provide', language)} />
            {recommended && recommended.f.id !== nearest?.f.id && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-mint-600">{t('recommended', language)}</p>
                <FacilityResultCard f={recommended.f} status={recommended.avail?.status || 'unknown'} updatedAt={recommended.avail?.updatedAt}
                  language={language} highlighted onView={() => { setSelectedFacility(recommended.f); setStep('detail'); }} />
              </motion.div>
            )}
            <div className="space-y-3">
              {results.filter((r) => r.f.id !== recommended?.f.id).map(({ f, avail }) => (
                <FacilityResultCard key={f.id} f={f} status={avail?.status || 'unknown'} updatedAt={avail?.updatedAt}
                  language={language} onView={() => { setSelectedFacility(f); setStep('detail'); }} />
              ))}
            </div>
            <div className="mt-8">
              <SecondaryButton onClick={() => setStep('location')}><ArrowLeft size={18} /> {t('back', language)}</SecondaryButton>
            </div>
          </motion.div>
        )}

        {step === 'detail' && selectedFacility && (
          <motion.div key="detail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <FacilityDetail facility={selectedFacility} onBack={() => setStep('results')}
              onReport={() => setShowFeedback(true)}
              onRefer={() => setStep('referral')} />
          </motion.div>
        )}

        {step === 'referral' && selectedFacility && (
          <motion.div key="referral" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <ReferralCreate
              destination={selectedFacility}
              origin={facilities.find((f) => f.id === nearest?.f.id) || selectedFacility}
              serviceId={serviceId!}
              onBack={() => setStep('detail')}
              onCreated={(code) => { setReferralCode(code); setStep('track'); }}
            />
          </motion.div>
        )}

        {step === 'track' && referralCode && (
          <motion.div key="track" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4 }}>
            <ReferralTrackView code={referralCode} onNewSearch={() => { setStep('service'); setServiceId(null); setReferralCode(null); setSelectedFacility(null); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {showFeedback && selectedFacility && (
        <FeedbackModal facilityId={selectedFacility.id} serviceId={serviceId || undefined} onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}

function SearchingAnimation({ language }: { language: any }) {
  const stages = ['finding_facilities', 'checking_availability', 'comparing_distance', 'finding_best'] as const;
  const [idx, setIdx] = useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx((i) => Math.min(i + 1, stages.length - 1)), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <div>
      <motion.div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-mint-100 text-mint-600"
        animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <Search size={26} />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-lg font-semibold text-sage-800">
          {t(stages[idx], language)}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function FacilityResultCard({ f, status, updatedAt, language, highlighted, onView }: { f: Facility; status: AvailabilityStatus; updatedAt?: string; language: any; highlighted?: boolean; onView: () => void }) {
  return (
    <GlassCard strong={highlighted} className={`p-5 ${highlighted ? 'shadow-lift ring-2 ring-mint-400' : 'shadow-soft'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-sage-900">{f.name}</p>
          <p className="text-sm text-sage-600">{f.type} · {f.distanceKm} {t('km_away', language)}</p>
        </div>
        <StatusBadge status={status} lang={language} pulse={status === 'available'} />
      </div>
      {updatedAt && <p className="mt-2 text-xs text-sage-500">{t('status_updated', language)}: {timeAgo(updatedAt)}</p>}
      <div className="mt-4">
        <SecondaryButton className="w-full sm:w-auto" onClick={onView}>{t('view_facility', language)}</SecondaryButton>
      </div>
    </GlassCard>
  );
}

function FacilityDetail({ facility, onBack, onReport, onRefer }: { facility: Facility; onBack: () => void; onReport: () => void; onRefer: () => void }) {
  const language = useAppStore((s) => s.language);
  const staleAny = facility.services.some((s) => isStale(s.updatedAt));
  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-sage-600 hover:text-mint-700"><ArrowLeft size={16} /> {t('back', language)}</button>
      <GlassCard strong className="p-6">
        <h2 className="text-2xl font-bold text-sage-900">{facility.name}</h2>
        <p className="text-sage-600">{facility.type} · {facility.village} · {facility.pincode}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-sage-700 sm:grid-cols-3">
          <div className="flex items-center gap-2"><MapPin size={16} className="text-mint-600" /> {facility.distanceKm} {t('km_away', language)}</div>
          <div className="flex items-center gap-2"><Clock size={16} className="text-mint-600" /> {facility.hours}</div>
          <div className="flex items-center gap-2"><Phone size={16} className="text-mint-600" /> {facility.contact}</div>
        </div>

        {staleAny && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-status-limited/10 p-3 text-sm text-status-limited">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" /> {t('stale_data_warning', language)}
          </div>
        )}

        <h3 className="mt-6 mb-2 font-semibold text-sage-900">{t('services_available_from', language)}</h3>
        <div className="space-y-2">
          {facility.services.map((s) => {
            const svc = TAXONOMY_SERVICES.find((x) => x.id === s.serviceId);
            return (
              <div key={s.serviceId} className="flex items-center justify-between rounded-xl border border-sage-100 bg-white/50 px-4 py-3">
                <span className="text-sm font-medium text-sage-800">{svc ? t(svc.nameKey as any, language) : s.serviceId}</span>
                <StatusBadge status={s.status} lang={language} />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton onClick={onRefer}>{t('create_referral', language)}</PrimaryButton>
          <SecondaryButton onClick={onReport}><Flag size={16} /> {t('report_it', language)}</SecondaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

function ReferralCreate({ destination, origin, serviceId, onBack, onCreated }: { destination: Facility; origin: Facility; serviceId: string; onBack: () => void; onCreated: (code: string) => void }) {
  const { language, addReferral } = useAppStore((s) => ({ language: s.language, addReferral: s.addReferral }));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');

  const submit = () => {
    const code = addReferral({
      patientName: name || 'Rani', patientPhone: phone || '9876543210',
      originFacilityId: origin.id, destFacilityId: destination.id, requestedServiceId: serviceId,
      urgency, status: 'created',
    });
    onCreated(code);
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-sage-600 hover:text-mint-700"><ArrowLeft size={16} /> {t('back', language)}</button>
      <SectionHeading title={t('create_referral', language)} sub={`${origin.name} → ${destination.name}`} />
      <GlassCard className="space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-semibold text-sage-700">{t('patient_name', language)}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rani"
            className="w-full rounded-xl border border-sage-200 bg-white/70 p-3 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-sage-700">{t('patient_phone', language)}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210"
            className="w-full rounded-xl border border-sage-200 bg-white/70 p-3 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-sage-700">{t('urgency_label', language)}</label>
          <div className="flex gap-2">
            {(['routine', 'urgent'] as const).map((u) => (
              <button key={u} onClick={() => setUrgency(u)}
                className={`tap-target rounded-xl px-4 py-2 text-sm font-semibold ${urgency === u ? 'bg-mint-600 text-white' : 'bg-sage-100 text-sage-700'}`}>
                {t(u === 'routine' ? 'urgency_routine' : 'urgency_urgent', language)}
              </button>
            ))}
          </div>
        </div>
        <PrimaryButton className="w-full" onClick={submit}>{t('create_referral', language)}</PrimaryButton>
      </GlassCard>
    </div>
  );
}

const statusOrder: Referral_Status[] = ['created', 'accepted', 'ready_for_visit', 'completed'];
type Referral_Status = 'created' | 'accepted' | 'ready_for_visit' | 'completed' | 'redirected';

export function ReferralTrackView({ code, onNewSearch }: { code: string; onNewSearch: () => void }) {
  const { language, referrals } = useAppStore((s) => ({ language: s.language, referrals: s.referrals }));
  const referral = referrals.find((r) => r.code === code);
  if (!referral) return null;
  const currentIdx = statusOrder.indexOf(referral.status as any);

  return (
    <div>
      <GlassCard strong className="p-6 text-center">
        <CheckCircle2 className="mx-auto text-status-available" size={40} />
        <p className="mt-3 text-lg font-bold text-sage-900">{t('your_referral_is_ready', language)}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-wide text-mint-700">{referral.code}</p>
      </GlassCard>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-sage-900">{t('timeline_title', language)}</h3>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            {statusOrder.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? 'bg-mint-600 text-white' : 'bg-sage-200 text-sage-500'}`}>
                    {i + 1}
                  </motion.div>
                  <span className="max-w-[70px] text-center text-[11px] font-medium text-sage-600">
                    {t(`status_${s}` as any, language)}
                  </span>
                </div>
                {i < statusOrder.length - 1 && (
                  <div className="mx-1 h-0.5 flex-1 bg-sage-200">
                    <motion.div initial={{ width: 0 }} animate={{ width: i < currentIdx ? '100%' : '0%' }} className="h-0.5 bg-mint-600" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 flex justify-center">
        <SecondaryButton onClick={onNewSearch}>{t('search_need', language)}</SecondaryButton>
      </div>
    </div>
  );
}
