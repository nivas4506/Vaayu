import { ElementType, useMemo, useState } from 'react';
import { Ambulance, Building2, CheckCircle2, ClipboardList, ShieldCheck, Trash2, UserRound, Users, type LucideIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { Facility, UserLanguage } from '../types';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading } from './ui';

type Tab = 'overview' | 'approvals' | 'workers' | 'facilities' | 'emergencies';

const translations: Record<UserLanguage, {
  title: string;
  subtitle: string;
  overview: string;
  approvals: string;
  workers: string;
  facilities: string;
  emergencies: string;
  noPending: string;
  keep: string;
  remove: string;
  assigned: string;
  workerDetails: string;
  patient: string;
  mobile: string;
  district: string;
  status: string;
  continue: string;
  addFacility: string;
  add: string;
  facilityName: string;
  total: string;
  pending: string;
  emergency: string;
}> = {
  en: {
    title: 'District administration',
    subtitle: 'Manage all ASHA workers, patient assignments and service activity from one dashboard.',
    overview: 'Overview', approvals: 'Approvals', workers: 'ASHA workers', facilities: 'Facilities', emergencies: 'Emergencies',
    noPending: 'No ASHA worker approvals are pending.', keep: 'Keep worker', remove: 'Remove worker', assigned: 'Assigned patients', workerDetails: 'Worker details',
    patient: 'Patient', mobile: 'Mobile', district: 'District', status: 'Status', continue: 'Keep and continue', addFacility: 'Add a facility', add: 'Add facility',
    facilityName: 'Facility name', total: 'Total', pending: 'Pending', emergency: 'Emergencies',
  },
  hi: {
    title: 'जिला प्रशासन',
    subtitle: 'एक ही डैशबोर्ड से सभी आशा कार्यकर्ताओं, रोगी आवंटन और सेवा गतिविधियों का प्रबंधन करें।',
    overview: 'अवलोकन', approvals: 'अनुमोदन', workers: 'आशा कार्यकर्ता', facilities: 'सुविधाएँ', emergencies: 'आपातकाल',
    noPending: 'कोई आशा कार्यकर्ता अनुमोदन लंबित नहीं है।', keep: 'कार्यकर्ता रखें', remove: 'कार्यकर्ता हटाएँ', assigned: 'नियुक्त रोगी', workerDetails: 'कार्यकर्ता विवरण',
    patient: 'रोगी', mobile: 'मोबाइल', district: 'जिला', status: 'स्थिति', continue: 'रखें और जारी रखें', addFacility: 'सुविधा जोड़ें', add: 'जोड़ें',
    facilityName: 'सुविधा का नाम', total: 'कुल', pending: 'लंबित', emergency: 'आपातकाल',
  },
  mr: {
    title: 'जिल्हा प्रशासन',
    subtitle: 'एका डॅशबोर्डवरून सर्व आशा कर्मचारी, रुग्ण नियुक्त्या आणि सेवा कार्ये व्यवस्थापित करा.',
    overview: 'सारांश', approvals: 'मंजुरी', workers: 'आशा कर्मचारी', facilities: 'सुविधा', emergencies: 'तातडीची घटना',
    noPending: 'कोणताही आशा कर्मचारी मंजुरीसाठी प्रलंबित नाही.', keep: 'कर्मचारी ठेवा', remove: 'कर्मचारी काढा', assigned: 'नियुक्त रुग्ण', workerDetails: 'कर्मचारी तपशील',
    patient: 'रुग्ण', mobile: 'मोबाईल', district: 'जिल्हा', status: 'स्थिती', continue: 'ठेवा आणि पुढे जा', addFacility: 'सुविधा जोडा', add: 'जोडा',
    facilityName: 'सुविधेचे नाव', total: 'एकूण', pending: 'प्रलंबित', emergency: 'तातडीची घटना',
  },
  bn: {
    title: 'জেলা প্রশাসন',
    subtitle: 'একটি ড্যাশবোর্ড থেকে সমস্ত আশা কর্মী, রোগী নিয়োগ এবং পরিষেবা কার্যক্রম পরিচালনা করুন।',
    overview: 'অংশধারণ', approvals: 'অনুমোদন', workers: 'আশা কর্মী', facilities: 'সুবিধা', emergencies: 'জরুরি',
    noPending: 'কোনো আশা কর্মীর অনুমোদন বাকি নেই।', keep: 'কর্মী রাখুন', remove: 'কর্মী সরান', assigned: 'নিযুক্ত রোগী', workerDetails: 'কর্মী বিবরণ',
    patient: 'রোগী', mobile: 'মোবাইল', district: 'জেলা', status: 'অবস্থা', continue: 'রাখুন ও এগিয়ে যান', addFacility: 'সুবিধা যুক্ত করুন', add: 'যোগ করুন',
    facilityName: 'সুবিধার নাম', total: 'মোট', pending: 'বাকি', emergency: 'জরুরি',
  },
  kn: {
    title: 'ಜಿಲ್ಲಾ ಆಡಳಿತ',
    subtitle: 'ಒಂದೇ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಿಂದ ಎಲ್ಲಾ ಆಶಾ ಕೆಲಸಗಾರರು, ರೋಗಿ ನಿಯೋಜನೆಗಳು ಮತ್ತು ಸೇವಾ ಮಾಹಿತಿಯನ್ನು ನಿರ್ವಹಿಸಿ.',
    overview: 'ಅವಲೋಕನ', approvals: 'ಅನುದಾನ', workers: 'ಆಶಾ ಕೆಲಸಗಾರರು', facilities: 'ಸೌಲಭ್ಯಗಳು', emergencies: 'ತುರ್ತು',
    noPending: 'ಯಾವುದೇ ಆಶಾ ಕೆಲಸಗಾರನ ಅನುಮೋದನೆ ಬಾಕಿ ಇಲ್ಲ.', keep: 'ಕೆಲಸಗಾರರನ್ನು ಇರಿಸಿ', remove: 'ಕೆಲಸಗಾರರನ್ನು ತೆಗೆದುಹಾಕಿ', assigned: 'ನಿಯೋಜಿತ ರೋಗಿಗಳು', workerDetails: 'ಕೆಲಸಗಾರ ವಿವರ',
    patient: 'ರೋಗಿ', mobile: 'ಮೊಬೈಲ್', district: 'ಜಿಲ್ಲೆ', status: 'ಸ್ಥಿತಿ', continue: 'ಇಟ್ಟು ಮುಂದುವರಿಸಿ', addFacility: 'ಸೌಲಭ್ಯ ಸೇರಿಸಿ', add: 'ಸೇರಿಸಿ',
    facilityName: 'ಸೌಲಭ್ಯದ ಹೆಸರು', total: 'ಒಟ್ಟು', pending: 'ಬಾಕಿ', emergency: 'ತುರ್ತು',
  },
  ta: {
    title: 'மாவட்ட நிர்வாகம்',
    subtitle: 'ஒரே டாஷ்போர்ட்டில் அனைத்து அசா பணியாளர்கள், நோயாளி ஒதுக்கீடுகள் மற்றும் சேவைகளை நிர்வகிக்கவும்.',
    overview: 'கண்ணோட்டம்', approvals: 'அனுமதிகள்', workers: 'அசா பணியாளர்கள்', facilities: 'வசதிகள்', emergencies: 'அவசரம்',
    noPending: 'அனுமதிக்காக எந்த அசா பணியாளரும் நிலுவையில் இல்லை.', keep: 'பணியாளரை வைத்திரு', remove: 'பணியாளரை நீக்கு', assigned: 'ஒதுக்கப்பட்ட நோயாளிகள்', workerDetails: 'பணியாளர் விவரங்கள்',
    patient: 'நோயாளி', mobile: 'மொபைல்', district: 'மாவட்டம்', status: 'நிலை', continue: 'வைத்துக் கொண்டு தொடரவும்', addFacility: 'வசதியைச் சேர்க்கவும்', add: 'சேர்க்கவும்',
    facilityName: 'வசதியின் பெயர்', total: 'மொத்தம்', pending: 'நிலுவை', emergency: 'அவசரம்',
  },
  te: {
    title: 'జిల్లా నిర్వహణ',
    subtitle: 'ఒకే డాష్‌బోర్డ్‌లో అన్ని అషా పని staff, రోగి కేటాయింపులు మరియు సేవా కార్యకలాపాలను నిర్వహించండి.',
    overview: 'అవలోకనం', approvals: 'అనుమతులు', workers: 'అషా పనివారు', facilities: 'సౌకర్యాలు', emergencies: 'అత్యవసరాలు',
    noPending: 'అనుమతికి ఎలాంటి అషా పనివాడు పెండింగ్లో లేదు.', keep: 'పనివారిని ఉంచు', remove: 'పనివారిని తీసివేయి', assigned: 'కేటాయింపబడిన రోగులు', workerDetails: 'పనివారి వివరాలు',
    patient: 'రోగి', mobile: 'మొబైల్', district: 'జిల్లా', status: 'స్థితి', continue: 'ఉంచుకుని కొనసాగించు', addFacility: 'సౌకర్యం జోడించండి', add: 'జోడించు',
    facilityName: 'సౌకర్యం పేరు', total: 'మొత్తం', pending: 'పెండింగ్', emergency: 'అత్యవసరాలు',
  },
  gu: {
    title: 'જિલ્લા प्रशासन',
    subtitle: 'એક જ ડૅશબોર્ડથી તમામ આશા કામદારો, રોગીની ફાળવણી અને સેવા પ્રવૃત્તિનું સંચાલન કરો.',
    overview: 'સંક્ષેપ', approvals: 'મંજુરીઓ', workers: 'આશા કામદારો', facilities: 'સુવિધાઓ', emergencies: 'આપત્તિ',
    noPending: 'કોઈ આશા કામદારે મંજૂરી માટે બાકી નથી.', keep: 'કામદાર રાખો', remove: 'કામદાર હટાવો', assigned: 'નિયુક્ત રોગીઓ', workerDetails: 'કામદાર વિગતો',
    patient: 'રોગી', mobile: 'મોબાઇલ', district: 'જિલ્લા', status: 'સ્થિતિ', continue: 'રાખો અને આગળ વધો', addFacility: 'સુવિધા ઉમેરો', add: 'ઉમેરો',
    facilityName: 'સુવિધાનું નામ', total: 'કુલ', pending: 'બાકી', emergency: 'આપત્તિ',
  },
  pa: {
    title: 'ਜ਼ਿਲ੍ਹਾ ਪ੍ਰਬੰਧਨ',
    subtitle: 'ਇੱਕੋ ਡੈਸ਼ਬੋਰਡ ਤੋਂ ਸਾਰੇ ਅਸ਼ਾ ਕਰਮਚਾਰੀ, ਮਰੀਜ਼ ਨਿਯੁਕਤੀਆਂ ਅਤੇ ਸੇਵਾ ਗਤੀਵਿਧੀਆਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ।',
    overview: 'ਸਾਰੇ', approvals: 'ਮਨਜ਼ੂਰੀਆਂ', workers: 'ਅਸ਼ਾ ਕਰਮਚਾਰੀ', facilities: 'ਸੁਵਿਧਾਵਾਂ', emergencies: 'ਇਮਰਜੈਂਸੀ',
    noPending: 'ਕੋਈ ਅਸ਼ਾ ਕਰਮਚਾਰੀ ਮਨਜ਼ੂਰੀ ਲਈ ਬਕਾਇਆ ਨਹੀਂ ਹੈ।', keep: 'ਕਰਮਚਾਰੀ ਰੱਖੋ', remove: 'ਕਰਮਚਾਰੀ ਹਟਾਓ', assigned: 'ਨਿਯੁਕਤ ਮਰੀਜ਼', workerDetails: 'ਕਰਮਚਾਰੀ ਵੇਰਵੇ',
    patient: 'ਮਰੀਜ਼', mobile: 'ਮੋਬਾਈਲ', district: 'ਜ਼ਿਲ੍ਹਾ', status: 'ਸਥਿਤੀ', continue: 'ਰੱਖੋ ਅਤੇ ਅੱਗੇ ਵਧੋ', addFacility: 'ਸੁਵਿਧਾ ਜੋੜੋ', add: 'ਜੋੜੋ',
    facilityName: 'ਸੁਵਿਧਾ ਦਾ ਨਾਂ', total: 'ਕੁੱਲ', pending: 'ਬਕਾਇਆ', emergency: 'ਇਮਰਜੈਂਸੀ',
  },
  ml: {
    title: 'ജില്ലാ ഭരണകൂടം',
    subtitle: 'ഒരേ ഡാഷ്‌ബോർഡിന് കീഴിൽ എല്ലാ അശാ തൊഴിലാളികളും, രോഗി നിയോഗങ്ങളും സേവന പ്രവർത്തനങ്ങളും കൈകാര്യം ചെയ്യുക.',
    overview: 'അവലോകനം', approvals: 'അനുമതികൾ', workers: 'അശാ തൊഴിലാളികൾ', facilities: 'സൗകര്യങ്ങൾ', emergencies: 'അപകടാവസ്ഥ',
    noPending: 'അനുമതിക്കായി ഒരു അശാ തൊഴിലാളിയും ബാക്കി ഇല്ല.', keep: 'തൊഴിലാളിയെ സൂക്ഷിക്കുക', remove: 'തൊഴിലാളിയെ നീക്കം ചെയ്യുക', assigned: 'നിയുക്തമായ രോഗികൾ', workerDetails: 'തൊഴിലാളി വിശദാംശങ്ങൾ',
    patient: 'രോഗി', mobile: 'മൊബൈൽ', district: 'ജില്ല', status: 'നില', continue: 'സൂക്ഷിച്ച് തുടരുക', addFacility: 'സൗകര്യം ചേർക്കുക', add: 'ചേർക്കുക',
    facilityName: 'സൗകര്യത്തിന്റെ പേര്', total: 'മൊത്തം', pending: 'തടസമുള്ള', emergency: 'അപകടാവസ്ഥ',
  },
  or: {
    title: 'ଜିଲ୍ଲା ପ୍ରଶାସନ',
    subtitle: 'ଏକ ଡ୍ୟାଶବୋର୍ଡରୁ ସମସ୍ତ ଆଶା କର୍ମୀ, ରୋଗୀ ନିୟୋଜନ ଏବଂ ସେବା କାର୍ଯ୍ୟକଳାପ ପରିଚାଳନା କରନ୍ତୁ।',
    overview: 'ସାରାଃ', approvals: 'ମନ୍ତୁରଣ', workers: 'ଆଶା କର୍ମୀ', facilities: 'ସୁବିଧା', emergencies: 'ଜରୁରୀ',
    noPending: 'କୌଣସି ଆଶା କର୍ମୀ ମନ୍ତୁରଣ ଆବଶ୍ୟକ ନାହିଁ।', keep: 'କର୍ମୀଙ୍କୁ ରଖନ୍ତୁ', remove: 'କର୍ମୀଙ୍କୁ କାଢନ୍ତୁ', assigned: 'ନିୟୋଜିତ ରୋଗୀ', workerDetails: 'କର୍ମୀ ବିବରଣୀ',
    patient: 'ରୋଗୀ', mobile: 'ମୋବାଇଲ୍', district: 'ଜିଲ୍ଲା', status: 'ସ୍ଥିତି', continue: 'ରଖି ଚାଲିବା', addFacility: 'ସୁବିଧା ଯୋଗ କରନ୍ତୁ', add: 'ଯୋଗ କରନ୍ତୁ',
    facilityName: 'ସୁବିଧାର ନାମ', total: 'ମୋଟ', pending: 'ବିଳମ୍ବ', emergency: 'ଜରୁରୀ',
  },
  as: {
    title: 'জিলা প্রশাসন',
    subtitle: 'একটি ড্যাশবোর্ডৰ পৰা সকলো আষা কৰ্মী, রোগীৰ নিযুক্তি আৰু সেৱা কাৰ্যকলাপ পৰিচালনা কৰক।',
    overview: 'সংক্ষিপ্ত', approvals: 'অনুমোদন', workers: 'আশা কৰ্মী', facilities: 'সুবিধা', emergencies: 'জৰুৰী',
    noPending: 'কোনো আষা কৰ্মীৰ অনুমোদন বাকী নাই।', keep: 'কৰ্মী রাখক', remove: 'কৰ্মী আঁতৰাওক', assigned: 'নিযুক্ত ৰোগী', workerDetails: 'কৰ্মীৰ বিৱৰণ',
    patient: 'ৰোগী', mobile: 'মোবাইল', district: 'জিলা', status: 'অবস্থা', continue: 'থাকি চলি থাকক', addFacility: 'সুবিধা যোগ কৰক', add: 'যোগ কৰক',
    facilityName: 'সুবিধাৰ নাম', total: 'মুঠ', pending: 'বাকি', emergency: 'জৰুৰী',
  },
};

const metrics: { Icon: LucideIcon; label: (lang: UserLanguage) => string; value: (counts: { facilities: number; users: number; pending: number; emergencies: number }) => number }[] = [
  { Icon: Building2, label: (lang) => translations[lang].facilities, value: (c) => c.facilities },
  { Icon: Users, label: (lang) => translations[lang].workers, value: (c) => c.users },
  { Icon: ClipboardList, label: (lang) => translations[lang].pending, value: (c) => c.pending },
  { Icon: Ambulance, label: (lang) => translations[lang].emergency, value: (c) => c.emergencies },
];

interface AdminDashboardProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onEmergency?: () => void;
}

export default function AdminDashboard({
  activeTab,
  onTabChange,
  onEmergency,
}: AdminDashboardProps = {}) {
  const { users, facilities, emergencies, approveAsha, rejectAsha, saveFacility, updateEmergencyStatus, language, assignments } = useAppStore((s) => ({
    users: s.users,
    facilities: s.facilities,
    emergencies: s.emergencies,
    approveAsha: s.approveAsha,
    rejectAsha: s.rejectAsha,
    saveFacility: s.saveFacility,
    updateEmergencyStatus: s.updateEmergencyStatus,
    language: s.language,
    assignments: s.assignments,
  }));

  const [localTab, setLocalTab] = useState<Tab>('overview');

  const resolvedTab: Tab = useMemo(() => {
    if (activeTab === 'approvals' || activeTab === 'workers' || activeTab === 'facilities' || activeTab === 'emergencies') {
      return activeTab;
    }
    if (activeTab === 'dashboard' || activeTab === 'overview') {
      return 'overview';
    }
    return localTab;
  }, [activeTab, localTab]);

  const setTab = (nextTab: Tab) => {
    setLocalTab(nextTab);
    if (onTabChange) {
      onTabChange(nextTab === 'overview' ? 'dashboard' : nextTab);
    }
  };
  const tab = resolvedTab;
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Jabalpur');
  const texts = translations[language];
  const pending = users.filter((user) => user.role === 'asha' && user.status === 'pending');
  const ashaWorkers = users.filter((user) => user.role === 'asha');
  const workerDetails = useMemo(
    () =>
      ashaWorkers.map((worker) => ({
        worker,
        patients: assignments
          .filter((assignment) => assignment.ashaId === worker.id)
          .map((assignment) => users.find((user) => user.id === assignment.patientId))
          .filter((patient): patient is NonNullable<typeof patient> => Boolean(patient)),
      })),
    [ashaWorkers, assignments, users],
  );

  const addFacility = () => {
    if (!name.trim()) return;
    const facility: Facility = {
      id: `facility-${Date.now()}`,
      name,
      type: 'PHC',
      pincode: '482001',
      village: district,
      distanceKm: 0,
      hours: '24 Hours',
      contact: '+91 98765 43210',
      latitude: 23.19,
      longitude: 79.97,
      emergencyAvailable: true,
      ambulanceAvailable: true,
      status: 'active',
      services: [],
    };
    saveFacility(facility);
    setName('');
  };

  const counts = {
    facilities: facilities.length,
    users: users.length,
    pending: pending.length,
    emergencies: emergencies.length,
  };

  return (
    <div className="safe-page mx-auto max-w-6xl px-4 py-7 sm:px-6">
      <SectionHeading eyebrow="VAAYU" title={texts.title} sub={texts.subtitle} />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {(['overview', 'approvals', 'workers', 'facilities', 'emergencies'] as Tab[]).map((item) => (
          <button
            key={item}
            className={`tap-target rounded-xl px-4 text-sm font-bold capitalize ${tab === item ? 'bg-mint-600 text-white' : 'bg-sage-100 text-sage-700'}`}
            onClick={() => setTab(item)}
          >
            {item === 'overview' ? texts.overview : item === 'approvals' ? texts.approvals : item === 'workers' ? texts.workers : item === 'facilities' ? texts.facilities : texts.emergencies}
            {item === 'approvals' && pending.length ? ` (${pending.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-3 sm:grid-cols-4">
          {metrics.map(({ Icon, label, value }) => (
            <GlassCard key={label(language)} className="p-5">
              <Icon className="text-mint-600" />
              <b className="mt-2 block text-3xl">{value(counts)}</b>
              <span className="text-sm text-sage-600">{label(language)}</span>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'approvals' && (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <GlassCard className="p-5">
              <p className="text-sm font-semibold text-sage-700">{texts.noPending}</p>
            </GlassCard>
          ) : (
            pending.map((worker) => (
              <GlassCard key={worker.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-extrabold text-sage-900">{worker.name}</p>
                  <p className="text-sm text-sage-600">{worker.email} � {worker.mobile}</p>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-sage-500">{worker.district}</p>
                </div>
                <div className="flex gap-2">
                  <PrimaryButton onClick={() => approveAsha(worker.id)}><CheckCircle2 size={16} /> {texts.keep}</PrimaryButton>
                  <SecondaryButton onClick={() => rejectAsha(worker.id)}><Trash2 size={16} /> {texts.remove}</SecondaryButton>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}

      {tab === 'workers' && (
        <div className="space-y-4">
          {workerDetails.map(({ worker, patients }) => (
            <GlassCard key={worker.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-100 text-mint-700"><UserRound size={22} /></span>
                  <div>
                    <p className="text-xl font-extrabold text-sage-900">{worker.name}</p>
                    <p className="text-sm text-sage-600">{worker.mobile}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <PrimaryButton onClick={() => approveAsha(worker.id)}><ShieldCheck size={16} /> {texts.continue}</PrimaryButton>
                  <SecondaryButton onClick={() => rejectAsha(worker.id)}><Trash2 size={16} /> {texts.remove}</SecondaryButton>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-sage-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] text-sage-500">{texts.workerDetails}</p>
                  <p className="mt-2 text-sm font-semibold text-sage-800">{worker.email}</p>
                  <p className="text-sm text-sage-600">{texts.district}: {worker.district}</p>
                  <p className="text-sm text-sage-600">{texts.status}: {worker.status}</p>
                </div>

                <div className="rounded-xl bg-sage-50 p-3 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] text-sage-500">{texts.assigned}</p>
                  <div className="mt-2 space-y-2">
                    {patients.length === 0 ? (
                      <p className="text-sm text-sage-600">No assigned patients.</p>
                    ) : (
                      patients.map((patient) => (
                        <div key={patient.id} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                          <p className="font-bold text-sage-800">{patient.name}</p>
                          <p className="text-xs text-sage-600">{texts.mobile}: {patient.mobile}</p>
                          <p className="text-xs text-sage-600">{texts.district}: {patient.district}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === 'facilities' && (
        <div className="space-y-4">
          <GlassCard className="p-5">
            <p className="mb-3 text-lg font-extrabold text-sage-900">{texts.addFacility}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder={texts.facilityName} className="flex-1 rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm" />
              <input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder={texts.district} className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5 text-sm sm:w-40" />
              <PrimaryButton onClick={addFacility}>{texts.add}</PrimaryButton>
            </div>
          </GlassCard>

          <div className="grid gap-3 md:grid-cols-2">
            {facilities.map((facility) => (
              <GlassCard key={facility.id} className="p-5">
                <p className="text-lg font-extrabold text-sage-900">{facility.name}</p>
                <p className="mt-1 text-sm text-sage-600">{facility.village} � {facility.district || 'Jabalpur'}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[.12em] text-sage-500">{facility.type}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {tab === 'emergencies' && (
        <div className="space-y-3">
          {emergencies.length === 0 ? (
            <GlassCard className="p-5">
              <p className="text-sm font-semibold text-sage-700">No emergencies in the queue.</p>
            </GlassCard>
          ) : (
            emergencies.map((emergency) => (
              <GlassCard key={emergency.id} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-extrabold text-sage-900">{emergency.type}</p>
                  <span className="rounded-full bg-status-unavailable/10 px-2 py-1 text-xs font-bold uppercase tracking-[.12em] text-status-unavailable">{emergency.status}</span>
                </div>
                <p className="mt-2 text-sm text-sage-600">{emergency.manualLocation || 'Manual location not provided'}</p>
                <SecondaryButton className="mt-3" onClick={() => updateEmergencyStatus(emergency.id, 'acknowledged')}>Acknowledge</SecondaryButton>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
