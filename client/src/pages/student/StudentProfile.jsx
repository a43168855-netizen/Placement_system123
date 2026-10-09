import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import Button from '../../components/common/Button';
import ToastAlert from '../../components/common/ToastAlert';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency } from '../../utils/formatters';
import {
  User,
  GraduationCap,
  Award,
  Save,
  CheckCircle2,
  FileText,
  Phone,
  BookOpen,
} from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form states
  const [name, setName] = useState('');
  const [course, setCourse] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.5');
  const [skills, setSkills] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getMyProfile();
      const p = res?.data;
      if (p) {
        setProfile(p);
        setName(p.user?.name || '');
        setCourse(p.course || 'B.Tech');
        setDepartment(p.department || 'Computer Science');
        setGraduationYear(p.graduationYear || 2026);
        setCgpa(p.cgpa || 8.0);
        setSkills(Array.isArray(p.skills) ? p.skills.join(', ') : '');
        setResumeUrl(p.resumeUrl || '');
        setPhone(p.phone || '');
        setBio(p.bio || '');
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      await studentService.updateMyProfile({
        name,
        course,
        department,
        graduationYear: Number(graduationYear),
        cgpa: parseFloat(cgpa),
        skills: skillsArray,
        resumeUrl,
        phone,
        bio,
      });
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      fetchProfile();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic & Student Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your skills, CGPA, and resume updated to ensure eligibility for campus drives
          </p>
        </div>

        {profile?.placementStatus === 'placed' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold">
            <Award className="w-4 h-4 text-emerald-600" />
            Placed at {profile.placedCompany} ({formatCurrency(profile.placedPackage)})
          </div>
        )}
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {name ? name.charAt(0) : 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{name || 'Student Name'}</h2>
              <p className="text-xs text-slate-500">
                Roll No: <span className="font-semibold text-slate-800">{profile?.rollNo}</span> •{' '}
                {profile?.user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Degree</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Skills (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Node.js, Python, Docker, SQL"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resume URL / Portfolio Link
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://portfolio.me"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your academic achievements and career interests..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
