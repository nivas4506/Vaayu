import { FormEvent, useState } from 'react';
import { CheckCircle2, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';
import { useAppStore } from '../store';
import { verifyDemoOtp } from '../services/otpService';
import { UserLanguage, UserRole } from '../types';
import { t } from '../i18n';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading } from './ui';

type Step = 'login' | 'register' | 'otp' | 'pending';
const field = 'mt-1.5 w-full rounded-xl border border-sage-200 bg-white/85 px-3.5 py-3 text-sage-900 shadow-sm transition focus:border-mint-600 focus:outline-none focus:ring-4 focus:ring-mint-100';

export default function AuthFlow({ onDone }: { onDone: () => void }) {
  const { registerDemoUser, signIn, language, setLanguage } = useAppStore(s => ({
    registerDemoUser: s.registerDemoUser, signIn: s.signIn, language: s.language, setLanguage: s.setLanguage
  }));
  const [step, setStep] = useState<Step>('login');
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirm: '', role: 'patient' as UserRole, state: 'Maharashtra', district: '', address: '', emergencyContact: ''
  });

  const set = (key: keyof typeof form, value: string) => setForm(s => ({ ...s, [key]: value }));

  const signInNow = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = signIn(login.email, login.password);
    if (result.error) {
      setError(result.error);
      if (result.user?.status === 'pending') setStep('pending');
      return;
    }
    onDone();
  };

  const register = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!form.name || !form.mobile || !form.email || !form.password) return setError('Please complete the required fields.');
    const user = registerDemoUser({ ...form, language });
    setPendingId(user.id);
    setError('');
    setStep('otp');
  };

  const confirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = new FormData(event.currentTarget).get('otp')?.toString() || '';
    if (!verifyDemoOtp(otp)) return setError('Enter the six-digit verification code.');
    const account = useAppStore.getState().users.find(item => item.id === pendingId);
    if (account?.role === 'asha') {
      setStep('pending');
      return;
    }
    useAppStore.getState().signIn(account?.email || '', account?.password || '');
    onDone();
  };

  return (
    <main className="safe-page mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <section>
          <p className="eyebrow">{t('secure_access', language)}</p>
          <SectionHeading
            title={
              step === 'login' ? t('sign_in_to_vaayu', language) :
              step === 'register' ? t('create_account', language) :
              step === 'otp' ? t('verify_account', language) :
              t('account_review', language)
            }
            sub={t('sub_tagline', language)}
          />

          {step === 'login' && (
            <GlassCard strong className="p-5 sm:p-7">
              <form onSubmit={signInNow} className="space-y-4">
                <label className="block text-sm font-bold text-sage-800">
                  {t('email_address', language)}
                  <input required className={field} type="email" autoComplete="email" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} />
                </label>
                <label className="block text-sm font-bold text-sage-800">
                  {t('password', language)}
                  <input required className={field} type="password" autoComplete="current-password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} />
                </label>
                {error && <p className="rounded-xl bg-status-unavailable/10 p-3 text-sm font-semibold text-status-unavailable">{error}</p>}
                <PrimaryButton className="w-full" type="submit">
                  <LockKeyhole size={18} /> {t('sign_in_btn', language)}
                </PrimaryButton>
                <button type="button" className="w-full py-2 text-sm font-bold text-mint-700 underline underline-offset-4" onClick={() => { setError(''); setStep('register'); }}>
                  {t('create_account_link', language)}
                </button>
              </form>
            </GlassCard>
          )}

          {step === 'register' && (
            <GlassCard strong className="p-5 sm:p-7">
              <form onSubmit={register} className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  {t('full_name', language)}
                  <input required className={field} value={form.name} onChange={e => set('name', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('mobile_number', language)}
                  <input required className={field} inputMode="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('email', language)}
                  <input required className={field} type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('emergency_contact', language)}
                  <input className={field} inputMode="tel" value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('password', language)}
                  <input required className={field} type="password" value={form.password} onChange={e => set('password', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('confirm_password', language)}
                  <input required className={field} type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('account_type', language)}
                  <select className={field} value={form.role} onChange={e => set('role', e.target.value)}>
                    <option value="patient">{t('citizen_patient', language)}</option>
                    <option value="asha">{t('asha_worker', language)}</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  {t('preferred_language', language)}
                  <select className={field} value={language} onChange={e => setLanguage(e.target.value as UserLanguage)}>
                    {['en', 'hi', 'mr'].map(code => (
                      <option key={code} value={code}>{code === 'en' ? 'English' : code === 'hi' ? 'हिन्दी' : 'मराठी'}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-bold">
                  {t('state', language)}
                  <input className={field} value={form.state} onChange={e => set('state', e.target.value)} />
                </label>
                <label className="text-sm font-bold">
                  {t('district', language)}
                  <input className={field} value={form.district} onChange={e => set('district', e.target.value)} />
                </label>
                <label className="text-sm font-bold sm:col-span-2">
                  {t('address', language)}
                  <input className={field} value={form.address} onChange={e => set('address', e.target.value)} />
                </label>
                {error && <p className="sm:col-span-2 text-sm font-bold text-status-unavailable">{error}</p>}
                <PrimaryButton className="sm:col-span-2" type="submit">
                  <UserPlus size={18} /> {t('next', language)}
                </PrimaryButton>
              </form>
            </GlassCard>
          )}

          {step === 'otp' && (
            <GlassCard strong className="p-6 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-100 text-mint-700">
                <ShieldCheck size={24} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-sage-900">{t('confirm_contact_details', language)}</h3>
              <p className="mt-2 text-sm leading-6 text-sage-600">{t('enter_otp_desc', language)}</p>
              <form onSubmit={confirm} className="mt-6 space-y-4">
                <label className="block text-sm font-bold">
                  {t('verification_code', language)}
                  <input required className={field} name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" />
                </label>
                {error && <p className="text-sm font-bold text-status-unavailable">{error}</p>}
                <PrimaryButton className="w-full" type="submit">
                  <CheckCircle2 size={18} /> {t('verify_account_btn', language)}
                </PrimaryButton>
              </form>
            </GlassCard>
          )}

          {step === 'pending' && (
            <GlassCard strong className="p-7 text-center">
              <CheckCircle2 className="mx-auto text-mint-600" size={42} />
              <h3 className="mt-3 text-xl font-bold">{t('review_pending_title', language)}</h3>
              <p className="mt-2 text-sage-600">{t('review_pending_desc', language)}</p>
              <SecondaryButton className="mt-5" onClick={() => setStep('login')}>
                {t('back_to_sign_in', language)}
              </SecondaryButton>
            </GlassCard>
          )}
        </section>

        <aside className="glass-floating rounded-3xl p-7">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-100 text-mint-700">
            <ShieldCheck size={24} />
          </span>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-sage-900">{t('connected_care_journey', language)}</h2>
          <p className="mt-3 text-sm leading-7 text-sage-600">{t('connected_care_desc', language)}</p>
          <div className="mt-7 space-y-4 border-t border-sage-200 pt-6">
            <p className="flex gap-3 text-sm font-semibold text-sage-700">
              <CheckCircle2 className="shrink-0 text-mint-600" size={18} /> {t('feature_mobile_offline', language)}
            </p>
            <p className="flex gap-3 text-sm font-semibold text-sage-700">
              <CheckCircle2 className="shrink-0 text-mint-600" size={18} /> {t('feature_role_based', language)}
            </p>
            <p className="flex gap-3 text-sm font-semibold text-sage-700">
              <CheckCircle2 className="shrink-0 text-mint-600" size={18} /> {t('feature_privacy_consent', language)}
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
