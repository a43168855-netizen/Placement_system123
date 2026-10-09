import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import {
  Building2,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Briefcase,
  ExternalLink,
  MapPin,
  Globe,
} from 'lucide-react';

export default function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Add Form
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('Technology');
  const [newLocation, setNewLocation] = useState('Bengaluru, India');
  const [newWebsite, setNewWebsite] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await companyService.getAllCompanies({ search, page, limit: 10 });
      setCompanies(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, page]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await companyService.createCompany({
        name: newName,
        industry: newIndustry,
        location: newLocation,
        website: newWebsite,
        contactEmail: newContactEmail,
        description: newDescription,
      });
      setToast({ message: 'Company created successfully!', type: 'success' });
      setIsAddOpen(false);
      resetAdd();
      fetchCompanies();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetAdd = () => {
    setNewName('');
    setNewIndustry('Technology');
    setNewLocation('Bengaluru, India');
    setNewWebsite('');
    setNewContactEmail('');
    setNewDescription('');
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editingCompany) return;
    setSaving(true);
    try {
      await companyService.updateCompany(editingCompany._id, {
        name: editName,
        industry: editIndustry,
        location: editLocation,
        website: editWebsite,
        contactEmail: editContactEmail,
        description: editDescription,
      });
      setToast({ message: 'Company details updated!', type: 'success' });
      setEditingCompany(null);
      fetchCompanies();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await companyService.deleteCompany(deleteTarget._id);
      setToast({ message: 'Company removed from records', type: 'success' });
      setDeleteTarget(null);
      fetchCompanies();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (comp) => {
    setEditingCompany(comp);
    setEditName(comp.name || '');
    setEditIndustry(comp.industry || 'Technology');
    setEditLocation(comp.location || '');
    setEditWebsite(comp.website || '');
    setEditContactEmail(comp.contactEmail || '');
    setEditDescription(comp.description || '');
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Registered Companies & Recruiters</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage participating campus hiring partners, assigned recruiters, and active drives
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          size="sm"
          onClick={() => setIsAddOpen(true)}
        >
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search company name, location, or industry..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="No hiring companies found matching your search."
          actionLabel="Add Company"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Company Name</th>
                  <th className="py-3.5 px-4">Industry Sector</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Assigned Recruiter</th>
                  <th className="py-3.5 px-4">Active Postings</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{company.name}</p>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="w-3 h-3" />
                          {company.website.replace('https://', '')}
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{company.industry}</td>
                    <td className="py-3.5 px-4 text-slate-600">{company.location}</td>
                    <td className="py-3.5 px-4">
                      {company.recruiter ? (
                        <div>
                          <p className="font-semibold text-slate-900">{company.recruiter.name}</p>
                          <p className="text-[11px] text-slate-400">{company.recruiter.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {company.activeJobsCount ?? 0} Active Drives
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(company)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded hover:bg-purple-50 cursor-pointer"
                        title="Edit Company"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(company)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Company"
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

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Partner Company"
        size="md"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="campus@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Register Company
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        title={`Edit Company: ${editingCompany?.name}`}
        size="md"
      >
        <form onSubmit={handleUpdateCompany} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="url"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={editContactEmail}
                onChange={(e) => setEditContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingCompany(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Company Record"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
            All posted jobs and applications belonging to this company will also be removed.
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={saving}
              onClick={handleDeleteCompany}
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
