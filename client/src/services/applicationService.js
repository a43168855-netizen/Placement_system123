import api from './api';

export const applicationService = {
  applyForJob: async (jobId, coverLetter = '') => {
    return await api.post('/applications', { jobId, coverLetter });
  },

  getMyApplications: async (params = {}) => {
    return await api.get('/applications/my-applications', { params });
  },

  getAllApplications: async (params = {}) => {
    return await api.get('/applications', { params });
  },

  getJobApplications: async (jobId, params = {}) => {
    return await api.get(`/applications/job/${jobId}`, { params });
  },

  getRecruiterApplications: async (params = {}) => {
    return await api.get('/applications/recruiter', { params });
  },

  getApplicationById: async (id) => {
    return await api.get(`/applications/${id}`);
  },

  updateApplicationStatus: async (id, status, remarks = '') => {
    return await api.patch(`/applications/${id}/status`, { status, remarks });
  },
};
