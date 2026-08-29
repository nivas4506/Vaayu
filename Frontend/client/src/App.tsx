import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, MessageCircleMore, Send, X } from 'lucide-react';
import { useAppStore } from './store';
import { t } from './i18n';
import Header from './components/Header';
import Landing from './components/Landing';
import PatientDashboard from './components/PatientDashboard';
import AshaWorkspace from './components/AshaWorkspace';
import StaffWorkspace from './components/StaffWorkspace';
import AdminDashboard from './components/AdminDashboard';
import AuthFlow from './components/AuthFlow';
import EmergencyFlow from './components/EmergencyFlow';
import { pageTransition } from './components/ui';

type Screen = 'landing' | 'auth' | 'workspace' | 'emergency';

function FloatingAgentChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<string[]>([
    'Agent: I can help with care navigation, facilities, and referrals.',
  ]);

  const sendMessage = () => {
    const message = draft.trim();
    if (!message) return;
    setMessages((prev) => [
      ...prev,
      `You: ${message}`,
      'Agent: I can help you sort the next care step. Choose a service, location, and facility in the app to continue.',
    ]);
    setDraft('');
  };

  return (
    <>
      <button
        type="button"
        aria-label="Chat with care agent"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-mint-600 text-white shadow-lift transition hover:bg-mint-700"
      >
        <MessageCircleMore size={24} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(92vw,22rem)] rounded-3xl border border-sage-200 bg-white/95 p-3 shadow-lift backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-mint-600">VAAYU agent</p>
              <p className="text-sm font-semibold text-sage-900">Care navigation chat</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-sage-500 hover:bg-sage-100"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mb-3 max-h-56 space-y-2 overflow-y-auto rounded-2xl bg-sage-50 p-3 text-sm text-sage-700">
            {messages.map((message, index) => (
              <div key={`${message}-${index}`} className="rounded-xl bg-white px-2.5 py-2 shadow-sm">
                {message}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') sendMessage();
              }}
              placeholder="Ask the agent..."
              className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200"
            />
            <button
              type="button"
              onClick={sendMessage}
              className="grid h-11 w-11 place-items-center rounded-xl bg-mint-600 text-white"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  const { language, session, isOffline, pendingSync, signOut } = useAppStore((s) => ({
    language: s.language,
    session: s.session,
    isOffline: s.isOffline,
    pendingSync: s.pendingSync,
    signOut: s.signOut,
  }));

  // Direct authenticated users immediately to workspace
  const [screen, setScreen] = useState<Screen>(() => (session ? 'workspace' : 'landing'));
  const [workspaceTab, setWorkspaceTab] = useState<string>('dashboard');
  const [toast, setToast] = useState(false);

  const go = (next: Screen) => {
    // If authenticated user attempts to go to landing, keep them on their role dashboard
    const target = session && next === 'landing' ? 'workspace' : next;
    if (target !== screen) {
      window.history.pushState({ vaayuScreen: target }, '');
      setScreen(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const restore = (event: PopStateEvent) => {
      const stateScreen = event.state?.vaayuScreen as Screen;
      if (session && stateScreen === 'landing') {
        setScreen('workspace');
      } else {
        setScreen(stateScreen || (session ? 'workspace' : 'landing'));
      }
    };
    window.history.replaceState({ vaayuScreen: screen }, '');
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [screen, session]);

  useEffect(() => {
    if (isOffline && pendingSync.length) {
      setToast(true);
      const id = window.setTimeout(() => setToast(false), 2200);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOffline, pendingSync.length]);

  const logout = () => {
    signOut();
    setWorkspaceTab('dashboard');
    go('auth');
  };

  const handleLoginDone = () => {
    setWorkspaceTab('dashboard');
    go('workspace');
  };

  const role = session?.role;

  return (
    <div className="min-h-screen pb-20">
      <Header
        authenticated={!!session}
        activeTab={workspaceTab}
        onSignOut={logout}
        onNavigate={(target) => go(target)}
        onTabChange={(tab) => {
          setWorkspaceTab(tab);
          go('workspace');
        }}
      />

      <AnimatePresence mode="wait">
        {screen === 'landing' && !session && (
          <motion.div key="landing" {...pageTransition}>
            <Landing onStart={() => go('auth')} />
          </motion.div>
        )}

        {screen === 'auth' && (
          <motion.div key="auth" {...pageTransition}>
            <AuthFlow onDone={handleLoginDone} />
          </motion.div>
        )}

        {screen === 'emergency' && (
          <motion.div key="emergency" {...pageTransition}>
            <EmergencyFlow />
          </motion.div>
        )}

        {screen === 'workspace' && session && (
          <motion.div key={`work-${role}`} {...pageTransition}>
            {role === 'patient' && (
              <PatientDashboard
                activeTab={workspaceTab}
                onTabChange={setWorkspaceTab}
                onEmergency={() => go('emergency')}
              />
            )}
            {role === 'asha' && (
              <AshaWorkspace
                activeTab={workspaceTab}
                onTabChange={setWorkspaceTab}
                onEmergency={() => go('emergency')}
              />
            )}
            {role === 'staff' && (
              <StaffWorkspace
                activeTab={workspaceTab}
                onTabChange={setWorkspaceTab}
                onEmergency={() => go('emergency')}
              />
            )}
            {role === 'admin' && (
              <AdminDashboard
                activeTab={workspaceTab}
                onTabChange={setWorkspaceTab}
                onEmergency={() => go('emergency')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-2xl bg-white px-4 py-3 shadow-glass"
        >
          <CheckCircle2 className="text-mint-600" size={18} />
          {t('saved_locally', language)}
        </motion.div>
      )}

      <FloatingAgentChat />
    </div>
  );
}
