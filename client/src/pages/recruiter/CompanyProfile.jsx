import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import Button from '../../components/common/Button';
import ToastAlert from '../../components/common/ToastAlert';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Building2, Save, Globe, MapPin, Mail, Briefcase } from 'lucide-react';

export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await companyService.getMyCompany();
      const comp = res?.data;
      if (comp) {
        setCompany(comp);
        setName(comp.name || '');
        setDescription(comp.description || '');
        setWebsite(comp.website || '');
        setLocation(comp.location || '');
        setIndustry(comp.industry || 'Technology');
        setContactEmail(comp.contactEmail || '');
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    try {
      await companyService.updateCompany(company._id, {
        name,
        description,
        website,
        location,
        industry,
        contactEmail,
      });
      setToast({ message: 'Company profile updated successfully!', type: 'success' });
      fetchCompany();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {toast.message && (
        <ToastAlert
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Organization & Recruiter Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Information displayed to candidates when browsing your campus postings
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{name || 'Company Profile'}</h2>
              <p className="text-xs text-slate-500">{industry} • {location}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Cloud & AI, FinTech, E-Commerce"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="campus-hiring@company.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location / Headquarters</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bengaluru / Hyderabad"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Overview</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of the company culture, mission, and products..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
              icon={Save}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Company Info
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
