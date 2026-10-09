import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle2,
  Award,
  Briefcase,
  Building2,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStudentDashboard();
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
        Failed to load dashboard: {error}
      </div>
    );
  }

  const { profile, metrics, recentApplications = [], recentJobs = [] } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Student Profile Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 font-bold text-xl">
              {profile?.user?.name ? profile.user.name.charAt(0) : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Welcome, {profile?.user?.name || 'Student'}
                </h1>
                <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  {profile?.rollNo || 'ID: Active'}
                </span>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                {profile?.course} in {profile?.department} • CGPA:{' '}
                <span className="font-bold text-white">{profile?.cgpa || 'N/A'}</span> / 10 • Class of{' '}
                {profile?.graduationYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile?.placementStatus === 'placed' ? (
              <div className="bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 rounded-xl backdrop-blur-xs flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-[10px] text-emerald-200 uppercase font-semibold">Offer Accepted</p>
                  <p className="text-xs font-bold text-white">
                    {profile.placedCompany} ({formatCurrency(profile.placedPackage)})
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-xl backdrop-blur-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-medium text-blue-100">Actively Applying</span>
              </div>
            )}
            <Link to="/student/profile">
              <Button size="sm" variant="secondary" className="bg-white text-slate-800 hover:bg-blue-50">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={metrics?.totalApplications ?? 0}
          subtext="Applications submitted"
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Under Review"
          value={metrics?.pending ?? 0}
          subtext="Awaiting recruiter decision"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Shortlisted"
          value={metrics?.shortlisted ?? 0}
          subtext="Qualified for interview rounds"
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          title="Selected Offers"
          value={metrics?.selected ?? 0}
          subtext="Placement job offers"
          icon={Award}
          color="emerald"
        />
      </div>

      {/* Grid: Recent Applications & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                My Recent Applications
              </h2>
              <Link
                to="/student/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                You haven't submitted any job applications yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{app.job?.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {app.job?.company?.name} • {formatCurrency(app.job?.salary)}
                      </p>
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

        {/* Featured Openings */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Recommended Openings
              </h2>
              <Link
                to="/student/jobs"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Explore All ({metrics?.totalAvailableJobs || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active campus job listings currently open.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentJobs.slice(0, 4).map((job) => (
                  <div key={job._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{job.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {job.company?.name} • <span className="font-semibold text-slate-700">{formatCurrency(job.salary)}</span>
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {job.hasApplied ? (
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Applied
                        </span>
                      ) : (
                        <Link to={`/student/jobs`}>
                          <Button size="sm" variant="outline" className="text-xs py-1">
                            Details
                          </Button>
                        </Link>
                      )}
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
