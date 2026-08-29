import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, Phone, Send, ShieldAlert } from 'lucide-react';
import { useAppStore } from '../store';
import { Coordinates, EmergencyType } from '../types';
import { buildEmergencySms, mapUrl, rankFacilitiesByDistance } from '../services/emergencyService';
import { getCurrentLocation } from '../services/locationService';
import { t } from '../i18n';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading } from './ui';

const types: EmergencyType[] = [
  'Accident',
  'Possible Heart Emergency',
  'Breathing Difficulty',
  'Serious Injury',
  'Unconscious / Not Responding',
  'Other Emergency'
];

const emergencyTypeKeys: Record<EmergencyType, any> = {
  'Accident': 'emergency_accident',
  'Possible Heart Emergency': 'emergency_heart',
  'Breathing Difficulty': 'emergency_breathing',
  'Serious Injury': 'emergency_injury',
  'Unconscious / Not Responding': 'emergency_unconscious',
  'Other Emergency': 'emergency_other',
};

export default function EmergencyFlow() {
  const { language, session, users, facilities, emergencies, createEmergency, updateEmergencyStatus } = useAppStore(s => ({
    language: s.language, session: s.session, users: s.users, facilities: s.facilities, emergencies: s.emergencies,
    createEmergency: s.createEmergency, updateEmergencyStatus: s.updateEmergencyStatus
  }));

  const [type, setType] = useState<EmergencyType>('Accident');
  const [stage, setStage] = useState<'choose' | 'confirm' | 'active'>('choose');
  const [location, setLocation] = useState<Coordinates>();
  const [error, setError] = useState('');
  const [manual, setManual] = useState('');
  const timer = useRef<number | undefined>(undefined);

  const active = emergencies.find(item => item.userId === session?.userId && item.status !== 'resolved');
  const person = users.find(item => item.id === session?.userId);
  const nearby = location ? rankFacilitiesByDistance(facilities, location) : [];
  const facility = nearby[0]?.facility;

  const locate = async () => {
    setError('');
    try {
      setLocation(await getCurrentLocation());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to detect your exact location.');
    }
  };

  const start = () => {
    timer.current = window.setTimeout(() => {
      const id = createEmergency({
        userId: session?.userId || '', type, coordinates: location, manualLocation: manual, facilityId: facility?.id
      });
      setStage('active');
      if (facility) window.setTimeout(() => updateEmergencyStatus(id, 'acknowledged'), 900);
    }, 1200);
  };

  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
  };

  useEffect(() => () => cancel(), []);

  if (active || stage === 'active') {
    const event = active || emergencies[0];
    return (
      <div className="safe-page mx-auto max-w-2xl px-4 py-7">
        <GlassCard strong className="border-2 border-status-unavailable/30 p-5 sm:p-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-status-unavailable px-3 py-1 text-xs font-bold text-white">
            <ShieldAlert size={15} /> {t('emergency_sos', language).toUpperCase()}
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-sage-900">{t('emergency_info_ready', language)}</h1>
          <p className="mt-2 text-sage-600">{t('emergency_info_desc', language)}</p>
          <div className="mt-5 space-y-3">
            {[
              [t('request_prepared', language), 'created'],
              [t('location_detected', language), location ? 'created' : ''],
              [t('facility_identified', language), facility ? 'created' : ''],
              [t('contact_info_ready', language), 'created']
            ].map(([label, done]) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                {done ? <CheckCircle2 className="text-mint-600" /> : <span className="h-5 w-5 rounded-full border-2 border-sage-300" />}
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a className="tap-target inline-flex items-center justify-center gap-2 rounded-2xl bg-status-unavailable px-4 py-3 font-bold text-white shadow-lift hover:bg-red-700" href="tel:112">
              <Phone size={18} /> {t('call_emergency', language)}
            </a>
            <a className="tap-target inline-flex items-center justify-center gap-2 rounded-2xl bg-mint-600 px-4 py-3 font-bold text-white shadow-lift hover:bg-mint-700" href={buildEmergencySms(person?.emergencyContact || '', event?.type || type, person?.name || 'VAAYU user', location)}>
              <Send size={18} /> {t('open_sms_composer', language)}
            </a>
          </div>
          {location && (
            <a className="mt-4 inline-flex text-sm font-semibold text-mint-700 underline" href={mapUrl(location)} target="_blank" rel="noreferrer">
              {t('open_location', language)}
            </a>
          )}
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="safe-page mx-auto max-w-2xl px-4 py-7">
      <SectionHeading eyebrow={t('emergency_help', language)} title={`🚨 ${t('emergency_sos', language)}`} sub={t('emergency_desc', language)} />
      <GlassCard strong className="p-5 sm:p-7">
        {stage === 'choose' ? (
          <>
            <p className="font-semibold text-sage-800">{t('what_happened', language)}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {types.map(item => (
                <button key={item} onClick={() => setType(item)} className={`tap-target rounded-xl p-3 text-left text-sm font-semibold transition hover:opacity-90 ${type === item ? 'bg-status-unavailable text-white' : 'bg-sage-100 text-sage-800 hover:bg-sage-200'}`}>
                  {t(emergencyTypeKeys[item], language)}
                </button>
              ))}
            </div>
            <PrimaryButton className="mt-5 w-full bg-status-unavailable hover:bg-red-700" onClick={() => setStage('confirm')}>
              <AlertTriangle size={18} /> {t('continue_safely', language)}
            </PrimaryButton>
          </>
        ) : (
          <>
            <p className="text-sm text-sage-700">{t('gps_location_desc', language)}</p>
            <div className="mt-4 rounded-xl bg-sage-50 p-3">
              <button className="font-semibold text-mint-700 underline" onClick={locate}>
                {t('detect_my_location', language)}
              </button>
              {location && (
                <p className="mt-2 text-sm text-sage-700">
                  {t('location_accuracy', language).replace('{accuracy}', Math.round(location.accuracy || 0).toString())}
                </p>
              )}
              {error && (
                <>
                  <p className="mt-2 text-sm text-status-unavailable">{error}</p>
                  <input
                    className="mt-2 w-full rounded-lg border border-sage-200 bg-white p-2 text-sage-800 focus:outline-none"
                    placeholder={t('manual_location_placeholder', language)}
                    value={manual}
                    onChange={e => setManual(e.target.value)}
                  />
                </>
              )}
            </div>
            {facility && (
              <p className="mt-3 rounded-xl bg-mint-50 p-3 text-sm text-sage-800">
                <MapPin className="mr-1 inline text-mint-600" size={16} />
                <b>{t('nearest_emergency_facility', language)}:</b> {facility.name} · {nearby[0].distanceKm.toFixed(1)} km
              </p>
            )}
            <button onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} className="tap-target mt-5 w-full rounded-2xl bg-status-unavailable px-5 py-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-red-700">
              {t('press_hold_sos', language)}
            </button>
            <SecondaryButton className="mt-3 w-full" onClick={() => setStage('choose')}>
              {t('back', language)}
            </SecondaryButton>
          </>
        )}
      </GlassCard>
    </div>
  );
}
