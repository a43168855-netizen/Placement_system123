import React, { useState, useEffect } from 'react';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { studentService } from '../../services/studentService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import ToastAlert from '../../components/common/ToastAlert';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';

export default function AvailableJobs() {
  const [jobs, setJobs] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Selected job for Application modal
  const [applyingJob, setApplyingJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected job for View Details modal
  const [detailsJob, setDetailsJob] = useState(null);

  // Feedback toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobsRes, profileRes] = await Promise.all([
        jobService.getAllJobs({ search, location: locationFilter }),
        studentService.getMyProfile(),
      ]);
      setJobs(jobsRes?.data || []);
      setStudentProfile(profileRes?.data || null);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, locationFilter]);

  const handleApply = async () => {
    if (!applyingJob) return;

    setSubmitting(true);
    try {
      await applicationService.applyForJob(applyingJob._id, coverLetter);
      setToast({
        message: `Successfully applied to ${applyingJob.title} at ${applyingJob.company?.name}!`,
        type: 'success',
      });
      setApplyingJob(null);
      setCoverLetter('');
      // Refresh job listings to reflect applied status
      fetchJobs();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const isEligible = (job) => {
    if (!studentProfile) return { eligible: true };
    if (job.minCgpa && studentProfile.cgpa < job.minCgpa) {
      return {
        eligible: false,
        reason: `Min CGPA required is ${job.minCgpa} (Your CGPA: ${studentProfile.cgpa})`,
      };
    }
    if (
      job.eligibleDepartments &&
      job.eligibleDepartments.length > 0 &&
      !job.eligibleDepartments.includes(studentProfile.department)
    ) {
      return {
        eligible: false,
        reason: `Eligible branches: ${job.eligibleDepartments.join(', ')}`,
      };
    }
    if (new Date(job.deadline) < new Date()) {
      return {
        eligible: false,
        reason: 'Application deadline has passed',
      };
    }
    return { eligible: true };
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast */}
      {toast.message && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus Job Openings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore verified corporate placement opportunities open for your cohort
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, skills, company..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="relative w-full sm:w-44">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter location..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={6} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No open jobs match your criteria"
          description="Try modifying your search keywords or clearing location filters to view all openings."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setLocationFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => {
            const eligibility = isEligible(job);
            const hasApplied = job.hasApplied;

            return (
              <div
                key={job._id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {job.jobType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job.company?.name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        {formatCurrency(job.salary)}
                      </span>
                      <span className="text-[10px] text-slate-400">CTC Package</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skills badges */}
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Clock className="w-3 h-3" /> Due {formatDate(job.deadline)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Min CGPA: <strong>{job.minCgpa || 'None'}</strong></span>
                      <span>Openings: <strong>{job.openings}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailsJob(job)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                  >
                    View Details
                  </button>

                  {hasApplied ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied ({job.appliedStatus})
                    </span>
                  ) : !eligibility.eligible ? (
                    <span
                      title={eligibility.reason}
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 cursor-help"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Not Eligible
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setApplyingJob(job)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={!!applyingJob}
        onClose={() => setApplyingJob(null)}
        title={`Apply for ${applyingJob?.title}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <p>
              <strong>Company:</strong> {applyingJob?.company?.name}
            </p>
            <p>
              <strong>Package:</strong> {formatCurrency(applyingJob?.salary)}
            </p>
            <p>
              <strong>Candidate Roll No:</strong> {studentProfile?.rollNo} ({studentProfile?.department})
            </p>
            <p>
              <strong>Current CGPA:</strong> {studentProfile?.cgpa} / 10
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Note / Why are you a good fit? (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Highlight relevant projects, coursework, or certifications..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setApplyingJob(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={submitting}
              onClick={handleApply}
              icon={CheckCircle2}
            >
              Confirm & Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={!!detailsJob}
        onClose={() => setDetailsJob(null)}
        title={detailsJob?.title || 'Job Details'}
        size="lg"
      >
        {detailsJob && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Company</span>
                <span className="font-bold text-slate-900">{detailsJob.company?.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Package</span>
                <span className="font-bold text-slate-900">{formatCurrency(detailsJob.salary)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Location</span>
                <span className="font-bold text-slate-900">{detailsJob.location}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Deadline</span>
                <span className="font-bold text-slate-900">{formatDate(detailsJob.deadline)}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Job Description</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{detailsJob.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Eligibility Criteria</h4>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Minimum CGPA: {detailsJob.minCgpa || 'No minimum threshold'}</li>
                <li>
                  Eligible Departments:{' '}
                  {detailsJob.eligibleDepartments?.length > 0
                    ? detailsJob.eligibleDepartments.join(', ')
                    : 'Open to all departments'}
                </li>
                <li>Job Type: {detailsJob.jobType}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {detailsJob.requiredSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setDetailsJob(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
