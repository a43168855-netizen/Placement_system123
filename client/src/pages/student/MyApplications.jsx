import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Building2,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications({
        status: statusFilter,
        page,
        limit: 8,
      });
      setApplications(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Job Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor interview progression, shortlist outcomes, and recruiter remarks
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
          {['', 'pending', 'shortlisted', 'selected', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-md font-medium capitalize transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          description={
            statusFilter
              ? `You have no applications with status '${statusFilter}'.`
              : 'You have not submitted applications to any jobs yet.'
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Job Role & Company</th>
                  <th className="py-3.5 px-4">Package</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Recruiter Feedback</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{app.job?.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {app.job?.company?.name} • {app.job?.location}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(app.job?.salary)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(app.appliedDate)}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {app.recruiterRemarks ? (
                        <p className="text-[11px] text-slate-700 line-clamp-1 italic bg-amber-50/80 text-amber-900 px-2 py-1 rounded border border-amber-200/60">
                          "{app.recruiterRemarks}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No feedback yet</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => setSelectedApp(app)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={8}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Application Review Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Status & Feedback"
        size="md"
      >
        {selectedApp && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedApp.job?.title}</h4>
                  <p className="text-slate-600">{selectedApp.job?.company?.name}</p>
                </div>
                <Badge status={selectedApp.status} />
              </div>
              <p className="text-slate-500">
                Package: <strong>{formatCurrency(selectedApp.job?.salary)}</strong> • Applied on:{' '}
                {formatDate(selectedApp.appliedDate)}
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-slate-800 mb-1">Recruiter Evaluation & Feedback</h5>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                {selectedApp.recruiterRemarks ? (
                  <p className="italic">{selectedApp.recruiterRemarks}</p>
                ) : (
                  <p className="text-slate-400">Your application is currently under review by the talent acquisition team.</p>
                )}
              </div>
            </div>

            {selectedApp.coverLetter && (
              <div>
                <h5 className="font-semibold text-slate-800 mb-1">Your Submitted Cover Note</h5>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
