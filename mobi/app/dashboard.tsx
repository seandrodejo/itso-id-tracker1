import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigationWithTransition } from "../hooks/useNavigationTransition";
import { LinearGradient } from 'expo-linear-gradient';
import nuLogo from '../assets/images/nu-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { appointmentAPI, Appointment } from '../src/config/api';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { BottomNavigation } from '../components/BottomNavigation';

export default function Dashboard() {
  const { navigateToPage, currentRoute } = useNavigationWithTransition();
  const { user, isAuthenticated, loading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Only redirect if we're not already on the login page
      if (currentRoute !== '/login') {
        navigateToPage('/login');
      }
    }
  }, [isAuthenticated, loading, currentRoute, navigateToPage]);

  // Fetch appointments when component mounts
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const userAppointments = await appointmentAPI.getUserAppointments(user?.id || '');
        setAppointments(userAppointments);
      } catch (error) {
        // Silently handle appointment fetch errors
      } finally {
        setAppointmentsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchAppointments();
    }
  }, [isAuthenticated, user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const userAppointments = await appointmentAPI.getUserAppointments(user?.id || '');
      setAppointments(userAppointments);
    } catch (error) {
      // Silently handle appointment fetch errors
    } finally {
      setRefreshing(false);
    }
  };

  // Get current and upcoming appointments
  const getCurrentAndUpcomingAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      appointmentDate.setHours(0, 0, 0, 0); // Start of appointment date
      
      // Include appointments that are today or in the future
      // Exclude only completed and cancelled appointments
      return appointmentDate >= today && 
             appointment.status !== 'CLAIMED' && 
             appointment.status !== 'cancelled' &&
             appointment.status !== 'completed';
    }).sort((a, b) => {
      // Sort by appointment date, latest first
      return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
    });
  };

  // Get the most recent/current appointment
  const getCurrentAppointment = () => {
    const currentAndUpcoming = getCurrentAndUpcomingAppointments();
    return currentAndUpcoming.length > 0 ? currentAndUpcoming[0] : null;
  };

  // Get status display info
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending-approval':
        return { 
          text: 'Pending Approval', 
          color: '#1e40af', 
          bgColor: '#dbeafe',
          icon: 'time-outline',
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

  const currentAndUpcomingAppointments = getCurrentAndUpcomingAppointments();
  const currentAppointment = getCurrentAppointment();

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

  // Navigation function is now provided by the hook

  // Generate current week dates
  const getCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = January
  
    // Get total days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
  
      monthDays.push({
        name: dayNames[date.getDay()],
        date: i,
        fullDate: date,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
  
    return monthDays;
  };

  const weekDays = getCurrentMonth();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <AnimatedScreen route="/dashboard" currentRoute={currentRoute}>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1e40af']}
              tintColor="#1e40af"
            />
          }
        >
        {/* Current Appointment Card */}
        <View style={styles.appointmentCard}>
          {appointmentsLoading ? (
            <ActivityIndicator size="large" color="#1e40af" />
          ) : currentAppointment ? (
            <>
              <View style={styles.currentAppointmentHeader}>
                <Ionicons 
                  name="calendar-outline" 
                  size={32} 
                  color="#1e40af" 
                />
                <Text style={styles.currentAppointmentTitle}>
                  Current Appointment
                </Text>
              </View>
              
              <View style={[styles.currentAppointmentDetails, { borderLeftColor: getStatusInfo(currentAppointment.status).borderColor }]}>
                <View style={styles.appointmentMainInfo}>
                  <Text style={styles.appointmentDateMain}>
                    {new Date(currentAppointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.appointmentTimeMain}>
                    {currentAppointment.appointmentStartTime} - {currentAppointment.appointmentEndTime}
                  </Text>
                  <Text style={styles.appointmentType}>
                    {currentAppointment.type?.replace('-', ' ').toUpperCase() || 'ID Card Service'}
                  </Text>
                </View>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusInfo(currentAppointment.status).bgColor }]}>
                  <Ionicons 
                    name={getStatusInfo(currentAppointment.status).icon as any} 
                    size={16} 
                    color={getStatusInfo(currentAppointment.status).color} 
                  />
                  <Text style={[styles.statusText, { color: getStatusInfo(currentAppointment.status).color }]}>
                    {getStatusInfo(currentAppointment.status).text}
                  </Text>
                </View>
              </View>

              {currentAppointment.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{currentAppointment.notes}</Text>
                </View>
              )}

              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={styles.viewCalendarButton}
                  onPress={() => navigateToPage('/calendar')}
                >
                  <Ionicons name="calendar-outline" size={16} color="#1e40af" />
                  <Text style={styles.viewCalendarButtonText}>View Calendar</Text>
                </TouchableOpacity>
                
                {currentAndUpcomingAppointments.length > 1 && (
                  <TouchableOpacity 
                    style={styles.bookAnotherButton}
                    onPress={() => navigateToPage('/calendar')}
                  >
                    <Text style={styles.bookAnotherButtonText}>Book Another</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.noAppointmentHeader}>
                <MaterialIcons
                  name="event-note"
                  size={48}
                  color="#94a3b8"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.noAppointmentTitle}>
                  No Current Appointments
                </Text>
                <Text style={styles.noAppointmentSubtitle}>
                  Book an appointment to get started with your ID card services
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.bookButton}
                onPress={() => navigateToPage('/calendar')}
              >
                <Ionicons name="add-outline" size={20} color="#000" />
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <Text style={styles.calendarSectionTitle}>Your Calendar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.calendarRow}
            contentContainerStyle={styles.calendarRowContent}
          >
            {weekDays.map((day, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text style={styles.dayLabel}>{day.name}</Text>
                <View
                  style={[
                    styles.dateCircle,
                    day.isToday && styles.dateCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      day.isToday && styles.dateTextActive,
                    ]}
                  >
                    {day.date}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureRow}>
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateToPage('/announcements')}
          >
            <Ionicons name="notifications-outline" size={28} color="#1e40af" />
            <Text style={styles.featureTitle}>Announcements</Text>
            <Text style={styles.featureSubtitle}>Check new ITSO updates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigateToPage('/calendar')}
          >
            <Ionicons name="calendar-outline" size={28} color="#1e40af" />
            <Text style={styles.featureTitle}>Calendar</Text>
            <Text style={styles.featureSubtitle}>
              Schedule an appointment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Important Updates */}
        <TouchableOpacity 
          style={styles.updateCard}
          onPress={() => navigateToPage('/announcements')}
        >
          <Text style={styles.updateTitle}>
            Important updates from ITSO
          </Text>
          <Text style={styles.updateSubtitle}>
            description for the announcement is place here
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color="#1e40af"
            style={{ position: "absolute", right: 12, top: 16 }}
          />
        </TouchableOpacity>
        </ScrollView>
        </AnimatedScreen>
      </View>

      {/* Bottom Navigation - Always present and unaffected by animations */}
      <BottomNavigation currentRoute={currentRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eeeeeeff" },
  contentContainer: { flex: 1 },
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

  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginTop: 12,
    minHeight: 200,
  },

  // Current appointment styles
  currentAppointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currentAppointmentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e40af",
    marginLeft: 12,
  },
  currentAppointmentDetails: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  appointmentMainInfo: {
    marginBottom: 12,
  },
  appointmentDateMain: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  appointmentTimeMain: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  notesContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
    justifyContent: "center",
  },
  viewCalendarButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e40af",
    marginLeft: 6,
  },
  bookAnotherButton: {
    backgroundColor: "#facc15",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  bookAnotherButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },

  // No appointment styles
  noAppointmentHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  noAppointmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  noAppointmentSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
  },
  bookButton: {
    backgroundColor: "#facc15",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignSelf: "center",
  },
  bookButtonText: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#000",
    marginLeft: 6,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  calendarSection: { marginTop: 20, marginHorizontal: -16 },
  calendarSectionTitle: { fontSize: 23, fontWeight: "500", marginTop: 0, marginBottom: 10, paddingHorizontal: 16 },
  calendarRow: { flexDirection: "row" },
  calendarRowContent: { paddingLeft: 16, paddingRight: 0, alignItems: "center", flexGrow: 0 },
  calendarDay: { alignItems: "center", marginRight: 16 },
  dayLabel: { fontSize: 12, color: "#475569", marginBottom: 4 },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
  },
  dateCircleActive: { backgroundColor: "#1e40af" },
  dateText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  dateTextActive: { color: "#fff" },

  featureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  featureCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  featureTitle: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  featureSubtitle: { fontSize: 12, color: "#64748b" },

  updateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  updateTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  updateSubtitle: { fontSize: 12, color: "#64748b" },

});
