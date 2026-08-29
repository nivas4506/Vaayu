import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRound, HeartHandshake, Building2, BarChart3, ArrowRight, type LucideIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { t } from '../i18n';
import { UserRole } from '../types';
import { GlassCard, PrimaryButton, SectionHeading } from './ui';

const roles: { id: UserRole; icon: LucideIcon; nameKey: 'role_patient' | 'role_asha' | 'role_staff' | 'role_admin'; descKey: 'role_patient_desc' | 'role_asha_desc' | 'role_staff_desc' | 'role_admin_desc' }[] = [
  { id: 'patient', icon: UserRound, nameKey: 'role_patient', descKey: 'role_patient_desc' },
  { id: 'asha', icon: HeartHandshake, nameKey: 'role_asha', descKey: 'role_asha_desc' },
  { id: 'staff', icon: Building2, nameKey: 'role_staff', descKey: 'role_staff_desc' },
  { id: 'admin', icon: BarChart3, nameKey: 'role_admin', descKey: 'role_admin_desc' },
];

export default function RoleSelect({ onContinue }: { onContinue: (role: UserRole) => void }) {
  const { language, setRole } = useAppStore((s) => ({ language: s.language, setRole: s.setRole }));
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <SectionHeading title={t('who_are_you', language)} />
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((r) => {
          const active = selected === r.id;
          return (
            <motion.button
              key={r.id}
              onClick={() => setSelected(r.id)}
              whileHover={{ y: -3 }}
              animate={{ y: active ? -4 : 0 }}
              className="text-left"
            >
              <GlassCard strong={active} className={`flex items-start gap-4 p-5 transition-shadow ${active ? 'shadow-lift ring-2 ring-mint-500' : 'shadow-soft'}`}>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${active ? 'bg-mint-600 text-white' : 'bg-mint-100 text-mint-700'}`}>
                  <r.icon size={22} />
                </span>
                <div>
                  <p className="font-bold text-sage-900">{t(r.nameKey, language)}</p>
                  <p className="mt-1 text-sm text-sage-600">{t(r.descKey, language)}</p>
                </div>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-8 flex justify-end">
        <PrimaryButton
          disabled={!selected}
          className={!selected ? 'cursor-not-allowed opacity-40' : ''}
          onClick={() => { if (selected) { setRole(selected); onContinue(selected); } }}
        >
          {t('continue_', language)} <ArrowRight size={18} />
        </PrimaryButton>
      </div>
    </div>
  );
}
