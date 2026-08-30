import { useState } from 'react';
import { ChevronDown, Leaf, LogIn, LogOut, Menu, Siren, Wifi, WifiOff, X } from 'lucide-react';
import { useAppStore } from '../store';
import { SUPPORTED_LANGUAGES, t } from '../i18n';
import { UserLanguage, UserRole } from '../types';

type Target = 'landing' | 'auth' | 'workspace' | 'emergency';

const headerLabels: Record<UserLanguage, { connected: string; limited: string; sos: string; signOut: string; access: string }> = {
  en: { connected: 'Connected', limited: 'Limited', sos: 'SOS', signOut: 'Sign out', access: 'Access portal' },
  hi: { connected: 'जुड़ा हुआ', limited: 'सीमित', sos: 'आपातकालीन', signOut: 'साइन आउट', access: 'पोर्टल खोलें' },
  mr: { connected: 'जोडलेले', limited: 'मर्यादित', sos: 'आपत्कालीन', signOut: 'साइन आउट', access: 'पोर्टल उघडा' },
  bn: { connected: 'সংযুক্ত', limited: 'সীমিত', sos: 'জরুরি', signOut: 'সাইন আউট', access: 'পোর্টাল খুলুন' },
  kn: { connected: 'ಸಂಪರ್ಕಿತ', limited: 'ಸೀಮಿತ', sos: 'ತುರ್ತು', signOut: 'ಸೈನ್ ಔಟ್', access: 'ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' },
  ta: { connected: 'இணைக்கப்பட்டது', limited: 'வரையறுக்கப்பட்டது', sos: 'அவசரம்', signOut: 'வெளியேறு', access: 'போர்டலைத் திறக்கவும்' },
  te: { connected: 'కనెక్ట్ అయింది', limited: 'పరిమితం', sos: 'అత్యవసరం', signOut: 'సైన్ అవుట్', access: 'పోర్టల్ తెరవండి' },
  gu: { connected: 'કનેક્ટેડ', limited: 'મર્યાદિત', sos: 'કટોકટી', signOut: 'સાઇન આઉટ', access: 'પોર્ટલ ખોલો' },
  pa: { connected: 'ਜੁੜਿਆ ਹੋਇਆ', limited: 'ਸੀਮਤ', sos: 'ਐਮਰਜੈਂਸੀ', signOut: 'ਸਾਈਨ ਆਊਟ', access: 'ਪੋਰਟਲ ਖੋਲ੍ਹੋ' },
  ml: { connected: 'ബന്ധിപ്പിച്ചു', limited: 'പരിമിതം', sos: 'അടിയന്തര', signOut: 'സൈൻ ഔട്ട്', access: 'പോർട്ടൽ തുറക്കുക' },
  or: { connected: 'ସଂଯୁକ୍ତ', limited: 'ସୀମିତ', sos: 'ଜରୁରୀ', signOut: 'ସାଇନ୍ ଆଉଟ୍', access: 'ପୋର୍ଟାଲ ଖୋଲନ୍ତୁ' },
  as: { connected: 'সংযুক্ত', limited: 'সীমিত', sos: 'জৰুৰী', signOut: 'ছাইন আউট', access: 'পৰ্টেল খোলক' },
};

interface HeaderProps {
  authenticated: boolean;
  activeTab?: string;
  onSignOut: () => void;
  onNavigate: (target: Target) => void;
  onTabChange?: (tab: string) => void;
}

export default function Header({
  authenticated,
  activeTab = 'dashboard',
  onSignOut,
  onNavigate,
  onTabChange,
}: HeaderProps) {
  const { language, setLanguage, isOffline, setOffline, session } = useAppStore((s) => ({
    language: s.language,
    setLanguage: s.setLanguage,
    isOffline: s.isOffline,
    setOffline: s.setOffline,
    session: s.session,
  }));
  const [open, setOpen] = useState(false);

  const role = session?.role;

  const section = (id: string) => {
    onNavigate('landing');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    setOpen(false);
  };

  const handleRoleTabClick = (tabId: string) => {
    if (tabId === 'emergency') {
      onNavigate('emergency');
    } else {
      onNavigate('workspace');
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
    setOpen(false);
  };

  const getRoleNavItems = (userRole?: UserRole) => {
    switch (userRole) {
      case 'patient':
        return [
          { id: 'dashboard', label: t('nav_dashboard', language) },
          { id: 'find-care', label: t('nav_find_care', language) },
          { id: 'records', label: t('nav_health_records', language) },
          { id: 'referrals', label: t('nav_referrals', language) },
          { id: 'emergency', label: t('nav_emergency', language), isEmergency: true },
        ];
      case 'asha':
        return [
          { id: 'dashboard', label: t('nav_dashboard', language) },
          { id: 'patients', label: t('nav_assigned_patients', language) },
          { id: 'referrals', label: t('nav_referrals', language) },
          { id: 'assist', label: t('nav_patient_assistance', language) },
          { id: 'emergency', label: t('nav_emergency', language), isEmergency: true },
        ];
      case 'staff':
        return [
          { id: 'dashboard', label: t('nav_dashboard', language) },
          { id: 'services', label: t('nav_facility_services', language) },
          { id: 'referrals', label: t('nav_incoming_referrals', language) },
          { id: 'info', label: t('nav_facility_info', language) },
          { id: 'emergency', label: t('nav_emergency', language), isEmergency: true },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: t('nav_dashboard', language) },
          { id: 'approvals', label: t('nav_asha_approvals', language) },
          { id: 'workers', label: t('nav_workers', language) },
          { id: 'facilities', label: t('nav_facilities', language) },
          { id: 'emergencies', label: t('nav_emergencies', language) },
        ];
      default:
        return [{ id: 'dashboard', label: t('nav_dashboard', language) }];
    }
  };

  const roleNavItems = getRoleNavItems(role);

  return (
    <header className="sticky top-2 sm:top-3 z-40 mx-auto flex w-[calc(100%-16px)] sm:w-[calc(100%-32px)] max-w-7xl min-h-[58px] items-center justify-between gap-2 sm:gap-4 rounded-2xl sm:rounded-3xl px-3 py-2 sm:px-5 glass-strong shadow-glass transition-all duration-300">
      {/* Brand / Logo */}
      <button
        type="button"
        className="flex shrink-0 items-center gap-2.5 sm:gap-3 text-left focus:outline-none"
        aria-label="Go to VAAYU"
        onClick={() => {
          onNavigate('landing');
          setOpen(false);
        }}
      >
        <span className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl bg-mint-600 text-white shadow-soft transition-transform hover:scale-105">
          <Leaf size={18} />
        </span>
        <span>
          <b className="block text-sm sm:text-base tracking-[.12em] text-mint-700 font-extrabold">{t('app_title', language)}</b>
          <small className="hidden text-[.65rem] font-bold text-sage-500 md:block">
            {t('digital_health_access', language)}
          </small>
        </span>
      </button>

      {/* Desktop Navigation (Flexible and Responsive across Languages) */}
      <nav className="hidden xl:flex items-center justify-center gap-1.5 2xl:gap-3 flex-1 mx-2 overflow-hidden" aria-label="Primary navigation">
        {/* UNAUTHENTICATED PUBLIC NAVIGATION */}
        {!authenticated && (
          <>
            <button
              className="shrink-0 whitespace-nowrap text-xs 2xl:text-sm font-bold text-sage-700 px-2.5 py-1.5 rounded-xl hover:bg-mint-50/80 hover:text-mint-700 transition-colors"
              onClick={() => {
                onNavigate('landing');
                setOpen(false);
              }}
            >
              {t('nav_home', language)}
            </button>
            {[
              ['network', 'nav_network'],
              ['services', 'nav_services'],
              ['how-it-works', 'nav_how'],
              ['guidelines', 'nav_about'],
              ['resources', 'nav_impact'],
            ].map(([id, key]) => (
              <button
                key={id}
                className="shrink-0 whitespace-nowrap text-xs 2xl:text-sm font-bold text-sage-700 px-2.5 py-1.5 rounded-xl hover:bg-mint-50/80 hover:text-mint-700 transition-colors"
                onClick={() => section(id)}
              >
                {t(key as any, language)}
              </button>
            ))}
          </>
        )}

        {/* AUTHENTICATED ROLE-SPECIFIC NAVIGATION (NO HOME BUTTON) */}
        {authenticated && (
          <>
            {roleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`shrink-0 whitespace-nowrap text-xs 2xl:text-sm font-bold px-2.5 py-1.5 rounded-xl transition-all ${
                    item.isEmergency
                      ? 'text-status-unavailable hover:bg-red-50 hover:text-red-700'
                      : isActive
                      ? 'bg-mint-100 text-mint-800 shadow-sm'
                      : 'text-sage-700 hover:bg-mint-50/80 hover:text-mint-700'
                  }`}
                  onClick={() => handleRoleTabClick(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Right Controls Container */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {/* Language Selector */}
        <label className="relative hidden sm:block">
          <span className="sr-only">{t('select_lang', language)}</span>
          <select
            className="tap-target appearance-none rounded-xl border border-sage-200 bg-white/80 py-1.5 pl-2.5 pr-7 text-xs font-bold text-sage-800 shadow-sm hover:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-200 transition-all cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value as UserLanguage)}
          >
            {SUPPORTED_LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.nativeName}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sage-500" size={13} />
        </label>

        {/* Offline / Connectivity Toggle */}
        <button
          aria-label={isOffline ? 'Switch to connected mode' : 'Switch to limited connectivity mode'}
          title={isOffline ? headerLabels[language].limited : headerLabels[language].connected}
          className={`tap-target hidden rounded-xl px-2.5 py-1.5 text-xs font-bold md:inline-flex items-center gap-1.5 transition-colors ${
            isOffline ? 'bg-status-limited/15 text-status-limited' : 'bg-mint-50 text-mint-700 hover:bg-mint-100'
          }`}
          onClick={() => setOffline(!isOffline)}
        >
          {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
          <span className="hidden 2xl:inline">{isOffline ? headerLabels[language].limited : headerLabels[language].connected}</span>
        </button>

        {/* SOS Button */}
        <button
          aria-label="Emergency SOS"
          className="tap-target inline-flex items-center gap-1 rounded-xl bg-status-unavailable/10 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-status-unavailable hover:bg-status-unavailable/20 transition-colors"
          onClick={() => onNavigate('emergency')}
        >
          <Siren size={15} />
          <span className="hidden sm:inline">{headerLabels[language].sos}</span>
        </button>

        {/* Auth / Red Sign Out Button */}
        {authenticated ? (
          <button
            className="sign-out-button hidden sm:inline-flex"
            onClick={onSignOut}
          >
            <LogOut size={14} />
            <span>{headerLabels[language].signOut}</span>
          </button>
        ) : (
          <button
            className="tap-target hidden items-center gap-1 rounded-xl bg-mint-600 px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-soft transition-all hover:bg-mint-700 sm:inline-flex"
            onClick={() => onNavigate('auth')}
          >
            <LogIn size={14} /> <span>{headerLabels[language].access}</span>
          </button>
        )}

        {/* Mobile / Tablet Hamburger Toggle */}
        <button
          aria-label="Toggle navigation menu"
          className="tap-target grid place-items-center rounded-xl xl:hidden text-sage-700 hover:bg-sage-100/80 transition-colors p-2"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu (Fluid width and smooth scroll) */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[min(calc(100vw-24px),22rem)] max-h-[85vh] overflow-y-auto rounded-3xl border border-white/90 bg-[#fcfdf9]/95 p-3.5 shadow-lift backdrop-blur-2xl xl:hidden z-50 transition-all">
          {/* UNAUTHENTICATED PUBLIC DRAWER */}
          {!authenticated && (
            <>
              <button
                className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-sage-800 hover:bg-mint-50 transition-colors"
                onClick={() => {
                  onNavigate('landing');
                  setOpen(false);
                }}
              >
                {t('nav_home', language)}
              </button>
              <div className="mb-1 px-3.5 pt-2 text-[.68rem] font-extrabold uppercase tracking-[.12em] text-sage-500">
                {t('navigate', language)}
              </div>
              {[
                ['network', 'nav_network'],
                ['services', 'nav_services'],
                ['how-it-works', 'nav_how'],
                ['guidelines', 'nav_about'],
                ['resources', 'nav_impact'],
              ].map(([id, key]) => (
                <button
                  key={id}
                  className="w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-sage-700 hover:bg-mint-50 hover:text-mint-800 transition-colors"
                  onClick={() => section(id)}
                >
                  {t(key as any, language)}
                </button>
              ))}
              <div className="my-2.5 border-t border-sage-200/60" />
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-mint-700 transition-colors"
                onClick={() => {
                  onNavigate('auth');
                  setOpen(false);
                }}
              >
                <LogIn size={16} /> {headerLabels[language].access}
              </button>
            </>
          )}

          {/* AUTHENTICATED ROLE DRAWER (NO HOME BUTTON) */}
          {authenticated && (
            <>
              <div className="mb-1 px-3.5 pt-1 text-[.68rem] font-extrabold uppercase tracking-[.12em] text-mint-700">
                {role ? `${role.toUpperCase()} PORTAL` : 'AUTHENTICATED'}
              </div>
              {roleNavItems.map((item) => (
                <button
                  key={item.id}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition-colors ${
                    item.isEmergency
                      ? 'text-status-unavailable hover:bg-red-50'
                      : activeTab === item.id
                      ? 'bg-mint-100 text-mint-800'
                      : 'text-sage-700 hover:bg-mint-50'
                  }`}
                  onClick={() => handleRoleTabClick(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <div className="my-2.5 border-t border-sage-200/60" />
              <button
                className="sign-out-button w-full py-2.5 justify-center text-sm font-bold"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
              >
                <LogOut size={16} /> {headerLabels[language].signOut}
              </button>
            </>
          )}

          {/* Language Selector in Drawer */}
          <div className="mt-3 border-t border-sage-200/60 pt-2.5 px-1">
            <label className="block text-xs font-bold text-sage-600">
              {t('select_lang', language)}
              <select
                className="mt-1.5 w-full rounded-xl border border-sage-200 bg-white p-2.5 text-xs font-bold text-sage-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-200"
                value={language}
                onChange={(e) => setLanguage(e.target.value as UserLanguage)}
              >
                {SUPPORTED_LANGUAGES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.nativeName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </header>
  );
}
