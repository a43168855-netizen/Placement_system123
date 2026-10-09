import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import Button from '../../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-5 ring-8 ring-blue-50/50">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mt-1">Page Not Found</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          The requested page could not be found or may have been relocated.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
          >
            Return to Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
