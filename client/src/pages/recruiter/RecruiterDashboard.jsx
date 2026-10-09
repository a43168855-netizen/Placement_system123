import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Building2,
  PlusCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getRecruiterDashboard();
        setData(res?.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Failed to load recruiter dashboard: {error}
      </div>
    );
  }

  const { company, metrics, recentApplicants = [], jobs = [] } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Recruiter & Company Hero */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 font-bold text-xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {company?.name || 'Recruiter Portal'}
            </h1>
            <p className="text-purple-200 text-xs mt-1">
              {company?.location || 'Campus Recruitment'} • Industry:{' '}
              <span className="font-semibold text-white">{company?.industry || 'Technology'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/recruiter/company">
            <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              Manage Company
            </Button>
          </Link>
          <Link to="/recruiter/jobs/create">
            <Button size="sm" variant="primary" icon={PlusCircle} className="bg-white text-purple-900 hover:bg-purple-50">
              Post New Opening
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Openings"
          value={metrics?.activeJobs ?? 0}
          subtext={`Out of ${metrics?.totalJobs ?? 0} total postings`}
          icon={Briefcase}
          color="purple"
        />
        <StatCard
          title="Total Candidates"
          value={metrics?.totalApplicants ?? 0}
          subtext="Applications received"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Shortlisted"
          value={metrics?.shortlisted ?? 0}
          subtext="Advancing to technical rounds"
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Selected Offers"
          value={metrics?.selected ?? 0}
          subtext="Offers finalized"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Grid: Recent Applicants & Active Postings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applicants */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Recent Applicants
              </h2>
              <Link
                to="/recruiter/applicants"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Open ATS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplicants.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No candidate applications received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplicants.map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{app.student?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {app.studentProfile?.department} • CGPA:{' '}
                        <span className="font-semibold text-slate-700">{app.studentProfile?.cgpa}</span>
                      </p>
                      <p className="text-[10px] text-purple-700 font-medium">{app.job?.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge status={app.status} />
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(app.appliedDate)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recruiter Job Postings */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Your Job Postings
              </h2>
              <Link
                to="/recruiter/jobs"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                Manage All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                You haven't posted any jobs yet. Create your first opening!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <div key={job._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{job.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatCurrency(job.salary)} • Due {formatDate(job.deadline)}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Badge status={job.status} />
                      <Link to={`/recruiter/applicants?jobId=${job._id}`}>
                        <Button size="sm" variant="outline" className="text-xs py-1">
                          Applicants
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
