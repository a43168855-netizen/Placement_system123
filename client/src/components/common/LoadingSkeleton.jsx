import React from 'react';

export default function LoadingSkeleton({ type = 'cards', count = 3 }) {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/4"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            <div className="h-8 bg-slate-100 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 bg-slate-200 rounded w-20"></div>
              <div className="w-9 h-9 rounded-lg bg-slate-100"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-16"></div>
            <div className="h-3 bg-slate-100 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-32 bg-slate-100 rounded-xl"></div>
      <div className="h-48 bg-slate-100 rounded-xl"></div>
    </div>
  );
}
