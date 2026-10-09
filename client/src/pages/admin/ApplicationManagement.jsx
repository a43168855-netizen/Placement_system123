import React, { useState, useEffect } from 'react';
import { applicationService } from '../../services/applicationService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Search,
  Building2,
  Edit,
  Eye,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Update Status Modal
  const [statusApp, setStatusApp] = useState(null);
  const [newStatus, setNewStatus] = useState('shortlisted');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  // View Details Modal
  const [viewApp, setViewApp] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAllApplications({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      setApplications(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, page]);

  const handleUpdateStatus = async () => {
    if (!statusApp) return;
    setUpdating(true);
    try {
      await applicationService.updateApplicationStatus(statusApp._id, newStatus, remarks);
      setToast({ message: 'Application status updated successfully!', type: 'success' });
      setStatusApp(null);
      fetchApplications();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {toast.message && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Application Registry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit campus-wide candidate submissions, review decisions, and manage interview progression
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search candidate name or job title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-44 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications recorded"
          description="No application records match your filter parameters."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Department & CGPA</th>
                  <th className="py-3.5 px-4">Job & Company</th>
                  <th className="py-3.5 px-4">Applied Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{app.student?.name}</p>
                      <p className="text-[11px] text-slate-500">{app.student?.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{app.studentProfile?.department}</p>
                      <p className="text-[11px] text-blue-600 font-bold">
                        CGPA: {app.studentProfile?.cgpa} / 10
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.job?.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {app.job?.company?.name} • {formatCurrency(app.job?.salary)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(app.appliedDate)}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {app.recruiterRemarks ? (
                        <p className="text-[11px] text-slate-700 line-clamp-1 italic">
                          "{app.recruiterRemarks}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No remarks</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewApp(app)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                        title="View Submission"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setStatusApp(app);
                          setNewStatus(app.status);
                          setRemarks(app.recruiterRemarks || '');
                        }}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded hover:bg-purple-50 cursor-pointer"
                        title="Override Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Decision / Status Modal */}
      <Modal
        isOpen={!!statusApp}
        onClose={() => setStatusApp(null)}
        title={`Update Status: ${statusApp?.student?.name}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recruiter / Placement Cell Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide interview notes or feedback..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setStatusApp(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              loading={updating}
              onClick={handleUpdateStatus}
            >
              Save Decision
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Application Modal */}
      <Modal
        isOpen={!!viewApp}
        onClose={() => setViewApp(null)}
        title="Application Details"
        size="md"
      >
        {viewApp && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-slate-900">{viewApp.student?.name}</span>
                <Badge status={viewApp.status} />
              </div>
              <p className="text-slate-500">{viewApp.student?.email} • Roll: {viewApp.studentProfile?.rollNo}</p>
              <p className="text-slate-700 font-semibold mt-1">
                Applying for: {viewApp.job?.title} at {viewApp.job?.company?.name}
              </p>
            </div>

            {viewApp.coverLetter && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Candidate Cover Letter</h4>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  {viewApp.coverLetter}
                </p>
              </div>
            )}

            {viewApp.recruiterRemarks && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Recruiter Remarks</h4>
                <p className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 italic">
                  "{viewApp.recruiterRemarks}"
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setViewApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
