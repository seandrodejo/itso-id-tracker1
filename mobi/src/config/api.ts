import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_BASE_URL } from './apiConfig';

// Export for backward compatibility
export const API_URL = API_BASE_URL;

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently handle token retrieval errors
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear stored token
      try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
      } catch (storageError) {
        // Silently handle storage clearing errors
      }
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface User {
  id: string;
  name: string;
  student_id: string;
  personal_email: string;
  role: 'student' | 'admin';
  googleId?: string;
  profilePicture?: string;
  isGoogleUser?: boolean;
  enrollment_status: 'enrolled' | 'registered' | 'not-enrolled';
  needsStudentIdUpdate?: boolean;
}

export interface CalendarClosure {
  _id: string;
  date: string;
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface Appointment {
  _id: string;
  userId: string;
  slotId?: string;
  type: string;
  pictureOption?: string;
  appointmentDate: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  notes: string;
  contactEmail: string;
  status: string;
  adminRemarks?: string;
  qrData?: string;
  checkinToken?: string;
  checkinTokenExpires?: string;
  lastScannedAt?: string;
  scannedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  _id: string;
  date: string;
  start: string;
  end: string;
  purpose: string;
  capacity: number;
  bookedCount: number;
  isEnrollmentHour: boolean;
  createdBy: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  images: string[];
  links: string[];
  tags: string[];
  isPublished: boolean;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdCard {
  _id: string;
  userId: string;
  appointmentId: string;
  status: 'CLAIMED' | 'RETURNED';
  issuedAt: string;
  returnedAt?: string;
  history: Array<{
    status: string;
    timestamp: string;
    by: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulingWindow {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  purpose: string;
  isActive: boolean;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IdCardStatus {
  status: 'NO_APPOINTMENT' | 'APPOINTMENT_CONFIRMED' | 'ID_READY' | 'ID_ISSUED' | 'APPOINTMENT_MISSED' | 'APPOINTMENT_CANCELLED' | 'ID_PROCESSING';
  message: string;
  appointment: Appointment | null;
  idCard: IdCard | null;
}

// Authentication API functions
export const authAPI = {
  // Login with email, student_id, and password
  login: async (email: string, student_id: string, password: string): Promise<LoginResponse> => {
    console.log('🌐 API Login called with:', { email, student_id, password });
    const response = await api.post('/auth/login', {
      email,
      student_id,
      password,
    });
    console.log('🌐 API Login response:', response.data);
    return response.data;
  },

  // Get user profile by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (personal_email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', {
      personal_email,
    });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (token: string): Promise<{ message: string; email: string }> => {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return response.data;
  },
};

// Appointment API functions
export const appointmentAPI = {
  // Get user's appointments
  getUserAppointments: async (userId: string): Promise<Appointment[]> => {
    const response = await api.get(`/appointments/user/${userId}`);
    return response.data;
  },

  // Get all appointments (admin only)
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Create new appointment
  createAppointment: async (appointmentData: {
    slotId?: string;
    purpose: string;
    notes?: string;
    type?: string;
    pictureOption?: string;
    status?: string;
    appointmentDate?: string;
    appointmentStartTime?: string;
    appointmentEndTime?: string;
    gmail: string; // Must be a valid Gmail address
  }): Promise<{ message: string; appointment: Appointment }> => {
    // Validate gmail format on client side
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!appointmentData.gmail || !gmailRegex.test(appointmentData.gmail)) {
      throw new Error('Please provide a valid Gmail address (example@gmail.com)');
    }
    
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.patch(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  // Update appointment (admin only)
  updateAppointment: async (appointmentId: string, updateData: {
    status?: string;
    adminRemarks?: string;
    statusUpdatedAt?: string;
    statusUpdatedBy?: string;
  }): Promise<{ message: string; appointment: Appointment }> => {
    const response = await api.patch(`/appointments/${appointmentId}`, updateData);
    return response.data;
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Generate QR code for appointment
  generateQR: async (appointmentId: string): Promise<{
    message: string;
    appointmentId: string;
    token: string;
    expires: string;
    payload: any;
    dataUrl: string;
  }> => {
    const response = await api.post(`/appointments/${appointmentId}/generate-qr`);
    return response.data;
  },

  // Scan QR code (admin only)
  scanQR: async (scanData: { ref: string; t: string; action: string }): Promise<{
    message: string;
    appointment: {
      id: string;
      status: string;
      lastScannedAt: string;
      scannedBy: string;
    };
  }> => {
    const response = await api.post('/appointments/scan', scanData);
    return response.data;
  },
};

// Slot/Calendar API functions
export const slotAPI = {
  // Get available slots
  getAvailableSlots: async (params?: {
    date?: string;
    purpose?: string;
  }): Promise<Slot[]> => {
    const response = await api.get('/slots/available', { params });
    return response.data;
  },

  // Get all slots (admin only)
  getAllSlots: async (): Promise<Slot[]> => {
    const response = await api.get('/slots/all');
    return response.data;
  },

  // Get slots in date range
  getSlotsInRange: async (params: {
    startDate: string;
    endDate: string;
    purpose?: string;
  }): Promise<Slot[]> => {
    const response = await api.get('/slots/range', { params });
    return response.data;
  },

  // Create slot (admin only)
  createSlot: async (slotData: {
    date: string;
    start: string;
    end: string;
    purpose: string;
    capacity?: number;
    isEnrollmentHour?: boolean;
  }): Promise<{ message: string; slot: Slot }> => {
    const response = await api.post('/slots', slotData);
    return response.data;
  },

  // Update slot (admin only)
  updateSlot: async (slotId: string, updateData: {
    date?: string;
    start?: string;
    end?: string;
    purpose?: string;
    capacity?: number;
    isEnrollmentHour?: boolean;
  }): Promise<{ message: string; slot: Slot }> => {
    const response = await api.put(`/slots/${slotId}`, updateData);
    return response.data;
  },

  // Delete slot (admin only)
  deleteSlot: async (slotId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/slots/${slotId}`);
    return response.data;
  },

  // Create default slots (admin only)
  createDefaultSlots: async (): Promise<{ message: string; slots: Slot[] }> => {
    const response = await api.post('/slots/create-defaults');
    return response.data;
  },
};

// Calendar Closure API functions
export const calendarClosureAPI = {
  // Get calendar closures for date range
  getClosures: async (params: {
    start?: string;
    end?: string;
    date?: string;
  }): Promise<CalendarClosure[]> => {
    const response = await api.get('/calendar-closures', { params });
    return response.data;
  },
};

// Announcement API functions
export const announcementAPI = {
  // Get published announcements
  getAnnouncements: async (params?: {
    q?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Announcement[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  // Get all announcements (admin only)
  getAllAnnouncements: async (params?: {
    q?: string;
    tag?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Announcement[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get('/announcements/all', { params });
    return response.data;
  },

  // Get announcement by ID
  getAnnouncement: async (announcementId: string): Promise<Announcement> => {
    const response = await api.get(`/announcements/${announcementId}`);
    return response.data;
  },

  // Get announcement by ID (admin only)
  getAnnouncementAdmin: async (announcementId: string): Promise<Announcement> => {
    const response = await api.get(`/announcements/admin/${announcementId}`);
    return response.data;
  },

  // Create announcement (admin only)
  createAnnouncement: async (announcementData: {
    title: string;
    content: string;
    images?: string[];
    links?: string[];
    tags?: string[];
    isPublished?: boolean;
  }): Promise<Announcement> => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  // Update announcement (admin only)
  updateAnnouncement: async (announcementId: string, updateData: {
    title?: string;
    content?: string;
    images?: string[];
    links?: string[];
    tags?: string[];
    isPublished?: boolean;
  }): Promise<Announcement> => {
    const response = await api.patch(`/announcements/${announcementId}`, updateData);
    return response.data;
  },

  // Delete announcement (admin only)
  deleteAnnouncement: async (announcementId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },

  // Upload image for announcement (admin only)
  uploadImage: async (imageData: FormData): Promise<{
    url: string;
    filename: string;
    mimetype: string;
    size: number;
  }> => {
    const response = await api.post('/announcements/upload-image', imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// ID Card API functions
export const idCardAPI = {
  // Get ID card status for current user
  getStatus: async (): Promise<IdCardStatus> => {
    const response = await api.get('/idcards/status');
    return response.data;
  },

  // Get ID card history for current user
  getHistory: async (): Promise<IdCard[]> => {
    const response = await api.get('/idcards/history');
    return response.data;
  },

  // Issue ID card (admin only)
  issueIdCard: async (appointmentId: string, userId?: string): Promise<{
    message: string;
    idCard: IdCard;
  }> => {
    const response = await api.post('/idcards/issue', { appointmentId, userId });
    return response.data;
  },

  // Mark ID card as returned (admin only)
  returnIdCard: async (idCardId: string): Promise<{
    message: string;
    idCard: IdCard;
  }> => {
    const response = await api.patch(`/idcards/${idCardId}/return`);
    return response.data;
  },
};

// Scheduling Window API functions
export const schedulingWindowAPI = {
  // Get all scheduling windows (admin only)
  getAllWindows: async (): Promise<SchedulingWindow[]> => {
    const response = await api.get('/scheduling-windows');
    return response.data;
  },

  // Get active scheduling windows
  getActiveWindows: async (): Promise<SchedulingWindow[]> => {
    const response = await api.get('/scheduling-windows/active');
    return response.data;
  },

  // Create scheduling window (admin only)
  createWindow: async (windowData: {
    name: string;
    startDate: string;
    endDate: string;
    purpose?: string;
    isActive?: boolean;
    description?: string;
  }): Promise<{
    message: string;
    window: SchedulingWindow;
  }> => {
    const response = await api.post('/scheduling-windows', windowData);
    return response.data;
  },

  // Update scheduling window (admin only)
  updateWindow: async (windowId: string, updateData: {
    name?: string;
    startDate?: string;
    endDate?: string;
    purpose?: string;
    isActive?: boolean;
    description?: string;
  }): Promise<{
    message: string;
    window: SchedulingWindow;
  }> => {
    const response = await api.put(`/scheduling-windows/${windowId}`, updateData);
    return response.data;
  },

  // Delete scheduling window (admin only)
  deleteWindow: async (windowId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/scheduling-windows/${windowId}`);
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Store auth token and user data
  storeAuthData: async (token: string, user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  },

  // Clear auth data
  clearAuthData: async (): Promise<void> => {
    try {
      console.log('🔍 API Utils: Clearing auth data from storage...');
      
      // Remove auth token
      await AsyncStorage.removeItem('authToken');
      console.log('✅ API Utils: Auth token removed');
      
      // Remove user data
      await AsyncStorage.removeItem('user');
      console.log('✅ API Utils: User data removed');
      
      // Remove any other auth-related data that might exist
      const keys = await AsyncStorage.getAllKeys();
      const authKeys = keys.filter(key => 
        key.includes('auth') || 
        key.includes('token') || 
        key.includes('user') ||
        key.includes('login')
      );
      
      if (authKeys.length > 0) {
        await AsyncStorage.multiRemove(authKeys);
        console.log('✅ API Utils: Additional auth keys removed:', authKeys);
      }
      
      console.log('✅ API Utils: All auth data cleared successfully');
    } catch (error) {
      throw error;
    }
  },

  // Get stored auth token
  getStoredToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  },

  // Get stored user data
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },
};

export default api;
