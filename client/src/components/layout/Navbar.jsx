import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, User as UserIcon, Shield, Briefcase, GraduationCap } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'recruiter':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            <Briefcase className="w-3 h-3" /> Recruiter
          </span>
        );
      case 'student':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
      {/* Mobile Hamburger & Portal Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-800">
            Student Placement Management System
          </h2>
          <p className="text-[11px] text-slate-400">Campus Recruitment & Opportunities</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {getRoleBadge()}

        <div className="h-4 w-px bg-slate-200"></div>

        {/* User profile dropdown pill */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
