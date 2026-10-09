import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Award,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res?.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="cards" count={6} />;
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        Failed to load administration dashboard: {error}
      </div>
    );
  }

  const {
    metrics,
    applicationStatusCounts = {},
    departmentStats = [],
    recentApplications = [],
    recentJobs = [],
  } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Admin Director Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Campus Placement Cell
            </span>
            <span className="text-xs text-slate-400">AY 2025-2026</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Institutional Placement Overview
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time analytics on student eligibility, corporate drives, and overall placement outcomes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/admin/reports">
            <Button size="sm" variant="outline" icon={BarChart3} className="text-white border-white/20 hover:bg-white/10">
              Full Analytics Report
            </Button>
          </Link>
          <Link to="/admin/students">
            <Button size="sm" variant="primary" icon={Users}>
              Manage Students
            </Button>
          </Link>
        </div>
      </div>

      {/* Main KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Students"
          value={metrics?.totalStudents ?? 0}
          subtext={`${metrics?.placedStudents ?? 0} placed / ${metrics?.unplacedStudents ?? 0} unplaced`}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Placement Success Rate"
          value={`${metrics?.placementRate ?? 0}%`}
          trend={`${metrics?.placedStudents ?? 0} Placed`}
          subtext="Eligible students confirmed"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Partner Companies"
          value={metrics?.totalCompanies ?? 0}
          subtext={`${metrics?.totalRecruiters ?? 0} active corporate recruiters`}
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Total Job Openings"
          value={metrics?.totalJobs ?? 0}
          subtext={`${metrics?.activeJobs ?? 0} drives currently open`}
          icon={Briefcase}
          color="indigo"
        />
      </div>

      {/* Main KPI Cards Row 2 (Salary Stats & Applications) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Highest CTC Offered"
          value={formatCurrency(metrics?.highestPackage ?? 0)}
          subtext="Top campus offer"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Average CTC Package"
          value={formatCurrency(metrics?.avgPackage ?? 0)}
          subtext="Mean across all postings"
          icon={BarChart3}
          color="blue"
        />
        <StatCard
          title="Total Applications Filed"
          value={metrics?.totalApplications ?? 0}
          subtext={`${applicationStatusCounts.selected ?? 0} selected • ${applicationStatusCounts.shortlisted ?? 0} shortlisted`}
          icon={FileText}
          color="amber"
        />
      </div>

      {/* Department Breakdown & Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Placement Statistics Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Department-Wise Placement Statistics
            </h2>
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Export Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Registered</th>
                  <th className="py-2.5 px-3 text-center">Placed</th>
                  <th className="py-2.5 px-3 text-right">Placement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {departmentStats.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{dept.department}</td>
                    <td className="py-2.5 px-3 text-center">{dept.total}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{dept.placed}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${dept.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{dept.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Application Status Funnel */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Application Pipeline
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-900">Pending Review</span>
                  <p className="text-[10px] text-amber-700">Awaiting recruiter evaluation</p>
                </div>
                <span className="text-lg font-bold text-amber-900">
                  {applicationStatusCounts.pending ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-blue-900">Shortlisted for Rounds</span>
                  <p className="text-[10px] text-blue-700">In interview / assessment stage</p>
                </div>
                <span className="text-lg font-bold text-blue-900">
                  {applicationStatusCounts.shortlisted ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-emerald-900">Selected / Placed</span>
                  <p className="text-[10px] text-emerald-700">Offers extended & accepted</p>
                </div>
                <span className="text-lg font-bold text-emerald-900">
                  {applicationStatusCounts.selected ?? 0}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-rose-900">Rejected Candidates</span>
                  <p className="text-[10px] text-rose-700">Did not clear benchmark</p>
                </div>
                <span className="text-lg font-bold text-rose-900">
                  {applicationStatusCounts.rejected ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Applications & Active Drives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Applications */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Recent Applications
            </h2>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Applications <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentApplications.map((app) => (
              <div key={app._id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{app.student?.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {app.job?.title} at {app.job?.company?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge status={app.status} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(app.appliedDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Job Drives */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Latest Campus Drives
            </h2>
            <Link
              to="/admin/jobs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              All Jobs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentJobs.map((job) => (
              <div key={job._id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{job.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {job.company?.name} • <span className="font-semibold text-slate-700">{formatCurrency(job.salary)}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge status={job.status} />
                  <p className="text-[10px] text-slate-400 mt-0.5">{job.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
