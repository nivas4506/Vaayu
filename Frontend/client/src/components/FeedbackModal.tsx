import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store';
import { t } from '../i18n';
import { FeedbackReport } from '../types';
import { GlassCard, PrimaryButton } from './ui';

const categories: { id: FeedbackReport['category']; key: 'cat_wrong_status' | 'cat_wrong_hours' | 'cat_missing_facility' | 'cat_medicine' | 'cat_staff' }[] = [
  { id: 'wrong_status', key: 'cat_wrong_status' },
  { id: 'wrong_hours', key: 'cat_wrong_hours' },
  { id: 'missing_facility', key: 'cat_missing_facility' },
  { id: 'medicine_shortage', key: 'cat_medicine' },
  { id: 'staff_absent', key: 'cat_staff' },
];

export default function FeedbackModal({ facilityId, serviceId, onClose }: { facilityId: string; serviceId?: string; onClose: () => void }) {
  const { language, role, addFeedback } = useAppStore((s) => ({ language: s.language, role: s.role, addFeedback: s.addFeedback }));
  const [category, setCategory] = useState<FeedbackReport['category'] | null>(null);
  const [description, setDescription] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!category) return;
    addFeedback({ facilityId, serviceId, category, description, reporterRole: role });
    setDone(true);
    setTimeout(onClose, 1600);
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-900/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()} className="w-full max-w-md"
        >
          <GlassCard strong className="rounded-t-3xl p-6 sm:rounded-3xl">
            {done ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="text-status-available" size={44} />
                <p className="mt-3 font-semibold text-sage-900">{t('feedback_success', language)}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-status-limited" size={20} />
                    <h3 className="font-bold text-sage-900">{t('is_info_wrong', language)}</h3>
                  </div>
                  <button onClick={onClose} className="tap-target rounded-full p-1 text-sage-500 hover:bg-sage-100"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-2">
                  {categories.map((c) => (
                    <button key={c.id} onClick={() => setCategory(c.id)}
                      className={`tap-target rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${category === c.id ? 'border-mint-500 bg-mint-50 text-mint-800' : 'border-sage-200 text-sage-700 hover:bg-sage-50'}`}>
                      {t(c.key, language)}
                    </button>
                  ))}
                </div>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('describe_issue', language)}
                  className="mt-4 w-full rounded-xl border border-sage-200 bg-white/70 p-3 text-sm text-sage-800 focus:border-mint-500 focus:outline-none focus:ring-2 focus:ring-mint-200"
                  rows={3}
                />
                <PrimaryButton className="mt-4 w-full" disabled={!category} onClick={handleSubmit}>
                  {t('submit', language)}
                </PrimaryButton>
              </>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
