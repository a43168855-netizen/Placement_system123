import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import { formatDate } from '../../utils/formatters';
import {
  UserCheck,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Shield,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Add User Form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Password@123');
  const [newRole, setNewRole] = useState('student');

  // Edit User Form
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('student');
  const [editStatus, setEditStatus] = useState('active');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAllUsers({
        search,
        role: roleFilter,
        page,
        limit: 10,
      });
      setUsers(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.createUser({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setToast({ message: 'User account created successfully!', type: 'success' });
      setIsAddOpen(false);
      resetAdd();
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetAdd = () => {
    setNewName('');
    setNewEmail('');
    setNewPassword('Password@123');
    setNewRole('student');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await userService.updateUser(editingUser._id, {
        name: editName,
        role: editRole,
        status: editStatus,
      });
      setToast({ message: 'User updated successfully!', type: 'success' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await userService.deleteUser(deleteTarget._id);
      setToast({ message: 'User account removed', type: 'success' });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditRole(u.role || 'student');
    setEditStatus(u.status || 'active');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-rose-600" />;
      case 'recruiter':
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Users & Roles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage authenticated portal accounts, assign access tiers, and enforce access status
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          size="sm"
          onClick={() => setIsAddOpen(true)}
        >
          Add User
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
            placeholder="Search by user name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-44 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="recruiter">Recruiter</option>
          <option value="student">Student</option>
        </select>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No users found"
          description="No user accounts match the search criteria."
          actionLabel="Add User"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role Tier</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Registered On</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded hover:bg-purple-50 cursor-pointer"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete User"
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New User Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Edit User: ${editingUser?.name}`}
        size="md"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Portal Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User Account"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{deleteTarget?.name}</strong>?
            This will permanently remove the login account and dependent records.
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={saving}
              onClick={handleDeleteUser}
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
