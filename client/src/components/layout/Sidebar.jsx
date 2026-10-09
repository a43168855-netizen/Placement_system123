import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  UserCheck,
  BarChart3,
  PlusCircle,
  FileCheck2,
  User,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Students', path: '/admin/students', icon: Users },
          { name: 'Companies', path: '/admin/companies', icon: Building2 },
          { name: 'Job Listings', path: '/admin/jobs', icon: Briefcase },
          { name: 'Applications', path: '/admin/applications', icon: FileText },
          { name: 'User Access', path: '/admin/users', icon: UserCheck },
          { name: 'Placement Analytics', path: '/admin/reports', icon: BarChart3 },
        ];
      case 'recruiter':
        return [
          { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
          { name: 'My Job Listings', path: '/recruiter/jobs', icon: Briefcase },
          { name: 'Post New Job', path: '/recruiter/jobs/create', icon: PlusCircle },
          { name: 'Applicants (ATS)', path: '/recruiter/applicants', icon: Users },
          { name: 'Company Profile', path: '/recruiter/company', icon: Building2 },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Available Jobs', path: '/student/jobs', icon: Briefcase },
          { name: 'My Applications', path: '/student/applications', icon: FileCheck2 },
          { name: 'Academic Profile', path: '/student/profile', icon: User },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">PlacePro</span>
              <span className="block text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                Portal 2026
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role identification */}
        <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Portal Mode
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                user?.role === 'admin'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : user?.role === 'recruiter'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-200 mt-1 truncate">{user?.name}</p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
