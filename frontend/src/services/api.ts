import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface QRCodeData {
  id: string;
  shortId: string;
  title: string;
  targetUrl: string;
  qrCodeData: string;
  redirectUrl: string;
  clicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  hasLogo?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface QRResponse {
  message: string;
  qrCode: QRCodeData;
}

export interface QRListResponse {
  qrCodes: QRCodeData[];
}

export interface WiFiPortalData {
  portalId: string;
  slug: string;
  title: string;
  ssid: string;
  password?: string;
  security: string;
  instructions: string;
  qrCodeData: string;
  portalUrl: string;
  visits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WiFiPortalResponse {
  message: string;
  portal: WiFiPortalData;
}

export interface WiFiPortalListResponse {
  portals: WiFiPortalData[];
}

export const authAPI = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const qrAPI = {
  create: async (title: string, targetUrl: string, logoFile?: File, customShortId?: string): Promise<QRResponse> => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('targetUrl', targetUrl);
    if (logoFile) {
      formData.append('logo', logoFile);
    }
    if (customShortId) {
      formData.append('customShortId', customShortId);
    }

    const response = await api.post('/qr/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  checkShortId: async (shortId: string): Promise<{ available: boolean; message: string }> => {
    const response = await api.get(`/qr/check-shortid/${shortId}`);
    return response.data;
  },

  getMyCodes: async (): Promise<QRListResponse> => {
    const response = await api.get('/qr/my-codes');
    return response.data;
  },

  update: async (id: string, data: { title?: string; targetUrl?: string; isActive?: boolean }): Promise<QRResponse> => {
    const response = await api.put(`/qr/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/qr/${id}`);
    return response.data;
  }
};

export const wifiPortalAPI = {
  create: async (data: {
    title: string;
    slug: string;
    ssid: string;
    password: string;
    security?: string;
    instructions?: string;
  }): Promise<WiFiPortalResponse> => {
    const response = await api.post('/wifi-portal/create', data);
    return response.data;
  },

  checkSlug: async (slug: string): Promise<{ available: boolean; message?: string }> => {
    const response = await api.get(`/wifi-portal/check-slug/${slug}`);
    return response.data;
  },

  getMyPortals: async (): Promise<WiFiPortalListResponse> => {
    const response = await api.get('/wifi-portal/my-portals');
    return response.data;
  },

  getPortal: async (portalId: string): Promise<WiFiPortalResponse> => {
    const response = await api.get(`/wifi-portal/portal/${portalId}`);
    return response.data;
  },

  update: async (portalId: string, data: {
    title?: string;
    ssid?: string;
    password?: string;
    security?: string;
    instructions?: string;
    isActive?: boolean;
  }): Promise<WiFiPortalResponse> => {
    const response = await api.put(`/wifi-portal/portal/${portalId}`, data);
    return response.data;
  },

  delete: async (portalId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/wifi-portal/portal/${portalId}`);
    return response.data;
  }
};

export default api;