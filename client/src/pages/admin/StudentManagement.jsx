import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Award,
  BookOpen,
  Filter,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
];

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);

  // Form states for Add Student
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newDepartment, setNewDepartment] = useState('Computer Science');
  const [newCgpa, setNewCgpa] = useState('8.0');
  const [newGradYear, setNewGradYear] = useState('2026');
  const [newSkills, setNewSkills] = useState('React, Node.js');

  // Form states for Edit Student
  const [editName, setEditName] = useState('');
  const [editCgpa, setEditCgpa] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPlacementStatus, setEditPlacementStatus] = useState('unplaced');
  const [editPlacedCompany, setEditPlacedCompany] = useState('');
  const [editPlacedPackage, setEditPlacedPackage] = useState('');

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAllStudents({
        search,
        department,
        placementStatus,
        page,
        limit: 10,
      });
      setStudents(res?.data || []);
      setPagination(res?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, placementStatus, page]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArr = newSkills.split(',').map((s) => s.trim()).filter(Boolean);
      await studentService.createStudent({
        name: newName,
        email: newEmail,
        rollNo: newRollNo,
        department: newDepartment,
        cgpa: parseFloat(newCgpa),
        graduationYear: Number(newGradYear),
        skills: skillsArr,
      });
      setToast({ message: 'Student registered successfully!', type: 'success' });
      setIsAddOpen(false);
      resetAddForm();
      fetchStudents();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
    setNewRollNo('');
    setNewDepartment('Computer Science');
    setNewCgpa('8.0');
    setNewGradYear('2026');
    setNewSkills('React, Node.js');
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setSaving(true);
    try {
      await studentService.updateStudent(editingStudent._id, {
        name: editName,
        cgpa: parseFloat(editCgpa),
        department: editDept,
        placementStatus: editPlacementStatus,
        placedCompany: editPlacedCompany,
        placedPackage: editPlacedPackage ? parseFloat(editPlacedPackage) : 0,
      });
      setToast({ message: 'Student details updated!', type: 'success' });
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await studentService.deleteStudent(deleteTarget._id);
      setToast({ message: 'Student removed from system', type: 'success' });
      setDeleteTarget(null);
      fetchStudents();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditName(student.user?.name || '');
    setEditCgpa(student.cgpa || '');
    setEditDept(student.department || 'Computer Science');
    setEditPlacementStatus(student.placementStatus || 'unplaced');
    setEditPlacedCompany(student.placedCompany || '');
    setEditPlacedPackage(student.placedPackage || '');
  };

  const openViewModal = async (student) => {
    try {
      const res = await studentService.getStudentById(student._id);
      setViewStudent(res?.data || { profile: student, applications: [] });
    } catch {
      setViewStudent({ profile: student, applications: [] });
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory & Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer student profiles, eligibility CGPA benchmarks, and official placement outcomes
          </p>
        </div>

        <Button
          variant="primary"
          icon={PlusCircle}
          size="sm"
          onClick={() => setIsAddOpen(true)}
        >
          Add Student Record
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
            placeholder="Search by name, email, roll number..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-52 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={placementStatus}
            onChange={(e) => {
              setPlacementStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize"
          >
            <option value="">All Placement States</option>
            <option value="unplaced">Unplaced</option>
            <option value="placed">Placed (Confirmed)</option>
            <option value="opted_out">Opted Out</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="No student records match the search keywords or filters."
          actionLabel="Add Student"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student & Roll No</th>
                  <th className="py-3.5 px-4">Department & Class</th>
                  <th className="py-3.5 px-4">CGPA</th>
                  <th className="py-3.5 px-4">Placement Status</th>
                  <th className="py-3.5 px-4">Placed Details</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{student.user?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {student.rollNo} • {student.user?.email}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{student.department}</p>
                      <p className="text-[11px] text-slate-500">
                        {student.course} • Class of {student.graduationYear}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      {student.cgpa} / 10
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={student.placementStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      {student.placementStatus === 'placed' ? (
                        <div>
                          <span className="font-semibold text-emerald-800 block">
                            {student.placedCompany || 'Partner Firm'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {formatCurrency(student.placedPackage)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">In Progress</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openViewModal(student)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 rounded hover:bg-purple-50 cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(student)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                        title="Delete Student"
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Student Record"
        size="md"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={newRollNo}
                onChange={(e) => setNewRollNo(e.target.value)}
                placeholder="23CS050"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={newCgpa}
                onChange={(e) => setNewCgpa(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={newGradYear}
                onChange={(e) => setNewGradYear(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Skills (Comma-separated)</label>
            <input
              type="text"
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" loading={saving} type="submit">
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title={`Edit Student: ${editingStudent?.user?.name}`}
        size="md"
      >
        <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Name</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={editCgpa}
                onChange={(e) => setEditCgpa(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Placement Status</label>
              <select
                value={editPlacementStatus}
                onChange={(e) => setEditPlacementStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="unplaced">Unplaced</option>
                <option value="placed">Placed</option>
                <option value="opted_out">Opted Out</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Placed Company</label>
              <input
                type="text"
                value={editPlacedCompany}
                onChange={(e) => setEditPlacedCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                value={editPlacedPackage}
                onChange={(e) => setEditPlacedPackage(e.target.value)}
                placeholder="24.5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditingStudent(null)}>
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
        title="Confirm Student Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to permanently remove{' '}
            <strong className="text-slate-900">{deleteTarget?.user?.name}</strong> (
            {deleteTarget?.rollNo})? This will delete their profile and associated applications.
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={saving}
              onClick={handleDeleteStudent}
              icon={Trash2}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Student Details Modal */}
      <Modal
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={`Student Profile: ${viewStudent?.profile?.user?.name}`}
        size="lg"
      >
        {viewStudent && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Roll No</span>
                <span className="font-bold text-slate-900">{viewStudent.profile?.rollNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Department</span>
                <span className="font-bold text-slate-900">{viewStudent.profile?.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">CGPA</span>
                <span className="font-bold text-slate-900">{viewStudent.profile?.cgpa} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Placement</span>
                <Badge status={viewStudent.profile?.placementStatus} />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">Technical Skills</h4>
              <div className="flex flex-wrap gap-1">
                {viewStudent.profile?.skills?.map((s, idx) => (
                  <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Application History ({viewStudent.applications?.length || 0})</h4>
              {viewStudent.applications?.length === 0 ? (
                <p className="text-slate-400 italic">No applications filed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {viewStudent.applications?.map((app) => (
                    <div key={app._id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{app.job?.title}</span>
                        <p className="text-[11px] text-slate-500">
                          {app.job?.company?.name} • {formatCurrency(app.job?.salary)}
                        </p>
                      </div>
                      <Badge status={app.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setViewStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
