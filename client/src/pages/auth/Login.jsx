import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4 ring-8 ring-blue-500/10">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">PlacePro Portal</h2>
        <p className="mt-2 text-sm text-slate-400">
          Student Placement & Campus Recruitment Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Sign in to your account</h3>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* 1-Click Demo Accounts Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Demo Logins (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@placement.edu', 'AdminPassword@123')}
                className="p-2 text-left bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg border border-rose-200 transition-colors font-medium cursor-pointer"
              >
                <span className="block font-bold">Admin Director</span>
                <span className="text-[10px] text-rose-600 truncate block">admin@placement.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('recruiter@google.com', 'RecruiterPassword@123')}
                className="p-2 text-left bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg border border-purple-200 transition-colors font-medium cursor-pointer"
              >
                <span className="block font-bold">Recruiter (Google)</span>
                <span className="text-[10px] text-purple-600 truncate block">recruiter@google.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('student@placement.edu', 'StudentPassword@123')}
                className="p-2 text-left bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 transition-colors font-medium cursor-pointer"
              >
                <span className="block font-bold">Student (Aarav - CS)</span>
                <span className="text-[10px] text-blue-600 truncate block">student@placement.edu</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('ananya.patel@placement.edu', 'StudentPassword@123')}
                className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors font-medium cursor-pointer"
              >
                <span className="block font-bold">Student (Placed - IT)</span>
                <span className="text-[10px] text-emerald-600 truncate block">ananya.patel@...</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
