import api from './api';

export const companyService = {
  getAllCompanies: async (params = {}) => {
    return await api.get('/companies', { params });
  },

  getCompanyById: async (id) => {
    return await api.get(`/companies/${id}`);
  },

  createCompany: async (companyData) => {
    return await api.post('/companies', companyData);
  },

  updateCompany: async (id, companyData) => {
    return await api.put(`/companies/${id}`, companyData);
  },

  deleteCompany: async (id) => {
    return await api.delete(`/companies/${id}`);
  },

  getMyCompany: async () => {
    return await api.get('/companies/my-company');
  },
};
