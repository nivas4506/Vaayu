import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, LockKeyhole, ShieldCheck, UserPlus } from 'lucide-react';
import { useAppStore } from '../store';
import { verifyDemoOtp, requestOtpApi, verifyOtpApi } from '../services/otpService';
import { UserLanguage, UserRole } from '../types';
import { t } from '../i18n';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading } from './ui';

const GOOGLE_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  (typeof process !== 'undefined' && process.env?.GOOGLE_CLIENT_ID) ||
  '281442205792-qud09vjpv5jqmosl350s4oolbksha5gs.apps.googleusercontent.com';

type Step = 'login' | 'register' | 'otp' | 'pending';
const field = 'mt-1.5 w-full rounded-xl border border-sage-200 bg-white/85 px-3.5 py-3 text-sage-900 shadow-sm transition focus:border-mint-600 focus:outline-none focus:ring-4 focus:ring-mint-100';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT', e);
    return null;
  }
}

export default function AuthFlow({ onDone }: { onDone: () => void }) {
  const { registerDemoUser, signIn, signInWithGoogle, language, setLanguage } = useAppStore(s => ({
    registerDemoUser: s.registerDemoUser,
    signIn: s.signIn,
    signInWithGoogle: s.signInWithGoogle,
    language: s.language,
    setLanguage: s.setLanguage
  }));
  const [step, setStep] = useState<Step>('login');
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [oauthRole, setOauthRole] = useState<UserRole>('patient');
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirm: '', role: 'patient' as UserRole, state: 'Madhya Pradesh', district: 'Jabalpur', address: '', emergencyContact: ''
  });

  const set = (key: keyof typeof form, value: string) => setForm(s => ({ ...s, [key]: value }));

  // Initialize Google Identity Services OAuth 2.0
  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      if (response?.credential) {
        const payload = parseJwt(response.credential);
        if (payload?.email) {
          const result = signInWithGoogle({
            name: payload.name || payload.given_name || 'Google User',
            email: payload.email,
            googleId: payload.sub,
            picture: payload.picture,
            role: oauthRole,
          });
          if (result.error) {
            setError(result.error);
            if (result.user?.status === 'pending') setStep('pending');
            return;
          }
          onDone();
        }
      }
    };

    const renderMockButton = (container: HTMLElement) => {
      container.innerHTML = '';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'w-full max-w-xs flex items-center justify-center gap-2.5 rounded-full border border-sage-300 bg-white px-5 py-2.5 text-sm font-bold text-sage-700 shadow-sm transition hover:bg-sage-50 focus:outline-none focus:ring-4 focus:ring-mint-100 cursor-pointer';
      btn.style.width = '320px';
      btn.style.minHeight = '44px';
      btn.innerHTML = `
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        <span>${step === 'register' ? 'Sign up with Google (Instant Demo)' : 'Sign in with Google (Instant Demo)'}</span>
      `;
      btn.onclick = () => {
        const mockPayload = {
          iss: 'https://accounts.google.com',
          sub: `google-mock-${Date.now()}`,
          email: `google.user-${oauthRole}@vaayu.sehatreach`,
          email_verified: true,
          name: 'Demo Google User',
          given_name: 'Demo',
          family_name: 'Google User',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        };
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify(mockPayload));
        const token = `${header}.${payload}.mockSignature`;
        handleCredentialResponse({ credential: token });
      };
      container.appendChild(btn);
    };

    const initGsi = () => {
      const btnContainer = document.getElementById('googleSignInBtn');
      if (!btnContainer) return false;

      // Check if real Google Client ID is configured and valid
      const hasRealClientId = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('placeholder') && GOOGLE_CLIENT_ID.length > 20;

      if (hasRealClientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: step === 'register' ? 'signup_with' : 'signin_with',
            width: 320,
          });
          return true;
        } catch (e) {
          console.warn('GSI initialization failed, falling back to instant login:', e);
          renderMockButton(btnContainer);
          return true;
        }
      } else {
        renderMockButton(btnContainer);
        return true;
      }
    };

    // Try immediately
    const initialized = initGsi();

    // Set up polling interval to check if GSI loads later, or to keep it updated
    const interval = setInterval(() => {
      const done = initGsi();
      if (done && (window as any).google?.accounts?.id) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [step, oauthRole, onDone, signInWithGoogle]);

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

  const [otpInfo, setOtpInfo] = useState<{ message?: string; demoOtp?: string; isSending?: boolean }>({});

  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (!form.name || !form.mobile || !form.email || !form.password) return setError('Please complete the required fields.');
    
    setError('');
    setOtpInfo({ isSending: true });
    
    const user = registerDemoUser({ ...form, language });
    setPendingId(user.id);
    setStep('otp');

    try {
      const res = await requestOtpApi(form.mobile);
      setOtpInfo({
        message: res.message,
        demoOtp: res.demoOtp,
        isSending: false,
      });
    } catch (err: any) {
      setOtpInfo({
        message: 'Demo mode active: Enter code 482910 or 123456',
        demoOtp: '482910',
        isSending: false,
      });
    }
  };

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otp = new FormData(event.currentTarget).get('otp')?.toString() || '';
    if (!otp || otp.trim().length !== 6) return setError('Enter a valid 6-digit verification code.');

    const verification = await verifyOtpApi(form.mobile, otp);
    if (!verification.valid) {
      return setError(verification.message || 'Invalid verification code. Please try again.');
    }

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
              {/* Google OAuth 2.0 Button */}
              <div className="flex flex-col items-center justify-center space-y-3 pb-5">
                <div id="googleSignInBtn" className="flex min-h-[44px] justify-center" />
                <div className="flex w-full items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-sage-200" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage-400">or sign in with email</span>
                  <div className="h-px flex-1 bg-sage-200" />
                </div>
              </div>

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
              {/* Google OAuth 2.0 Register Option */}
              <div className="flex flex-col items-center justify-center space-y-3 pb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-sage-600">
                  <span>Sign up as:</span>
                  <select
                    className="rounded-lg border border-sage-300 bg-white px-2 py-1 text-xs font-bold text-sage-800"
                    value={oauthRole}
                    onChange={e => setOauthRole(e.target.value as UserRole)}
                  >
                    <option value="patient">Citizen / Patient</option>
                    <option value="asha">ASHA Worker</option>
                  </select>
                </div>
                <div id="googleSignInBtn" className="flex min-h-[44px] justify-center" />
                <div className="flex w-full items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-sage-200" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sage-400">or register with details</span>
                  <div className="h-px flex-1 bg-sage-200" />
                </div>
              </div>

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
                <button type="button" className="sm:col-span-2 py-2 text-sm font-bold text-mint-700 underline underline-offset-4" onClick={() => { setError(''); setStep('login'); }}>
                  Already have an account? Sign in
                </button>
              </form>
            </GlassCard>
          )}

          {step === 'otp' && (
            <GlassCard strong className="p-6 sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-100 text-mint-700">
                <ShieldCheck size={24} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-sage-900">{t('confirm_contact_details', language)}</h3>
              <p className="mt-2 text-sm leading-6 text-sage-600">
                {t('enter_otp_desc', language)} <span className="font-bold text-sage-900">{form.mobile}</span>
              </p>

              {otpInfo.message && (
                <div className={`mt-4 rounded-xl p-3.5 text-xs font-semibold ${otpInfo.demoOtp ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-mint-50 text-mint-900 border border-mint-200'}`}>
                  <p>{otpInfo.message}</p>
                  {otpInfo.demoOtp && (
                    <p className="mt-1 font-mono font-bold text-sm text-amber-700">
                      Code: {otpInfo.demoOtp} <span className="text-[11px] font-normal text-amber-600">(Use this code or check SMS)</span>
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={confirm} className="mt-6 space-y-4">
                <label className="block text-sm font-bold">
                  {t('verification_code', language)}
                  <input
                    required
                    defaultValue={otpInfo.demoOtp || ''}
                    className={field}
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                  />
                </label>
                {error && <p className="text-sm font-bold text-status-unavailable">{error}</p>}
                <PrimaryButton className="w-full" type="submit">
                  <CheckCircle2 size={18} /> {t('verify_account_btn', language)}
                </PrimaryButton>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    className="font-bold text-sage-500 hover:text-sage-700"
                    onClick={() => { setError(''); setStep('register'); }}
                  >
                    ← Change Mobile Number
                  </button>
                  <button
                    type="button"
                    disabled={otpInfo.isSending}
                    className="font-bold text-mint-700 hover:underline disabled:opacity-50"
                    onClick={async () => {
                      setOtpInfo({ isSending: true });
                      setError('');
                      const res = await requestOtpApi(form.mobile);
                      setOtpInfo({ message: res.message, demoOtp: res.demoOtp, isSending: false });
                    }}
                  >
                    {otpInfo.isSending ? 'Sending...' : 'Resend OTP via SMS'}
                  </button>
                </div>
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
