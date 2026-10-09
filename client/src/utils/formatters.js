export const formatCurrency = (val) => {
  if (val === undefined || val === null) return 'N/A';
  return `₹${val} LPA`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'selected':
    case 'placed':
    case 'active':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
    case 'shortlisted':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20';
    case 'pending':
    case 'draft':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20';
    case 'rejected':
    case 'closed':
    case 'inactive':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20';
    case 'unplaced':
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20';
    default:
      return 'bg-gray-100 text-gray-700 ring-1 ring-gray-400/20';
  }
};

export const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};
