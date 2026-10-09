import api from './api';

export const jobService = {
  getAllJobs: async (params = {}) => {
    return await api.get('/jobs', { params });
  },

  getJobById: async (id) => {
    return await api.get(`/jobs/${id}`);
  },

  createJob: async (jobData) => {
    return await api.post('/jobs', jobData);
  },

  updateJob: async (id, jobData) => {
    return await api.put(`/jobs/${id}`, jobData);
  },

  deleteJob: async (id) => {
    return await api.delete(`/jobs/${id}`);
  },
};
