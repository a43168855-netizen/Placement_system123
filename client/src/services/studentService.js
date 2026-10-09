import api from './api';

export const studentService = {
  getAllStudents: async (params = {}) => {
    return await api.get('/students', { params });
  },

  getStudentById: async (id) => {
    return await api.get(`/students/${id}`);
  },

  createStudent: async (studentData) => {
    return await api.post('/students', studentData);
  },

  updateStudent: async (id, studentData) => {
    return await api.put(`/students/${id}`, studentData);
  },

  deleteStudent: async (id) => {
    return await api.delete(`/students/${id}`);
  },

  getMyProfile: async () => {
    return await api.get('/students/profile/me');
  },

  updateMyProfile: async (profileData) => {
    return await api.put('/students/profile/me', profileData);
  },
};
