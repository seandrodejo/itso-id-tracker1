import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import nuLogo from '../assets/images/nu-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, appointmentAPI, Appointment } from '../src/config/api';

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation states for change password
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordTouched, setPasswordTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const navigateToPage = (page: string) => {
    const currentRoute = pathname || '/profile';
    
    if (page === 'dashboard' && currentRoute !== '/dashboard') {
      router.push('/dashboard');
    } else if (page === 'announcements' && currentRoute !== '/announcements') {
      router.push('/announcements');
    } else if (page === 'calendar' && currentRoute !== '/calendar') {
      router.push('/calendar');
    } else if (page === 'profile' && currentRoute !== '/profile') {
      router.push('/profile');
    }
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    // Reset validation states
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordTouched({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const handleHistoryPress = async () => {
    setShowHistoryModal(true);
    await fetchAppointments();
  };

  const closeHistoryModal = () => {
    setShowHistoryModal(false);
    setAppointments([]);
  };

  const fetchAppointments = async () => {
    if (!user?.id) return;
    
    try {
      setAppointmentsLoading(true);
      const userAppointments = await appointmentAPI.getUserAppointments(user.id);
      // Sort appointments by date (most recent first)
      const sortedAppointments = userAppointments.sort((a, b) => 
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      );
      setAppointments(sortedAppointments);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointment history. Please try again.');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Get status display info (same as dashboard)
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending-approval':
        return { 
          text: 'Pending Approval', 
          color: '#1e40af', 
          bgColor: '#dbeafe',
          icon: 'clock-outline',
          borderColor: '#1e40af'
        };
      case 'approved':
        return { 
          text: 'Approved', 
          color: '#059669', 
          bgColor: '#d1fae5',
          icon: 'checkmark-circle-outline',
          borderColor: '#059669'
        };
      case 'confirmed':
        return { 
          text: 'Confirmed', 
          color: '#059669', 
          bgColor: '#d1fae5',
          icon: 'checkmark-done-outline',
          borderColor: '#059669'
        };
      case 'in-progress':
        return { 
          text: 'In Progress', 
          color: '#7c3aed', 
          bgColor: '#ede9fe',
          icon: 'time-outline',
          borderColor: '#7c3aed'
        };
      case 'declined':
        return { 
          text: 'Declined', 
          color: '#dc2626', 
          bgColor: '#fef2f2',
          icon: 'close-circle-outline',
          borderColor: '#dc2626'
        };
      case 'to-claim':
        return { 
          text: 'To Claim', 
          color: '#059669', 
          bgColor: '#d1fae5',
          icon: 'gift-outline',
          borderColor: '#059669'
        };
      case 'for-printing':
        return { 
          text: 'For Printing', 
          color: '#f59e0b', 
          bgColor: '#fef3c7',
          icon: 'print-outline',
          borderColor: '#f59e0b'
        };
      case 'claimed':
        return { 
          text: 'Claimed', 
          color: '#059669', 
          bgColor: '#d1fae5',
          icon: 'checkmark-circle',
          borderColor: '#059669'
        };
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: '#dc2626', 
          bgColor: '#fee2e2',
          icon: 'close-circle-outline',
          borderColor: '#dc2626'
        };
      default:
        return { 
          text: status, 
          color: '#6b7280', 
          bgColor: '#f3f4f6',
          icon: 'information-circle-outline',
          borderColor: '#6b7280'
        };
    }
  };

  // Validation functions
  const validateCurrentPassword = (password: string) => {
    if (!password.trim()) return 'Current password is required';
    return '';
  };

  const validateNewPassword = (password: string) => {
    if (!password.trim()) return 'New password is required';
    if (password.trim().length < 6) return 'New password must be at least 6 characters';
    if (password.trim() === currentPassword.trim()) return 'New password cannot be the same as current password';
    return '';
  };

  const validateConfirmPassword = (password: string, newPassword: string) => {
    if (!password.trim()) return 'Please confirm your new password';
    if (password !== newPassword) return 'Passwords do not match';
    return '';
  };

  const handlePasswordFieldChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'currentPassword':
        setCurrentPassword(value);
        // If current password changes, re-validate new password and confirm password
        setTimeout(() => {
          if (passwordTouched.newPassword && newPassword) {
            const newPasswordError = validateNewPassword(newPassword);
            setPasswordErrors(prev => ({ ...prev, newPassword: newPasswordError }));
          }
          if (passwordTouched.confirmPassword && confirmPassword) {
            const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword);
            setPasswordErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError }));
          }
        }, 0);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Validate the field if it has been touched
    if (passwordTouched[field as keyof typeof passwordTouched]) {
      let error = '';
      switch (field) {
        case 'currentPassword':
          error = validateCurrentPassword(value);
          break;
        case 'newPassword':
          error = validateNewPassword(value);
          break;
        case 'confirmPassword':
          error = validateConfirmPassword(value, newPassword);
          break;
      }
      setPasswordErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handlePasswordFieldBlur = (field: string) => {
    setPasswordTouched(prev => ({ ...prev, [field]: true }));
    
    let error = '';
    switch (field) {
      case 'currentPassword':
        error = validateCurrentPassword(currentPassword);
        break;
      case 'newPassword':
        error = validateNewPassword(newPassword);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(confirmPassword, newPassword);
        break;
    }
    setPasswordErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAllPasswordFields = () => {
    const newErrors = {
      currentPassword: validateCurrentPassword(currentPassword),
      newPassword: validateNewPassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    };
    
    setPasswordErrors(newErrors);
    setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleChangePassword = async () => {
    if (!validateAllPasswordFields()) {
      return;
    }

    try {
      console.log('🔍 Attempting to change password...');
      console.log('Current password length:', currentPassword.length);
      console.log('New password length:', newPassword.length);
      
      const response = await authAPI.changePassword(currentPassword, newPassword);
      console.log('✅ Password change response:', response);
      
      Alert.alert(
        'Password Changed',
        'Your password has been successfully changed.',
        [{ text: 'OK', onPress: closeSettingsModal }]
      );
    } catch (error: any) {
      // Check for specific error messages
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (errorMessage.includes('Current password is incorrect')) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect',
          newPassword: '',
          confirmPassword: '',
        }));
      } else if (errorMessage.includes('New password must be at least 6 characters long')) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: 'New password must be at least 6 characters long',
          confirmPassword: '',
        }));
      } else if (errorMessage.includes('Current password and new password are required')) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is required',
          newPassword: 'New password is required',
          confirmPassword: '',
        }));
      } else {
        Alert.alert(
          'Error',
          `Failed to change password: ${errorMessage || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Failed to change password',
          newPassword: 'Failed to change password',
          confirmPassword: 'Failed to change password',
        }));
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔍 Starting logout process...');
              
              // Clear any open modals first
              setShowSettingsModal(false);
              setShowHistoryModal(false);
              
              // Clear form data
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordErrors({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setPasswordTouched({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
              });
              
              // Clear appointments data
              setAppointments([]);
              
              // Perform logout
              await logout();
              console.log('✅ Logout successful');
              
              // Navigate to login screen
              router.replace('/login');
              
            } catch (error) {
              // Show error alert but still redirect to login for security
              Alert.alert(
                'Logout Error',
                'There was an issue logging out, but you have been redirected to the login screen for security.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Force redirect to login even if logout failed
                      router.replace('/login');
                    }
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <LinearGradient
        colors={['#1e40af', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <View style={styles.logoContainer}>
          <Image source={nuLogo} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTitle}>NU Dasmarinas</Text>
            <Text style={styles.logoSubtitle}>ITSO ID Tracker</Text>
          </View>
        </View>
        <Text style={styles.greeting}>Hi, {user?.name || 'User'}!</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color="#1e40af" />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.personal_email || 'user@nu.edu.ph'}</Text>
          <Text style={styles.studentNumber}>Student ID: {user?.student_id || 'N/A'}</Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem} onPress={handleHistoryPress}>
            <Ionicons name="calendar-outline" size={24} color="#1e40af" />
            <Text style={styles.optionText}>Appointment History</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#1e40af" />
            <Text style={styles.optionText}>Settings</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSettingsModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={20}
            keyboardOpeningTime={0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity onPress={closeSettingsModal}>
                  <Ionicons name="close-outline" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.sectionLabel}>Change Password</Text>
                
                {/* Current Password */}
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  passwordErrors.currentPassword && passwordTouched.currentPassword && styles.passwordInputContainerError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={(value) => handlePasswordFieldChange('currentPassword', value)}
                    onBlur={() => handlePasswordFieldBlur('currentPassword')}
                    placeholder="Enter current password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {passwordErrors.currentPassword && passwordTouched.currentPassword && (
                  <Text style={styles.errorText}>{passwordErrors.currentPassword}</Text>
                )}

                {/* New Password */}
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  passwordErrors.newPassword && passwordTouched.newPassword && styles.passwordInputContainerError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={(value) => handlePasswordFieldChange('newPassword', value)}
                    onBlur={() => handlePasswordFieldBlur('newPassword')}
                    placeholder="Enter new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {passwordErrors.newPassword && passwordTouched.newPassword && (
                  <Text style={styles.errorText}>{passwordErrors.newPassword}</Text>
                )}

                {/* Confirm Password */}
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={[
                  styles.passwordInputContainer,
                  passwordErrors.confirmPassword && passwordTouched.confirmPassword && styles.passwordInputContainerError
                ]}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={(value) => handlePasswordFieldChange('confirmPassword', value)}
                    onBlur={() => handlePasswordFieldBlur('confirmPassword')}
                    placeholder="Confirm new password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
                {passwordErrors.confirmPassword && passwordTouched.confirmPassword && (
                  <Text style={styles.errorText}>{passwordErrors.confirmPassword}</Text>
                )}
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeSettingsModal}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Change Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* Appointment History Modal */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeHistoryModal}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalContainer}>
            <View style={styles.historyModalHeader}>
              <View style={styles.historyHeaderContent}>
                <Ionicons name="time-outline" size={24} color="#1e40af" />
                <Text style={styles.historyModalTitle}>Appointment History</Text>
              </View>
              <TouchableOpacity onPress={closeHistoryModal} style={styles.historyCloseButton}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.historyModalContent} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              bounces={true}
              scrollEventThrottle={16}
              removeClippedSubviews={false}
            >
              {appointmentsLoading ? (
                <View style={styles.historyLoadingContainer}>
                  <ActivityIndicator size="large" color="#1e40af" />
                  <Text style={styles.historyLoadingText}>Loading appointments...</Text>
                </View>
              ) : appointments.length === 0 ? (
                <View style={styles.historyEmptyContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                  <Text style={styles.historyEmptyTitle}>No Appointments Found</Text>
                  <Text style={styles.historyEmptySubtitle}>
                    You haven't made any appointments yet
                  </Text>
                </View>
              ) : (
                appointments.map((appointment, index) => (
                  <View 
                    key={appointment._id} 
                    style={[
                      styles.historyAppointmentCard,
                      { borderLeftColor: getStatusInfo(appointment.status).borderColor }
                    ]}
                  >
                    <View style={styles.historyAppointmentHeader}>
                      <View style={styles.historyAppointmentInfo}>
                        <Text style={styles.historyAppointmentDate}>
                          {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Text>
                        <Text style={styles.historyAppointmentTime}>
                          {appointment.appointmentStartTime} - {appointment.appointmentEndTime}
                        </Text>
                        <Text style={styles.historyAppointmentType}>
                          {appointment.type?.replace('-', ' ').toUpperCase() || 'ID Card Service'}
                        </Text>
                      </View>
                      
                      <View style={[styles.historyStatusBadge, { backgroundColor: getStatusInfo(appointment.status).bgColor }]}>
                        <Ionicons 
                          name={getStatusInfo(appointment.status).icon as any} 
                          size={14} 
                          color={getStatusInfo(appointment.status).color} 
                        />
                        <Text style={[styles.historyStatusText, { color: getStatusInfo(appointment.status).color }]}>
                          {getStatusInfo(appointment.status).text}
                        </Text>
                      </View>
                    </View>

                    {appointment.notes && (
                      <View style={styles.historyNotesContainer}>
                        <Text style={styles.historyNotesLabel}>Notes:</Text>
                        <Text style={styles.historyNotesText}>{appointment.notes}</Text>
                      </View>
                    )}

                    {appointment.adminRemarks && (
                      <View style={styles.historyAdminRemarksContainer}>
                        <Text style={styles.historyAdminRemarksLabel}>Admin Remarks:</Text>
                        <Text style={styles.historyAdminRemarksText}>{appointment.adminRemarks}</Text>
                      </View>
                    )}

                    <View style={styles.historyAppointmentFooter}>
                      <Text style={styles.historyCreatedDate}>
                        Created: {new Date(appointment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigateToPage('dashboard')}>
          <Ionicons name="home-outline" size={24} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage('announcements')}>
          <Ionicons name="notifications-outline" size={24} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage('calendar')}>
          <Ionicons name="calendar-outline" size={24} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage('profile')}>
          <Ionicons name="person" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eeeeeeff" },
  scrollContainer: { flex: 1, paddingHorizontal: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 80,
    paddingTop: 35,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 16,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 14,
  },
  greeting: { fontSize: 14, fontWeight: "600", color: "#ffffff", paddingTop: 35 },

  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  studentNumber: {
    fontSize: 12,
    color: "#64748b",
  },

  optionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e40af",
    flex: 1,
    marginLeft: 12,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
    marginLeft: 8,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalScrollView: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,       // match modalContent
    overflow: 'hidden',     // hide overflow on Android
  },
  modalScrollContent: {
  flexGrow: 1,
  justifyContent: 'flex-start', // was 'center'
  alignItems: 'center',
  paddingVertical: 30, // add spacing from top
},
modalContent: {
  backgroundColor: '#fff',
  borderRadius: 16,
  width: '100%',
  maxWidth: 400,
  paddingBottom: 10,
  overflow: 'hidden', // add breathing room at bottom
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e40af',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  passwordInputContainerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 8,
    marginLeft: 4,
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Appointment History Modal Styles
  historyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  historyModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.85,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    height: '95%',
    flex: 1,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  historyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginLeft: 12,
  },
  historyCloseButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Loading and Empty States
  historyLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  historyLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  historyEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  historyEmptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  historyEmptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Appointment Cards
  historyAppointmentCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyAppointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyAppointmentInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyAppointmentDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  historyAppointmentTime: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 4,
  },
  historyAppointmentType: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyNotesContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  historyNotesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  historyNotesText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  historyAdminRemarksContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  historyAdminRemarksLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  historyAdminRemarksText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
  },
  historyAppointmentFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  historyCreatedDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
});
