import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Animated,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import nuLogo from '../assets/images/nu-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { slotAPI, Slot, appointmentAPI, calendarClosureAPI, CalendarClosure } from '../src/config/api';

export default function Calendar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

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
  
  // State for current date and selected date
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // API data state
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [closures, setClosures] = useState<CalendarClosure[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal and form state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [appointmentType, setAppointmentType] = useState<string | null>(null);
  const [pictureOption, setPictureOption] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [gmail, setGmail] = useState<string>('');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const navigateToPage = (page: string) => {
    const currentRoute = pathname || '/calendar';
    
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


  // Fetch user appointments for the current month
  const fetchUserAppointments = async () => {
    try {
      if (user?.id) {
        const appointments = await appointmentAPI.getUserAppointments(user.id);
        setUserAppointments(appointments);
      }
    } catch (error) {
      setUserAppointments([]);
    }
  };

  // Fetch calendar closures for the current month
  const fetchClosuresForMonth = async () => {
    try {
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      const startDateStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      
      const closures = await calendarClosureAPI.getClosures({
        start: startDateStr,
        end: endDateStr
      });
      setClosures(closures);
    } catch (error) {
      setClosures([]);
    }
  };

  // Pull-to-refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchUserAppointments(),
        fetchClosuresForMonth()
      ]);
    } catch (error) {
      // Silently handle refresh errors
    } finally {
      setRefreshing(false);
    }
  };



  // Handle date selection
  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
  };

  // Modal functions
  const showModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      // Reset form data
      setAppointmentType(null);
      setPictureOption(null);
      setSelectedTimeSlot(null);
      setGmail('');
      setErrorMessage('');
      setSuccessMessage('');
      setShowConfirmation(false);
    });
  };

  const handleSubmit = async () => {
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    if (!appointmentType) {
      setErrorMessage('Please select an appointment type.');
      return;
    }

    // Check if picture option is required
    if ((appointmentType === 'School Year Renewal' || appointmentType === 'Lost ID') && !pictureOption) {
      setErrorMessage('Please select a picture option for this appointment type.');
      return;
    }

    if (!selectedTimeSlot) {
      setErrorMessage('Please select a time slot.');
      return;
    }

    if (!gmail.trim()) {
      setErrorMessage('Please enter your Gmail account.');
      return;
    }

    // Validate Gmail format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(gmail)) {
      setErrorMessage('Please enter a valid Gmail account (e.g., example@gmail.com).');
      return;
    }

    // Show confirmation step
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      
      // Map appointment types to backend values
      const purposeMap: { [key: string]: string } = {
        'Term Renewal': 'RENEWAL',
        'School Year Renewal': 'RENEWAL',
        'Lost ID': 'LOST_REPLACEMENT'
      };

      const appointmentData = {
        appointmentDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
        appointmentStartTime: selectedTimeSlot ? selectedTimeSlot.split(' - ')[0] : '8:00 AM',
        appointmentEndTime: selectedTimeSlot ? selectedTimeSlot.split(' - ')[1] : '9:00 AM',
        purpose: purposeMap[appointmentType!] || 'RENEWAL',
        notes: '',
        type: appointmentType!.toLowerCase().replace(/\s+/g, '-'),
        pictureOption: pictureOption ? pictureOption.toLowerCase().replace(/\s+/g, '-') : undefined,
        status: 'pending-approval',
        gmail: gmail
      };

      await appointmentAPI.createAppointment(appointmentData);
      
      // Refresh data after successful booking
      fetchUserAppointments();
      
      setSuccessMessage('Your appointment has been booked successfully. You will receive a confirmation email shortly.');
      
      // Close modal immediately after success
      hideModal();
      
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get month name
  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  // Helper function to get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper function to get first day of month
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Fetch data when month changes
  useEffect(() => {
    if (user) {
      fetchUserAppointments();
      fetchClosuresForMonth();
    }
  }, [currentMonth, currentYear, user]);

  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  // Check if a date is in the past
  const isPastDate = (day: number) => {
    const today = new Date();
    const currentDay = new Date(currentYear, currentMonth, day);
    return currentDay < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Check if a date has appointments
  const hasAppointments = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return userAppointments.some(appointment => {
      const appointmentDate = appointment.slotId?.date || appointment.appointmentDate;
      return appointmentDate === dateStr;
    });
  };

  // Check if selected date has an active appointment
  const hasActiveAppointmentOnSelectedDate = () => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    return userAppointments.some(appointment => {
      const appointmentDate = appointment.slotId?.date || appointment.appointmentDate;
      return appointmentDate === dateStr;
    });
  };

  // Check if a date is Sunday
  const isSunday = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.getDay() === 0; // Sunday
  };

  // Check if a date is closed by admin
  const isClosedDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return closures.some(c => c.date === dateStr);
  };

  // Check if a date has available slots (matches client logic)
  const hasAvailableSlots = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    
    // Sunday is closed
    if (dayOfWeek === 0) {
      return false;
    }
    
    // All other days are available
    return true;
  };

  // Check if a date is closed by admin (matches client logic)
  const isClosedByAdmin = (day: number) => {
    return isClosedDate(day);
  };



  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1e40af']}
            tintColor="#1e40af"
          />
        }
      >
        {/* Calendar Section */}
        <Text style={styles.sectionTitle}>Schedule Appointment</Text>
        
          {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthYear}>{getMonthName(currentMonth)} {currentYear}</Text>
            <View style={styles.navigationButtons}>
              <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
                <Ionicons name="chevron-back-outline" size={20} color="#1e40af" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
                <Ionicons name="chevron-forward-outline" size={20} color="#1e40af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of Week */}
          <View style={styles.daysOfWeek}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.dayOfWeek}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {generateCalendarDays().map((day, i) => {
              const isValidDay = day !== null;
              const isPast = isValidDay && isPastDate(day);
              const hasAppointment = isValidDay && hasAppointments(day);
              const hasSlots = isValidDay && hasAvailableSlots(day);
              const isClosedDay = isValidDay && isClosedByAdmin(day);
              const isSundayDay = isValidDay && isSunday(day);
              const isClickable = isValidDay && !isPast && (hasSlots || isClosedDay || isSundayDay);
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.calendarDay,
                    isValidDay && isToday(day) && styles.todayDay,
                    isValidDay && isSelected(day) && styles.selectedDay,
                    hasAppointment && styles.appointmentDay,
                    isClosedDay && styles.closedDay,
                    isPast && styles.pastDay,
                  ]}
                  onPress={() => isClickable && handleDateSelect(day)}
                  disabled={!isClickable}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !isValidDay && styles.inactiveDay,
                      isValidDay && isToday(day) && styles.todayText,
                      isValidDay && isSelected(day) && !isToday(day) && styles.selectedText,
                      hasAppointment && styles.appointmentText,
                      isClosedDay && styles.closedText,
                      isPast && styles.pastText,
                    ]}
                  >
                    {day || ""}
                  </Text>
                  {hasAppointment && <View style={styles.appointmentDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Open for booking */}
        <Text style={styles.section2Title}>
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <View style={styles.timeSlotsContainer}>
          {selectedDate.getDay() === 0 ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedLabel}>Closed on Sundays</Text>
            </View>
          ) : isClosedByAdmin(selectedDate.getDate()) ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedLabel}>CLOSED</Text>
            </View>
          ) : isPastDate(selectedDate.getDate()) ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedLabel}>Past date</Text>
            </View>
          ) : isToday(selectedDate.getDate()) ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedLabel}>Same-day booking not allowed</Text>
            </View>
          ) : hasActiveAppointmentOnSelectedDate() ? (
            <View style={styles.closedContainer}>
              <Text style={styles.closedLabel}>Already have an active appointment</Text>
            </View>
          ) : (
            <View style={styles.openContainer}>
              <Text style={styles.openLabel}>Open for booking</Text>
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => {
                  showModal();
                }}
              >
                <Text style={styles.bookNowButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Book Appointment Button - Hidden since slots are clickable */}
      </ScrollView>

      {/* Appointment Booking Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={hideModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {!showConfirmation ? (
                <>
                  {/* Appointment Type Selection */}
                  <Text style={styles.sectionLabel}>Choose an appointment type</Text>
              {errorMessage && (errorMessage.includes('appointment type') || errorMessage.includes('picture option')) && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <View style={styles.optionsContainer}>
                {['Term Renewal', 'School Year Renewal', 'Lost ID'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      appointmentType === type && styles.selectedOption
                    ]}
                    onPress={() => setAppointmentType(type)}
                  >
                    <Text style={[
                      styles.optionText,
                      appointmentType === type && styles.selectedOptionText
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Picture Option (only for School Year Renewal and Lost ID) */}
              {(appointmentType === 'School Year Renewal' || appointmentType === 'Lost ID') && (
                <>
                  <Text style={styles.sectionLabel}>For {appointmentType}</Text>
                  <View style={styles.optionsContainer}>
                    {['New Picture', 'Retain Picture'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionButton,
                          pictureOption === option && styles.selectedOption
                        ]}
                        onPress={() => setPictureOption(option)}
                      >
                        <Text style={[
                          styles.optionText,
                          pictureOption === option && styles.selectedOptionText
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Time Slot Selection */}
              <Text style={styles.sectionLabel}>Choose Time Slot</Text>
              {errorMessage && errorMessage.includes('time slot') && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <Text style={styles.timeSlotNote}>
                {selectedDate.getDay() === 6 
                  ? 'Saturday hours: 8:00 AM - 12:00 NN' 
                  : 'Office hours: 8:00 AM - 5:00 PM (Closed 12:00 PM - 1:00 PM)'
                }
              </Text>
              
              {/* Time slots side by side */}
              <View style={styles.timeSlotsSideBySide}>
                {/* Morning column */}
                <View style={styles.timeSlotColumn}>
                  <View style={styles.timeSlotsGrid}>
                    {['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 NN'].map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeSlotButton,
                          selectedTimeSlot === time && styles.selectedTimeSlot
                        ]}
                        onPress={() => setSelectedTimeSlot(time)}
                      >
                        <Text style={[
                          styles.timeSlotButtonText,
                          selectedTimeSlot === time && styles.selectedTimeSlotText
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Afternoon column - only show for non-Saturday days */}
                {selectedDate.getDay() !== 6 && (
                  <View style={styles.timeSlotColumn}>
                    <View style={styles.timeSlotsGrid}>
                      {['1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM'].map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[
                            styles.timeSlotButton,
                            selectedTimeSlot === time && styles.selectedTimeSlot
                          ]}
                          onPress={() => setSelectedTimeSlot(time)}
                        >
                          <Text style={[
                            styles.timeSlotButtonText,
                            selectedTimeSlot === time && styles.selectedTimeSlotText
                          ]}>
                            {time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Gmail Input */}
              <Text style={styles.sectionLabel}>Gmail Account</Text>
              {errorMessage && (errorMessage.includes('Gmail') || errorMessage.includes('email') || errorMessage.includes('valid')) && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
              <Text style={styles.timeSlotNote}>We'll send your appointment confirmation to this email address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gmail Account *</Text>
                <TextInput
                  style={styles.textInput}
                  value={gmail}
                  onChangeText={setGmail}
                  placeholder="example123@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHelperText}>Only Gmail accounts are accepted for notifications</Text>
              </View>
                </>
              ) : (
                <>
                  {/* Confirmation Summary */}
                  <Text style={styles.sectionLabel}>Confirm Your Appointment</Text>
                  
                  <View style={styles.confirmationContainer}>
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>Date:</Text>
                      <Text style={styles.confirmationValue}>
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>Time:</Text>
                      <Text style={styles.confirmationValue}>{selectedTimeSlot}</Text>
                    </View>
                    
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>Type:</Text>
                      <Text style={styles.confirmationValue}>{appointmentType}</Text>
                    </View>
                    
                    {pictureOption && (
                      <View style={styles.confirmationRow}>
                        <Text style={styles.confirmationLabel}>Picture:</Text>
                        <Text style={styles.confirmationValue}>{pictureOption}</Text>
                      </View>
                    )}
                    
                    <View style={styles.confirmationRow}>
                      <Text style={styles.confirmationLabel}>Email:</Text>
                      <Text style={styles.confirmationValue}>{gmail}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.confirmationNote}>
                    Please review your appointment details above. You will receive a confirmation email at the provided Gmail address.
                  </Text>
                </>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={showConfirmation ? () => setShowConfirmation(false) : hideModal}
              >
                <Text style={styles.cancelButtonText}>
                  {showConfirmation ? 'Back' : 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
                onPress={showConfirmation ? handleConfirmBooking : handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {showConfirmation ? 'Confirm Booking' : 'Review Details'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
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
          <Ionicons name="calendar" size={24} color="#1e40af" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateToPage('profile')}>
          <Ionicons name="person-outline" size={24} color="#475569" />
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

  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 10 },

  section2Title: { fontSize: 20, fontWeight: "600", marginTop: 20, marginBottom: 10 },

  calendarContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthYear: { fontSize: 25, fontWeight: "600", color: "#1e40af" },
  navigationButtons: { flexDirection: "row" },
  navButton: { padding: 4, marginLeft: 8 },

  daysOfWeek: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: "14.28%", // exact 7 columns (100/7 = 14.28%)
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginVertical: 3,
    paddingHorizontal: 2,
  },
  todayDay: {
    backgroundColor: "#1e40af",
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: "#e0e7ff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#1e40af",
  },
  appointmentDay: {
    backgroundColor: "#fef3c7",
    borderRadius: 20,
  },
  closedDay: {
    backgroundColor: "#dc2626",
    borderRadius: 20,
  },
  pastDay: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e40af",
  },
  inactiveDay: { color: "#cbd5e1" },
  todayText: { color: "#fff" },
  selectedText: { color: "#1e40af", fontWeight: "700" },
  appointmentText: { color: "#d97706" },
  closedText: { color: "#fff" },
  pastText: { opacity: 0.5 },
  appointmentDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d97706",
  },

  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  closedContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  closedLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#dc2626",
    textAlign: "center",
  },
  openContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 20,
  },
  openLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#059669",
  },

  bookButton: {
    backgroundColor: "#facc15",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  bookButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
  bookButtonTextDisabled: {
    color: "#94a3b8",
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '100%',
    minHeight: '85%',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 12,
  },

  // Form styles
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  timeSlotNote: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  timeSlotSubLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedOption: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedOptionText: {
    color: '#fff',
  },

  // Time slot styles
  timeSlotsSideBySide: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timeSlotColumn: {
    flex: 1,
  },
  timeSlotsGrid: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  timeSlotButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#d1d5db',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  timeSlotButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },

  // Footer button styles
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1e40af',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#fff',
  },
  inputHelperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Book now button styles
  bookNowButton: {
    backgroundColor: '#EFC620',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 25,
    width: '90%',
  },
  bookNowButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },

  // Error message styles
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 1,
  },

  // Confirmation styles
  confirmationContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  confirmationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e40af',
    flex: 2,
    textAlign: 'right',
  },
  confirmationNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },

});
