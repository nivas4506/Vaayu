import React from 'react';
import { motion } from 'framer-motion';
import { AvailabilityStatus } from '../types';
import { UserLanguage } from '../types';
import { t } from '../i18n';

export function GlassCard({ children, className = '', strong = false, ...rest }: React.HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div className={`${strong ? 'glass-strong' : 'glass'} rounded-3xl shadow-glass ${className}`} {...rest}>
      {children}
    </div>
  );
}

type ButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'>;

export function PrimaryButton({ children, className = '', ...rest }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(30,60,45,0.20)' }}
      whileTap={{ scale: 0.97 }}
      className={`tap-target inline-flex items-center justify-center gap-2 rounded-2xl bg-mint-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition-colors hover:bg-mint-700 ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({ children, className = '', ...rest }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`tap-target glass inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-base font-semibold text-sage-800 shadow-soft ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}

const statusStyles: Record<AvailabilityStatus, { bg: string; dot: string; label: (l: UserLanguage) => string }> = {
  available: { bg: 'bg-status-available/10 text-status-available', dot: 'bg-status-available', label: (l) => t('status_available', l) },
  limited: { bg: 'bg-status-limited/10 text-status-limited', dot: 'bg-status-limited', label: (l) => t('status_limited', l) },
  unavailable: { bg: 'bg-status-unavailable/10 text-status-unavailable', dot: 'bg-status-unavailable', label: (l) => t('status_unavailable', l) },
  unknown: { bg: 'bg-status-unknown/10 text-status-unknown', dot: 'bg-status-unknown', label: (l) => t('status_unknown', l) },
};

export function StatusBadge({ status, lang, pulse = false }: { status: AvailabilityStatus; lang: UserLanguage; pulse?: boolean }) {
  const s = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${s.bg}`}>
      <span className={`h-2 w-2 rounded-full ${s.dot} ${pulse ? 'animate-pulseSoft' : ''}`} />
      {s.label(lang)}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-mint-600">{eyebrow}</p>}
      <h2 className="text-2xl font-bold text-sage-900 sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-base text-sage-700">{sub}</p>}
    </div>
  );
}

export const pageTransition = {
  initial: { opacity: 0, y: 16, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.99 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};
