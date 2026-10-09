import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Building2,
  Eye,
  Filter,
} from 'lucide-react';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Add Form
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('Bengaluru');
  const [jobType, setJobType] = useState('Full-time');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('React, Node.js');

  // Edit Form
  const [editTitle, setEditTitle] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMinCgpa, setEditMinCgpa] = useState('');
  const [editStatus, setEditStatus] = useState('active');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getAllJobs({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      setJobs(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, page]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await companyService.getAllCompanies({ limit: 50 });
        const list = res?.data || [];
        setCompanies(list);
        if (list.length > 0) setCompanyId(list[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    loadCompanies();

    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDeadline(future);
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArr = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await jobService.createJob({
        title,
        companyId,
        salary: Number(salary),
        location,
        jobType,
        minCgpa: Number(minCgpa),
        deadline: new Date(deadline),
        description,
        requiredSkills: skillsArr,
      });
      setToast({ message: 'Job listing created successfully!', type: 'success' });
      setIsAddOpen(false);
      resetAdd();
      fetchJobs();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetAdd = () => {
    setTitle('');
    setSalary('');
    setDescription('');
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editingJob) return;
    setSaving(true);
    try {
      await jobService.updateJob(editingJob._id, {
        title: editTitle,
        salary: Number(editSalary),
        location: editLocation,
        minCgpa: Number(editMinCgpa),
        status: editStatus,
      });
      setToast({ message: 'Job listing updated!', type: 'success' });
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await jobService.deleteJob(deleteTarget._id);
      setToast({ message: 'Job listing removed', type: 'success' });
      setDeleteTarget(null);
      fetchJobs();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setEditTitle(job.title || '');
    setEditSalary(job.salary || '');
    setEditLocation(job.location || '');
    setEditMinCgpa(job.minCgpa || 0);
    setEditStatus(job.status || 'active');
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Job Listings & Drives</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional job openings, recruitment criteria, and status
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          size="sm"
          onClick={() => setIsAddOpen(true)}
        >
          Post New Drive
        </Button>
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
            placeholder="Search role title, required skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job listings found"
          description="No drives match your search query."
          actionLabel="Post Drive"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Role Title & Company</th>
                  <th className="py-3.5 px-4">CTC Package</th>
                  <th className="py-3.5 px-4">Min CGPA</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Applications</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{job.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {job.company?.name} • {job.location}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(job.salary)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">
                      {job.minCgpa || 'Open'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(job.deadline)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {job.applicantCount ?? 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={job.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(job)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded hover:bg-purple-50 cursor-pointer"
                        title="Edit Drive"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(job)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Drive"
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* Add Job Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Post Campus Job Drive"
        size="md"
      >
        <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Partner Company</label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {companies.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Publish Drive
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title={`Edit Drive: ${editingJob?.title}`}
        size="md"
      >
        <form onSubmit={handleUpdateJob} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                value={editSalary}
                onChange={(e) => setEditSalary(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                value={editMinCgpa}
                onChange={(e) => setEditMinCgpa(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingJob(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Job Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Job Listing"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.title}</strong>?
            This will remove all candidate applications submitted for this job.
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={saving}
              onClick={handleDeleteJob}
              icon={Trash2}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
