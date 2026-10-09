import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { studentService } from '../../services/studentService';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Award,
  Users,
  Building2,
  TrendingUp,
  GraduationCap,
  FileCheck2,
} from 'lucide-react';

export default function PlacementReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        setData(res?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await studentService.getAllStudents({ limit: 1000 });
      const students = res?.data || [];

      let csv = 'Roll Number,Candidate Name,Email,Department,Degree,CGPA,Placement Status,Placed Company,Package (LPA)\n';
      students.forEach((s) => {
        csv += `"${s.rollNo}","${s.user?.name || ''}","${s.user?.email || ''}","${s.department}","${s.course}",${s.cgpa},"${s.placementStatus}","${s.placedCompany || 'N/A'}",${s.placedPackage || 0}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Campus_Placement_Report_AY2026_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={4} />;
  }

  const { metrics, departmentStats = [] } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Placement Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download verified accreditation data, branch conversion rates, and package distributions
          </p>
        </div>

        <Button
          variant="primary"
          icon={Download}
          size="sm"
          loading={exporting}
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Export CSV Report
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</p>
          <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{metrics?.placementRate ?? 0}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">{metrics?.placedStudents} of {metrics?.totalStudents} students placed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Compensation</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{formatCurrency(metrics?.highestPackage ?? 0)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Highest individual package</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Compensation</p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-1">{formatCurrency(metrics?.avgPackage ?? 0)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Campus wide mean CTC</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Drives</p>
          <h3 className="text-3xl font-extrabold text-purple-600 mt-1">{metrics?.totalJobs ?? 0}</h3>
          <p className="text-[11px] text-slate-500 mt-1">{metrics?.totalCompanies} participating companies</p>
        </div>
      </div>

      {/* Branch conversion breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          Branch & Department Conversion Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Branch / Department</th>
                <th className="py-3 px-4 text-center">Batch Size</th>
                <th className="py-3 px-4 text-center">Placed Count</th>
                <th className="py-3 px-4 text-center">Unplaced Count</th>
                <th className="py-3 px-4 text-right">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {departmentStats.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">{dept.total}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{dept.placed}</td>
                  <td className="py-3 px-4 text-center text-slate-500">{dept.total - dept.placed}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden hidden sm:block">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full"
                          style={{ width: `${dept.rate}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-slate-900">{dept.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
