import { create } from 'zustand';
import { UserRole, ServiceAvailabilityStatus, OfflineOutboxItem } from '../types/index';
import { syncOfflineOutbox } from '../../../api/availability';

const OUTBOX_STORAGE_KEY = 'vaayu_offline_outbox';

const getInitialOutbox = (): OfflineOutboxItem[] => {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

interface AppState {
  currentRole: UserRole;
  isOnline: boolean;
  selectedPincode: string;
  selectedServiceId: string;
  offlineOutbox: OfflineOutboxItem[];
  isSyncing: boolean;
  syncSuccessMessage: string | null;

  setRole: (role: UserRole) => void;
  setOnline: (online: boolean) => void;
  setPincode: (pincode: string) => void;
  setServiceId: (serviceId: string) => void;
  enqueueOfflineItem: (item: Omit<OfflineOutboxItem, 'id' | 'timestamp'>) => void;
  syncOutbox: () => Promise<void>;
  clearOutbox: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'PATIENT',
  isOnline: true,
  selectedPincode: '482002',
  selectedServiceId: '',
  offlineOutbox: getInitialOutbox(),
  isSyncing: false,
  syncSuccessMessage: null,

  setRole: (role) => set({ currentRole: role }),

  setOnline: (online) => {
    set({ isOnline: online });
    if (online && get().offlineOutbox.length > 0) {
      get().syncOutbox();
    }
  },

  setPincode: (pincode) => set({ selectedPincode: pincode }),
  setServiceId: (serviceId) => set({ selectedServiceId: serviceId }),

  enqueueOfflineItem: (item) => {
    const newItem: OfflineOutboxItem = {
      ...item,
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [...get().offlineOutbox, newItem];
    try {
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error saving offline outbox:', e);
    }
    set({ offlineOutbox: updated });
  },

  syncOutbox: async () => {
    const { offlineOutbox, currentRole } = get();
    if (offlineOutbox.length === 0) return;

    set({ isSyncing: true, syncSuccessMessage: null });
    try {
      await syncOfflineOutbox(offlineOutbox, `usr_${currentRole.toLowerCase()}`);
      localStorage.removeItem(OUTBOX_STORAGE_KEY);
      set({
        offlineOutbox: [],
        isSyncing: false,
        syncSuccessMessage: `Successfully synchronized ${offlineOutbox.length} offline update(s) with health server!`,
      });
      setTimeout(() => set({ syncSuccessMessage: null }), 5000);
    } catch (err) {
      console.error('Failed to sync offline outbox:', err);
      set({ isSyncing: false });
    }
  },

  clearOutbox: () => {
    localStorage.removeItem(OUTBOX_STORAGE_KEY);
    set({ offlineOutbox: [] });
  },
}));
