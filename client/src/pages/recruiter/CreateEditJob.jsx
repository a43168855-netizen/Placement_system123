import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import Button from '../../components/common/Button';
import ToastAlert from '../../components/common/ToastAlert';
import { Save, ArrowLeft, Briefcase } from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
];

export default function CreateEditJob() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('Bengaluru, India');
  const [jobType, setJobType] = useState('Full-time');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [eligibleDepartments, setEligibleDepartments] = useState([
    'Computer Science',
    'Information Technology',
  ]);
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, Python');
  const [deadline, setDeadline] = useState('');
  const [openings, setOpenings] = useState('3');
  const [status, setStatus] = useState('active');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    if (isEditing) {
      const loadJob = async () => {
        try {
          const res = await jobService.getJobById(id);
          const job = res?.data;
          if (job) {
            setTitle(job.title || '');
            setDescription(job.description || '');
            setSalary(job.salary || '');
            setLocation(job.location || '');
            setJobType(job.jobType || 'Full-time');
            setMinCgpa(job.minCgpa || 0);
            setEligibleDepartments(job.eligibleDepartments || []);
            setRequiredSkills(
              Array.isArray(job.requiredSkills) ? job.requiredSkills.join(', ') : ''
            );
            if (job.deadline) {
              setDeadline(new Date(job.deadline).toISOString().split('T')[0]);
            }
            setOpenings(job.openings || 1);
            setStatus(job.status || 'active');
          }
        } catch (err) {
          setToast({ message: err.message, type: 'error' });
        } finally {
          setFetching(false);
        }
      };
      loadJob();
    } else {
      // Default deadline: 30 days from now
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      setDeadline(defaultDate);
    }
  }, [id, isEditing]);

  const toggleDepartment = (dept) => {
    if (eligibleDepartments.includes(dept)) {
      setEligibleDepartments(eligibleDepartments.filter((d) => d !== dept));
    } else {
      setEligibleDepartments([...eligibleDepartments, dept]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title,
        description,
        salary: Number(salary),
        location,
        jobType,
        minCgpa: Number(minCgpa),
        eligibleDepartments,
        requiredSkills: skillsArray,
        deadline: new Date(deadline),
        openings: Number(openings),
        status,
      };

      if (isEditing) {
        await jobService.updateJob(id, payload);
        setToast({ message: 'Job listing updated successfully!', type: 'success' });
      } else {
        await jobService.createJob(payload);
        setToast({ message: 'New job created and published!', type: 'success' });
      }

      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1000);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {toast.message && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/recruiter/jobs')}
          >
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? 'Edit Job Posting' : 'Create New Campus Drive'}
            </h1>
            <p className="text-xs text-slate-500">
              Provide role requirements, minimum eligibility criteria, and compensation package
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title / Position
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Graduate Software Engineer (Frontend)"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compensation / CTC (in LPA)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 18.5"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Office / Work Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Hybrid"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum CGPA Requirement
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                placeholder="e.g. 7.5"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Vacancies / Openings
              </label>
              <input
                type="number"
                min="1"
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="active">Active (Accepting Applications)</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="React, TypeScript, GraphQL, Docker"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Eligible Departments
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENT_OPTIONS.map((dept) => {
                const isSelected = eligibleDepartments.includes(dept);
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-400'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description & Responsibilities
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the day-to-day responsibilities, qualifications, and recruitment process..."
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/recruiter/jobs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={Save}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isEditing ? 'Save Changes' : 'Publish Job Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
