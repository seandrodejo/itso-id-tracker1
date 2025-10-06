// Example usage of the API in your React Native components
// This file shows how to use the API functions in your existing components

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { 
  authAPI, 
  appointmentAPI, 
  announcementAPI, 
  slotAPI,
  idCardAPI,
  schedulingWindowAPI,
  calendarClosureAPI,
  apiUtils,
  User,
  Appointment,
  Announcement,
  Slot,
  IdCard,
  SchedulingWindow,
  CalendarClosure,
  IdCardStatus
} from '../config/api';
import { API_CONFIG } from '../config/apiConfig';

// Example: Using the API in a component
export const ExampleAPIUsage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [idCardStatus, setIdCardStatus] = useState<IdCardStatus | null>(null);
  const [schedulingWindows, setSchedulingWindows] = useState<SchedulingWindow[]>([]);
  const [loading, setLoading] = useState(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await apiUtils.getStoredUser();
      const isAuth = await apiUtils.isAuthenticated();
      
      if (isAuth && storedUser) {
        setUser(storedUser);
        // Load user-specific data
        loadUserData(storedUser.id);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const loadUserData = async (userId: string) => {
    setLoading(true);
    try {
      // Load user's appointments
      const userAppointments = await appointmentAPI.getUserAppointments(userId);
      setAppointments(userAppointments);

      // Load announcements
      const announcementData = await announcementAPI.getAnnouncements({ limit: 10 });
      setAnnouncements(announcementData.items);

      // Load available slots for today
      const todayDate = new Date();
      const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
      const slots = await slotAPI.getAvailableSlots({ date: today });
      setAvailableSlots(slots);

      // Load ID card status
      const status = await idCardAPI.getStatus();
      setIdCardStatus(status);

      // Load active scheduling windows
      const windows = await schedulingWindowAPI.getActiveWindows();
      setSchedulingWindows(windows);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Example login function
  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await authAPI.login(
        'student@nu-dasma.edu.ph', // Replace with actual email
        '2024-12345', // Replace with actual student ID
        'password123' // Replace with actual password
      );

      // Store auth data
      await apiUtils.storeAuthData(response.token, response.user);
      setUser(response.user);
      
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Example logout function
  const handleLogout = async () => {
    try {
      await apiUtils.clearAuthData();
      setUser(null);
      setAppointments([]);
      setAnnouncements([]);
      setAvailableSlots([]);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Example: Create a new appointment
  const createAppointment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        slotId: availableSlots[0]?._id, // Use first available slot
        purpose: 'NEW_ID',
        notes: 'Requesting new ID card',
        gmail: 'student@gmail.com', // Replace with actual Gmail
        type: 'term-renewal',
        status: 'pending-approval'
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      Alert.alert('Success', 'Appointment created successfully!');
      
      // Refresh appointments
      const updatedAppointments = await appointmentAPI.getUserAppointments(user.id);
      setAppointments(updatedAppointments);
    } catch (error: any) {
      console.error('Create appointment error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  // Example: Get available slots for a specific date
  const getSlotsForDate = async (date: string) => {
    try {
      const slots = await slotAPI.getAvailableSlots({ 
        date,
        purpose: 'NEW_ID' 
      });
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  // Example: Check ID card status
  const checkIdCardStatus = async () => {
    try {
      const status = await idCardAPI.getStatus();
      setIdCardStatus(status);
      Alert.alert('ID Card Status', status.message);
    } catch (error) {
      console.error('Error checking ID card status:', error);
      Alert.alert('Error', 'Failed to check ID card status');
    }
  };

  // Example: Get ID card history
  const getIdCardHistory = async () => {
    try {
      const history = await idCardAPI.getHistory();
      Alert.alert('ID Card History', `Found ${history.length} ID card records`);
    } catch (error) {
      console.error('Error fetching ID card history:', error);
      Alert.alert('Error', 'Failed to fetch ID card history');
    }
  };

  // Example: Get active scheduling windows
  const getActiveSchedulingWindows = async () => {
    try {
      const windows = await schedulingWindowAPI.getActiveWindows();
      setSchedulingWindows(windows);
      Alert.alert('Scheduling Windows', `Found ${windows.length} active windows`);
    } catch (error) {
      console.error('Error fetching scheduling windows:', error);
      Alert.alert('Error', 'Failed to fetch scheduling windows');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        API Usage Example
      </Text>

      {!user ? (
        <View>
          <Text>Not logged in</Text>
          <Button title="Login" onPress={handleLogin} />
        </View>
      ) : (
        <View>
          <Text>Welcome, {user.name}!</Text>
          <Text>Student ID: {user.student_id}</Text>
          <Text>Email: {user.personal_email}</Text>
          <Text>Role: {user.role}</Text>
          
          <View style={{ marginTop: 20 }}>
            <Button title="Logout" onPress={handleLogout} />
            <Button title="Create Appointment" onPress={createAppointment} />
            <Button title="Check ID Status" onPress={checkIdCardStatus} />
            <Button title="ID History" onPress={getIdCardHistory} />
            <Button title="Scheduling Windows" onPress={getActiveSchedulingWindows} />
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Your Appointments:</Text>
            {appointments.map((apt) => (
              <Text key={apt._id}>
                {apt.type} - {apt.status} - {apt.appointmentDate}
              </Text>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Recent Announcements:</Text>
            {announcements.map((ann) => (
              <Text key={ann._id}>
                {ann.title} - {new Date(ann.createdAt).toLocaleDateString()}
              </Text>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Available Slots:</Text>
            {availableSlots.map((slot) => (
              <Text key={slot._id}>
                {slot.date} {slot.start}-{slot.end} ({slot.purpose})
              </Text>
            ))}
          </View>

          {idCardStatus && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: 'bold' }}>ID Card Status:</Text>
              <Text>Status: {idCardStatus.status}</Text>
              <Text>Message: {idCardStatus.message}</Text>
            </View>
          )}

          <View style={{ marginTop: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>Active Scheduling Windows:</Text>
            {schedulingWindows.map((window) => (
              <Text key={window._id}>
                {window.name} - {window.startDate} to {window.endDate}
              </Text>
            ))}
          </View>
        </View>
      )}

      {loading && <Text>Loading...</Text>}
    </View>
  );
};

// Example: Using the API in a custom hook
export const useAppointments = (userId: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await appointmentAPI.getUserAppointments(userId);
      setAppointments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: any) => {
    try {
      const response = await appointmentAPI.createAppointment(appointmentData);
      await loadAppointments(); // Refresh the list
      return response;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create appointment');
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.deleteAppointment(appointmentId);
      await loadAppointments(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [userId]);

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    cancelAppointment,
  };
};

// Example: Using the API in a custom hook for announcements
export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnnouncements = async (params?: { q?: string; tag?: string; page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await announcementAPI.getAnnouncements(params);
      setAnnouncements(data.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    loadAnnouncements,
  };
};

// Example: Using the API in a custom hook for ID card status
export const useIdCardStatus = () => {
  const [status, setStatus] = useState<IdCardStatus | null>(null);
  const [history, setHistory] = useState<IdCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await idCardAPI.getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ID card status');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await idCardAPI.getHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load ID card history');
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    history,
    loading,
    error,
    loadStatus,
    loadHistory,
  };
};
