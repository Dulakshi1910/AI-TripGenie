import apiClient from './api';

interface LoginResponse {
  success: boolean;
  token: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
    };
  };
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/user');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }
};


