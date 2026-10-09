import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'recruiter') return '/recruiter/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-5 ring-8 ring-rose-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          You do not have the required permissions to view this resource. Your account role is{' '}
          <span className="font-semibold text-slate-800 uppercase">{user?.role || 'Guest'}</span>.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate(getHomePath())}
            className="w-full sm:w-auto"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
