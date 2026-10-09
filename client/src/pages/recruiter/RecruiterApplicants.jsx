import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { jobService } from '../../services/jobService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ToastAlert from '../../components/common/ToastAlert';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Award,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function RecruiterApplicants() {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Review modal
  const [inspectApp, setInspectApp] = useState(null);

  // Status update modal
  const [statusApp, setStatusApp] = useState(null);
  const [newStatus, setNewStatus] = useState('shortlisted');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Load recruiter's jobs for the dropdown filter
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await jobService.getAllJobs();
        setJobs(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadJobs();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getRecruiterApplications({
        jobId: selectedJobId,
        status: statusFilter,
        search,
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
  }, [selectedJobId, statusFilter, search, page]);

  const handleUpdateStatus = async () => {
    if (!statusApp) return;
    setUpdating(true);
    try {
      await applicationService.updateApplicationStatus(statusApp._id, newStatus, remarks);
      setToast({
        message: `Candidate status updated to '${newStatus.toUpperCase()}' successfully!`,
        type: 'success',
      });
      setStatusApp(null);
      setRemarks('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Applicant Tracking System (ATS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review candidate qualifications, evaluate skill profiles, and progress applicants
          </p>
        </div>
      </div>

      {/* Filters Bar */}
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
            placeholder="Search candidate name, email, or department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-56 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">All Job Listings</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white capitalize"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="There are no applicants matching your selected filters for your postings."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Academic Credentials</th>
                  <th className="py-3.5 px-4">Applied Job</th>
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
                      <p className="font-semibold text-slate-800">
                        CGPA: <span className="text-blue-600">{app.studentProfile?.cgpa || 'N/A'}</span> / 10
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {app.studentProfile?.department} • Roll: {app.studentProfile?.rollNo}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.job?.title}</p>
                      <p className="text-[10px] text-slate-400">Applied {formatDate(app.appliedDate)}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {app.recruiterRemarks ? (
                        <p className="text-[11px] text-slate-700 line-clamp-1 italic">
                          "{app.recruiterRemarks}"
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No remarks yet</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Eye}
                        onClick={() => setInspectApp(app)}
                      >
                        Profile
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          setStatusApp(app);
                          setNewStatus(app.status);
                          setRemarks(app.recruiterRemarks || '');
                        }}
                      >
                        Decide
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
            pageSize={10}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Candidate Profile Inspection Modal */}
      <Modal
        isOpen={!!inspectApp}
        onClose={() => setInspectApp(null)}
        title="Candidate Profile Review"
        size="lg"
      >
        {inspectApp && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                {inspectApp.student?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{inspectApp.student?.name}</h3>
                <p className="text-slate-600">
                  {inspectApp.student?.email} • Roll: {inspectApp.studentProfile?.rollNo}
                </p>
              </div>
              <Badge status={inspectApp.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Degree</span>
                <span className="font-bold text-slate-900">{inspectApp.studentProfile?.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Department</span>
                <span className="font-bold text-slate-900">{inspectApp.studentProfile?.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">CGPA</span>
                <span className="font-bold text-slate-900">{inspectApp.studentProfile?.cgpa} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Class of</span>
                <span className="font-bold text-slate-900">{inspectApp.studentProfile?.graduationYear}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {inspectApp.studentProfile?.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {inspectApp.studentProfile?.resumeUrl && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Resume Link</h4>
                <a
                  href={inspectApp.studentProfile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Candidate Resume
                </a>
              </div>
            )}

            {inspectApp.coverLetter && (
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Cover Note</h4>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  {inspectApp.coverLetter}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setInspectApp(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setStatusApp(inspectApp);
                  setNewStatus(inspectApp.status);
                  setRemarks(inspectApp.recruiterRemarks || '');
                  setInspectApp(null);
                }}
              >
                Update Decision
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Decision / Status Modal */}
      <Modal
        isOpen={!!statusApp}
        onClose={() => setStatusApp(null)}
        title={`Application Decision: ${statusApp?.student?.name}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Select a placement workflow outcome and provide recruiter remarks or interview feedback.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="pending">Pending Review</option>
              <option value="shortlisted">Shortlisted for Technical Rounds</option>
              <option value="selected">Selected / Offer Extended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recruiter Remarks / Interview Feedback
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared round 2 interview with 95% score. Offer extended."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleUpdateStatus}
            >
              Confirm Status Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
