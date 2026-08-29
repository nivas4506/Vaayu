import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { ServiceAvailabilityStatus } from '../types/index';

interface StatusBadgeProps {
  status: ServiceAvailabilityStatus | string;
  isStale?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isStale, size = 'md' }) => {
  if (isStale) {
    return (
      <span className="badge-pill badge-stale" title="Record is older than 48 hours and may need re-verification">
        <Clock size={size === 'sm' ? 12 : 14} />
        <span>STALE DATA (&gt;48h)</span>
      </span>
    );
  }

  const config = {
    AVAILABLE: {
      label: 'AVAILABLE',
      className: 'badge-available',
      icon: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
    },
    LIMITED: {
      label: 'LIMITED CAPACITY',
      className: 'badge-limited',
      icon: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
    },
    UNAVAILABLE: {
      label: 'UNAVAILABLE',
      className: 'badge-unavailable',
      icon: <XCircle size={size === 'sm' ? 12 : 14} />,
    },
  }[status as ServiceAvailabilityStatus] || {
    label: status,
    className: 'badge-pill',
    icon: null,
  };

  return (
    <span className={`badge-pill ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
