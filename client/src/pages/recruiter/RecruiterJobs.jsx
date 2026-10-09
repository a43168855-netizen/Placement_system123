import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import ToastAlert from '../../components/common/ToastAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [deleteTargetJob, setDeleteTargetJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getAllJobs({ recruiter: user?._id });
      setJobs(res?.data || []);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteTargetJob) return;
    setDeleting(true);
    try {
      await jobService.deleteJob(deleteTargetJob._id);
      setToast({ message: 'Job listing deleted successfully', type: 'success' });
      setDeleteTargetJob(null);
      fetchJobs();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setDeleting(false);
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manage Job Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, update, and manage campus recruitment drives for your organization
          </p>
        </div>

        <Link to="/recruiter/jobs/create">
          <Button variant="primary" icon={PlusCircle} size="sm">
            Post New Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={4} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings found"
          description="You haven't posted any jobs for students yet. Post your first opening to start receiving applications."
          actionLabel="Create First Job"
          onAction={() => navigate('/recruiter/jobs/create')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Role Title</th>
                  <th className="py-3.5 px-4">Package & Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{job.title}</p>
                      <p className="text-[11px] text-slate-400">Min CGPA: {job.minCgpa || 'Open'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{formatCurrency(job.salary)}</p>
                      <p className="text-[11px] text-slate-500">{job.jobType}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{job.location}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(job.deadline)}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/recruiter/applicants?jobId=${job._id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md border border-purple-200 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {job.applicantCount ?? 0} Candidates
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={job.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <Link to={`/recruiter/jobs/edit/${job._id}`}>
                        <button className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteTargetJob(job)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetJob}
        onClose={() => setDeleteTargetJob(null)}
        title="Confirm Job Listing Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete the job listing{' '}
            <strong className="text-slate-900">{deleteTargetJob?.title}</strong>? All submitted student
            applications associated with this posting will also be removed.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" onClick={() => setDeleteTargetJob(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
              icon={Trash2}
            >
              Delete Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
