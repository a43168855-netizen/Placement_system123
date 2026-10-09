import React from 'react';
import { getStatusBadgeColor, getStatusLabel } from '../../utils/formatters';

export default function Badge({ status, label, className = '' }) {
  const displayLabel = label || getStatusLabel(status);
  const colorClass = getStatusBadgeColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {displayLabel}
    </span>
  );
}
