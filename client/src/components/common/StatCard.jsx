import React from 'react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'blue',
  trend,
}) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      ring: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      ring: 'border-emerald-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      ring: 'border-indigo-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      ring: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      ring: 'border-rose-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      ring: 'border-purple-100',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.bg} ${scheme.text}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtext || trend) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          {trend && (
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {trend}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
