import api from './api';

export const dashboardService = {
  getAdminDashboard: async () => {
    return await api.get('/dashboard/admin');
  },

  getStudentDashboard: async () => {
    return await api.get('/dashboard/student');
  },

  getRecruiterDashboard: async () => {
    return await api.get('/dashboard/recruiter');
  },
};
