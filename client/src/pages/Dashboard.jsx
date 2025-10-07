import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import nuLogo from "../assets/images/nu-logo.png";
import ChangePasswordModal from "../components/ChangePasswordModal";
import Toast from "../components/Toast";
import { FaCalendarAlt, FaBullhorn, FaInfoCircle, FaUser } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);


  const [appointmentType, setAppointmentType] = useState(null);
  const [pictureOption, setPictureOption] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [closures, setClosures] = useState([]); // dates when office is closed
  const [showAppointments, setShowAppointments] = useState(false); // collapsible appointments panel
  const [gmail, setGmail] = useState('');
  const [gmailError, setGmailError] = useState('');
  const [toast, setToast] = useState(null); // { message, type }
  const validateGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Month names for calendar display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to format date as YYYY-MM-DD without timezone issues
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string as local date
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };



  useEffect(() => {
    // Check for Google OAuth token in URL params first
    const urlToken = searchParams.get("token");
    const source = searchParams.get("source");

    if (urlToken && source === "google") {
      // Store the Google OAuth token
      localStorage.setItem("token", urlToken);
      // Clean up URL by removing query params
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchUserData(decoded.id);
      fetchUserAppointments(decoded.id);
      fetchClosuresForMonth(currentDate);
      setLoading(false);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setLoading(false);
      navigate("/");
    }
  }, [navigate, searchParams]);

  // Refetch closures when month changes
  useEffect(() => {
    if (user) {
      fetchClosuresForMonth(currentDate);
    }
  }, [currentDate, user]);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const fetchUserData = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUserDetails(userData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchUserAppointments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/appointments/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const appointmentData = await res.json();
        console.log("Raw appointment data:", appointmentData);
        
        // Convert and normalize appointment data
        const processedAppointments = appointmentData.map(appointment => {
          // Try to get date from slot first, then from appointment fields
          let appointmentDate = null;
          let timeSlot = 'Time not set';
          
          if (appointment.slotId?.date) {
            appointmentDate = parseLocalDate(appointment.slotId.date);
            if (appointment.slotId.start && appointment.slotId.end) {
              timeSlot = `${appointment.slotId.start} - ${appointment.slotId.end}`;
            }
          } else if (appointment.appointmentDate) {
            appointmentDate = parseLocalDate(appointment.appointmentDate);
            if (appointment.appointmentStartTime && appointment.appointmentEndTime) {
              // Convert 24-hour format to 12-hour format for display
              const formatTime = (time24) => {
                const [hours, minutes] = time24.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
              };

timeSlot = `${formatTime(appointment.appointmentStartTime)} - ${formatTime(appointment.appointmentEndTime)}`;
          }
        } else if (appointment.createdAt) {
          appointmentDate = new Date(appointment.createdAt);
        }
        
        return {
          ...appointment,
          id: appointment._id,
          date: appointmentDate,
          timeSlot: timeSlot
        };
      });
      
      console.log("Processed appointments:", processedAppointments);
      setAppointments(processedAppointments);
    }
  } catch (err) {
    console.error("Error fetching appointments:", err);
  }
};




  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatSelectedDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      // refresh closures for the new month
      fetchClosuresForMonth(newDate);
      return newDate;
    });
  };
  
  const fetchClosuresForMonth = async (dateObj) => {
    try {
      const token = localStorage.getItem("token");
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const endDate = new Date(year, dateObj.getMonth() + 1, 0).getDate();
      const end = `${year}-${month}-${String(endDate).padStart(2, '0')}`;
      const res = await fetch(`${API_URL}/calendar-closures?start=${start}&end=${end}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClosures(data);
      }
    } catch (err) {
      console.error("Failed to fetch closures", err);
    }
  };
  
  const isClosedDate = (date) => {
    const dateStr = formatDateForAPI(date);
    return closures.some(c => c.date === dateStr);
  };
  
  const getClosureRemarks = (date) => {
    const dateStr = formatDateForAPI(date);
    const found = closures.find(c => c.date === dateStr);
    return found?.remarks || null;
  };
  
  const checkOfficeStatus = (date) => {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const today = new Date();
    
    // Set hours to 0 to compare just the dates
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (compareDate < today) {
      return { 
        isOpen: false, 
        message: "Past date", 
        schedule: "Cannot book appointments for past dates" 
      };
    }

    // Admin-declared closure
    if (isClosedDate(compareDate)) {
      return {
        isOpen: false,
        message: "Closed",
        schedule: getClosureRemarks(compareDate) || "ITSO Office Closed"
      };
    }
    
    // Sunday is closed
    if (day === 0) {
      return { 
        isOpen: false, 
        message: "Closed", 
        schedule: "ITSO Office is closed on Sundays" 
      };
    }
    
    // Saturday: 8:00 AM - 12:00 NN only
    if (day === 6) {
      return { 
        isOpen: true, 
        message: "Open for booking", 
        schedule: "5th Floor, 8:00 AM - 12:00 NN" 
      };
    }
    
    // Weekdays: 8:00 AM - 5:00 PM
    return { 
      isOpen: true, 
      message: "Open for booking", 
      schedule: "5th Floor, 8:00 AM - 5:00 PM" 
    };
  };
  
  const getAppointmentForDate = (date) => {
    if (!date) return null;
    
    return appointments.find(appointment => 
      appointment.date && 
      appointment.date instanceof Date &&
      appointment.date.getDate() === date.getDate() &&
      appointment.date.getMonth() === date.getMonth() &&
      appointment.date.getFullYear() === date.getFullYear()
    );
  };
  
  const formatAppointmentStatus = (status) => {
    switch (status) {
      case 'pending-approval':
        return 'Pending Approval';
      case 'on-hold':
        return 'On Hold';
      case 'for-printing':
        return 'For Printing';
      case 'to-claim':
        return 'To Claim';
      case 'confirmed':
        return 'Confirmed';
      case 'declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending-approval':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-gray-200 text-gray-800';
      case 'for-printing':
        return 'bg-yellow-100 text-yellow-800';
      case 'to-claim':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      dateToCheck.setHours(0, 0, 0, 0);
      
      const isToday = today.getTime() === dateToCheck.getTime();
      const isPastDate = dateToCheck < today;
      
      // Admin-declared closure for this date
      const isClosed = isClosedDate(dateToCheck);
      
      // Check if this date has an appointment
      const hasAppointment = appointments.some(appointment => 
        appointment.date && 
        appointment.date instanceof Date &&
        appointment.date.getDate() === dateToCheck.getDate() &&
        appointment.date.getMonth() === dateToCheck.getMonth() &&
        appointment.date.getFullYear() === dateToCheck.getFullYear()
      );
      
      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isPastDate,
        hasAppointment,
        isClosed
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const daysArray = generateCalendarDays();



  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating background elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>
        
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #2849D0',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 24px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            marginTop: '16px',
            color: '#374151',
            fontSize: '18px',
            fontWeight: '600',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '3%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      {/* Modern Navigation Header */}
      <nav style={{
        background: 'rgba(40, 73, 208, 0.95)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px'
          }}>
            {/* Enhanced Logo and Brand */}
            <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-start'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px'
                        }}>
                          <img src={nuLogo} alt="NU Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ color: '#fde047', fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap' }}>
                            NU Dasmarinas
                          </div>
                          <div style={{ color: '#fde047', fontSize: '18px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            ITSO ID Tracker
                          </div>
                        </div>
                      </div>

            {/* Center: Navigation Links */}
            <div style={{ 
              display: 'flex', 
              gap: '32px', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Link to="/dashboard" className="link-underline" style={{
                color: location.pathname === '/dashboard' ? '#fde047' : '#93c5fd',
                textDecoration: 'none',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>Calendar</Link>
              <Link to="/announcements" className="link-underline" style={{
                color: location.pathname === '/announcements' ? '#fde047' : '#93c5fd',
                textDecoration: 'none',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>Announcements</Link>
              <Link to="/about" className="link-underline" style={{
                color: location.pathname === '/about' ? '#fde047' : '#93c5fd',
                textDecoration: 'none',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>About Us</Link>
            </div>

            {/* Enhanced Modern User Profile */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              position: 'relative'
            }} className="profile-dropdown-container">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '8px 16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}>
                <FaUser style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }} />
                <span style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  Hi, {userDetails?.first_name || user?.email?.split('@')[0] || "User"}!
                </span>
              </div>
              <div 
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 32px rgba(253, 224, 71, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.08)';
                  e.target.style.boxShadow = '0 12px 40px rgba(253, 224, 71, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(253, 224, 71, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}></div>
                <div style={{
                  width: '42px',
                  height: '42px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '800',
                    fontSize: '18px',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    {(userDetails?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Modern Profile Dropdown */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  right: '0',
                  top: '70px',
                  width: '360px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(40px)',
                  borderRadius: '24px',
                  boxShadow: '0 32px 80px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  zIndex: 50,
                  overflow: 'hidden',
                  animation: 'dropdownSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      opacity: 0.3
                    }}></div>
                    <div style={{
                      width: '96px',
                      height: '96px',
                      background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                      borderRadius: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      border: '3px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 12px 40px rgba(253, 224, 71, 0.3)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <div style={{
                        width: '72px',
                        height: '72px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                      }}>
                        <span style={{
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontWeight: '900',
                          fontSize: '32px',
                          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                        }}>
                          {(userDetails?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <h3 style={{
                      color: 'white',
                      fontWeight: '800',
                      fontSize: '22px',
                      margin: '0 0 12px 0',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {userDetails?.first_name && userDetails?.last_name 
                        ? `${userDetails.first_name} ${userDetails.last_name}`
                        : user?.email?.split('@')[0] || "Juan Dela Cruz"}
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.95)',
                          fontSize: '16px',
                          fontWeight: '600',
                          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                        }}>
                          {userDetails?.student_id || user?.student_id || "2023-123456"}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <span style={{
                          color: 'rgba(255, 255, 255, 0.85)',
                          fontSize: '14px',
                          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                        }}>
                          {userDetails?.personal_email || user?.email || "juandelacruz@gmail.com"}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px' }}>
                    <button 
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        color: '#1e40af',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        fontSize: '16px',
                        fontWeight: '700',
                        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.1)'
                      }}
                      onClick={() => {
                        setShowChangePasswordModal(true);
                        setShowProfileDropdown(false);
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.2)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.1)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.2)';
                      }}
                    >
                      <svg style={{ width: '22px', height: '22px', marginRight: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                      </svg>
                      Change Password
                    </button>
                    <button 
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        color: '#dc2626',
                        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.1))',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: '700',
                        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.1)'
                      }}
                      onClick={handleLogout}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.2))';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.2)';
                        e.target.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.1))';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(220, 38, 38, 0.1)';
                        e.target.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                      }}
                    >
                      <svg style={{ width: '22px', height: '22px', marginRight: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Modern Page Title */}
        <div className="fade-in" style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="slide-in-up" style={{
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #2849D0, #3b82f6, #1e40af)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 16px 0',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            animationDelay: '0.1s'
          }}>
            Book an Appointment
          </h1>
          <p className="slide-in-up" style={{
            fontSize: '18px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            lineHeight: '1.6',
            animationDelay: '0.2s'
          }}>
            Book appointments, manage your schedule, and track your ID status all in one place.
          </p>
        </div>

        {/* Modern Calendar and Profile Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '750px 435px',
          gap: '25px',
          alignItems: 'start'
        }}>
          {/* Modern Calendar Section - Left Side (Expanded) */}
          <div className="modern-card fade-in" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: '0.2s',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Modern Calendar Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px',
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              padding: '24px 32px',
              borderRadius: '20px',
              margin: '-32px -32px 32px -32px',
              boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)'
            }}>
              <button
                onClick={() => navigateMonth(-1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ← Previous
              </button>
              
              <h2 style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: '800',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth(1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Next →
              </button>
            </div>

            {/* Calendar Legend */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)'
                }}></div>
                Has Appointment
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                }}></div>
                Closed by Admin
              </div>
            </div>

            {/* Modern Calendar Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
              background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
              borderRadius: '16px',
              overflow: 'hidden',
              padding: '2px'
            }}>
              {/* Modern Day Headers */}
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <div
                  key={day}
                  style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    padding: '16px 8px',
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    borderRadius: index === 0 ? '14px 0 0 0' : index === 6 ? '0 14px 0 0' : '0'
                  }}
                >
                  {day.slice(0, 3)}
                </div>
              ))}

              {/* Modern Calendar Days */}
              {daysArray.map((dayObj, index) => {
                const isSelected = selectedDate && selectedDate.getDate() === dayObj.day && 
                                 selectedDate.getMonth() === currentDate.getMonth() && 
                                 selectedDate.getFullYear() === currentDate.getFullYear() && 
                                 dayObj.isCurrentMonth;
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: '16px 8px',
                      textAlign: 'center',
                      minHeight: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: dayObj.isCurrentMonth ? 
                             (dayObj.isToday ? 'white' : '#1f2937') : 
                             '#9ca3af',
                      fontWeight: dayObj.isToday ? '700' : '600',
                      fontSize: '16px',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                      background: dayObj.isToday ? 
                                 'linear-gradient(135deg, #2849D0, #3b82f6)' :
                                 isSelected ?
                                 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
                                 dayObj.hasAppointment ?
                                 'linear-gradient(135deg, #dcfce7, #bbf7d0)' :
                                 'white',
                      cursor: dayObj.isCurrentMonth && !dayObj.isPastDate ? 'pointer' : 'default',
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '8px',
                      boxShadow: dayObj.isToday || isSelected ? 
                                '0 4px 12px rgba(40, 73, 208, 0.3)' : 
                                dayObj.hasAppointment ?
                                '0 2px 8px rgba(34, 197, 94, 0.2)' :
                                'none',
                      opacity: dayObj.isPastDate ? 0.5 : 1
                    }}
                    onClick={() => {
                      if (dayObj.isCurrentMonth && !dayObj.isPastDate) {
                        const newDate = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          dayObj.day
                        );
                        setSelectedDate(newDate);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (dayObj.isCurrentMonth && !dayObj.isPastDate && !dayObj.isToday && !isSelected) {
                        e.target.style.background = 'linear-gradient(135deg, #f1f5f9, #e2e8f0)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dayObj.isCurrentMonth && !dayObj.isPastDate && !dayObj.isToday && !isSelected) {
                        e.target.style.background = dayObj.hasAppointment ?
                                                       'linear-gradient(135deg, #dcfce7, #bbf7d0)' :
                                                       'white';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = dayObj.hasAppointment ?
                                                      '0 2px 8px rgba(34, 197, 94, 0.2)' :
                                                      'none';
                      }
                    }}
                  >
                    {dayObj.day}
                    {dayObj.hasAppointment && (
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '12px',
                        height: '12px',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    )}
                    {dayObj.isClosed && (
                      <div style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '12px',
                        height: '12px',
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)'
                      }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side - Two Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* User Profile Section - Top Right Card */}
            <div className="modern-card slide-in-right" style={{ animationDelay: '0.3s' }}>
              {/* Profile Header */}
              <div className="gradient-bg-primary rounded-t-2xl p-6">
                <div className="flex items-center">
                  {/* Profile Picture */}
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-5">
                    <svg className="w-14 h-14 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  {/* User Info */}
                  <div>
                    {/* User Name */}
                    <h3 className="text-2xl font-bold text-white">
                      {userDetails?.first_name && userDetails?.last_name
                        ? `${userDetails.first_name} ${userDetails.last_name}`
                        : userDetails?.first_name || user?.email?.split('@')[0] || "Juan Dela Cruz"
                      }
                    </h3>

                    {/* Student ID */}
                    <p className="text-gray-200 text-base font-medium mt-1">
                      {userDetails?.student_id || "2023-123456"}
                    </p>

                    {/* Email */}
                    <p className="text-gray-300 text-sm mt-1">
                      {userDetails?.personal_email || user?.email || "juandelacruz@gmail.com"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointments Status */}
              <div className="py-6 px-6">
                {(() => {
                  console.log("Dashboard: Rendering appointments section, appointments:", appointments);
                  return null;
                })()}

                {/* Collapsible header */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  onClick={() => setShowAppointments(prev => !prev)}
                >
                  <span className="text-lg font-semibold text-gray-800">Your Appointments</span>
                  <svg
                    className={`w-5 h-5 text-gray-600 transform transition-transform ${showAppointments ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Collapsible content with fixed height and scroll */}
                {showAppointments && (
                  appointments && appointments.length > 0 ? (
                    <div 
                      className="mt-4"
                      style={{
                        maxHeight: '220px',
                        overflowY: 'auto',
                        paddingRight: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 #f1f5f9'
                      }}
                    >
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          width: 6px;
                        }
                        div::-webkit-scrollbar-track {
                          background: #f1f5f9;
                          border-radius: 3px;
                        }
                        div::-webkit-scrollbar-thumb {
                          background: #cbd5e1;
                          border-radius: 3px;
                        }
                        div::-webkit-scrollbar-thumb:hover {
                          background: #94a3b8;
                        }
                      `}</style>
                      {appointments.map((appointment, index) => (
                        <div 
                          key={appointment.id || index} 
                          className="mb-4 p-4 bg-gray-50 rounded-lg hover-pop scale-in" 
                          style={{ 
                            animationDelay: `${0.1 * index}s`,
                            minHeight: '180px'
                          }}
                        >
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                            <p className="text-base text-gray-800">
                              {appointment.date ? appointment.date.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'Date not set'}
                              <br />
                              {appointment.timeSlot}
                            </p>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Type</p>
                            <p className="text-base text-gray-800">
                              {appointment.type === 'term-renewal' && 'Term Renewal'}
                              {appointment.type === 'school-year-renewal' && 'School Year Renewal'}
                              {appointment.type === 'lost-id' && 'Lost ID'}
                              {appointment.type === 'new-id' && 'New ID'}
                              {appointment.pictureOption && 
                               ` (${appointment.pictureOption === 'new-picture' ? 'New Picture' : 'Retain Picture'})`}
                            </p>
                          </div>
                          
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              getStatusColor(appointment.status)
                            }`}>
                              {formatAppointmentStatus(appointment.status)}
                            </span>
                          </div>

                          {/* QR Code Display for Confirmed Appointments */}
                          {appointment.status === 'confirmed' && appointment.qrData && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 mb-1">QR Code for Check-in</p>
                              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01M12 12h4.01M12 15h4.01M12 21h4.01" />
                                    </svg>
                                    <span className="text-sm text-green-800">Show QR Code</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Create a modal or expand to show QR code
                                      const qrModal = document.createElement('div');
                                      qrModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                                      qrModal.innerHTML = `
                                        <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                                          <div class="flex justify-between items-center mb-4">
                                            <h3 class="text-lg font-semibold text-gray-800">Check-in QR Code</h3>
                                            <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                                              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                              </svg>
                                            </button>
                                          </div>
                                          <div class="text-center">
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appointment.qrData)}" alt="QR Code" class="mx-auto mb-4" />
                                            <p class="text-sm text-gray-600">Scan this QR code at the ITSO office for check-in</p>
                                          </div>
                                        </div>
                                      `;
                                      document.body.appendChild(qrModal);
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                  >
                                    View QR
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Admin Remarks */}
                          {appointment.adminRemarks && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-600 mb-1">Admin Remarks</p>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm text-yellow-800">
                                      {appointment.adminRemarks}
                                    </p>
                                    {appointment.statusUpdatedBy && (
                                      <p className="text-xs text-yellow-700 mt-2">
                                        Updated by: {appointment.statusUpdatedBy}
                                        {appointment.statusUpdatedAt && (
                                          <span className="ml-1">
                                            on {new Date(appointment.statusUpdatedAt).toLocaleDateString()}
                                          </span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-center py-4">
                      <p className="text-gray-700 text-lg">No appointment yet.</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Date Details Card - Bottom Right Card */}
            <div className="modern-card slide-in-right" style={{ animationDelay: '0.4s' }}>
              {/* Divider */}
              <div className="border-b border-gray-200"></div>

              {/* Date Details or Instructions */}
              {selectedDate ? (
                <div className="py-8 px-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {formatSelectedDate(selectedDate)}
                  </h3>
                  
                  {/* Check if there's an appointment for this date */}
                  {getAppointmentForDate(selectedDate) ? (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Appointment</p>
                        <p className="text-base text-gray-800">
                          {formatSelectedDate(selectedDate)}
                          <br />
                          {getAppointmentForDate(selectedDate).type === 'term-renewal' && 'Term Renewal'}
                          {getAppointmentForDate(selectedDate).type === 'school-year-renewal' && 'SY Renewal'}
                          {getAppointmentForDate(selectedDate).type === 'lost-id' && 'Lost ID'}
                          {getAppointmentForDate(selectedDate).type === 'school-year-renewal' && 
                           getAppointmentForDate(selectedDate).pictureOption && 
                           ` (${getAppointmentForDate(selectedDate).pictureOption === 'new-picture' ? 'New Picture' : 'Retain Picture'})`}
                          <br />
                          {getAppointmentForDate(selectedDate).timeSlot}
                        </p>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                          getStatusColor(getAppointmentForDate(selectedDate).status)
                        }`}>
                          {formatAppointmentStatus(getAppointmentForDate(selectedDate).status)}
                        </span>
                      </div>
                      
                      <p className="text-red-500 text-sm mt-6">
                        You already have an active appointment.
                      </p>
                      
                      <button 
                        className="w-full py-3 px-4 bg-gray-200 text-gray-500 font-medium rounded-lg mt-4 cursor-not-allowed"
                        disabled
                      >
                        Book Now
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Event</p>
                        <p className="text-base text-gray-800">ID Claiming Schedule</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="text-base text-gray-800">{checkOfficeStatus(selectedDate).schedule}</p>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const d = new Date(selectedDate);
                          d.setHours(0, 0, 0, 0);
                          const sameDay = d.getTime() === today.getTime();
                          if (sameDay) {
                            return (
                              <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                Same-day booking not allowed
                              </span>
                            );
                          }
                          const status = checkOfficeStatus(selectedDate);
                          return (
                            <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                              status.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {status.message}
                            </span>
                          );
                        })()}
                      </div>
                      
                      {checkOfficeStatus(selectedDate).isOpen ? (
                        <button 
                          className="w-full py-3 px-4 bg-yellow-400 text-blue-800 font-medium rounded-lg hover:bg-yellow-500 transition-colors"
                          onClick={() => setShowBookingModal(true)}
                        >
                          Book Now
                        </button>
                      ) : (
                        <button 
                          className="w-full py-3 px-4 bg-gray-200 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                          disabled
                        >
                          Office Closed
                        </button>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="py-10 px-6 text-center">
                  <p className="text-gray-500 text-base">
                    Select a date from the calendar<br />
                    to view details here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>


      {/* Footer */}
      <footer style={{
        backgroundColor: '#4a5568',
        color: 'white',
        padding: '32px 20px 16px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            {/* Contact Section */}
            <div>
              <h4 style={{ 
                fontWeight: '600', 
                marginBottom: '12px',
                fontSize: '16px',
                color: '#e2e8f0'
              }}>Contact</h4>
              <p style={{ 
                color: '#3b82f6', 
                fontSize: '14px',
                marginBottom: '16px',
                textDecoration: 'underline'
              }}>itso@nu-dasma.edu.ph</p>
              
              <h4 style={{ 
                fontWeight: '600', 
                marginBottom: '12px',
                fontSize: '16px',
                color: '#e2e8f0'
              }}>Careers</h4>
              <p style={{ 
                color: '#cbd5e0', 
                fontSize: '14px'
              }}>nu-dasmarinas.edu.ph</p>
            </div>

            {/* Address Section */}
            <div>
              <h4 style={{ 
                fontWeight: '600', 
                marginBottom: '12px',
                fontSize: '16px',
                color: '#e2e8f0'
              }}>Address</h4>
              <p style={{ 
                color: '#cbd5e0', 
                fontSize: '14px', 
                lineHeight: '1.6'
              }}>
                Sampaloc 1 Bridge, SM Dasmarinas, Governor's Dr, Dasmariñas, 4114 Cavite<br/>
              </p>
            </div>

            {/* Logo Section */}
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={nuLogo} alt="NU Logo" style={{ 
                  width: '60px', 
                  height: '60px', 
                  objectFit: 'contain' 
                }} />
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#fbbf24',
                  margin: '0 0 4px 0'
                }}>NU Dasmarinas</h3>
                <p style={{ 
                  color: '#fbbf24',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0'
                }}>ITSO ID Tracker</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            borderTop: '1px solid #64748b',
            paddingTop: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#94a3b8',
              fontSize: '12px',
              margin: '0'
            }}>
              © 2025 NU Dasmariñas ITSO ID Tracker
            </p>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {showBookingModal && !showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Book <span className="text-blue-600">Appointment</span>
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowBookingModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step 1 */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Step 1</p>
                <h3 className="text-base font-medium text-gray-800 mb-3">Choose an appointment type</h3>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      appointmentType === 'term-renewal' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setAppointmentType('term-renewal');
                      setPictureOption(null);
                    }}
                  >
                    Term Renewal
                  </button>
                  
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      appointmentType === 'school-year-renewal' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setAppointmentType('school-year-renewal');
                      setPictureOption(null);
                    }}
                  >
                    School Year Renewal
                  </button>
                  
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-medium border ${
                      appointmentType === 'lost-id' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setAppointmentType('lost-id');
                      setPictureOption(null);
                    }}
                  >
                    Lost ID
                  </button>
                </div>
              </div>

              {/* School Year Renewal Options */}
              {appointmentType === 'school-year-renewal' && (
                <div className="mb-6">
                  <h3 className="text-base font-medium text-gray-800 mb-3">For School Year Renewal</h3>
                  
                  <div className="flex gap-2">
                    <button 
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        pictureOption === 'new-picture' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                      onClick={() => setPictureOption('new-picture')}
                    >
                      New Picture
                    </button>
                    
                    <button 
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        pictureOption === 'retain-picture' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setPictureOption('retain-picture')}
                    >
                      Retain Picture
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Step 2</p>
                <h3 className="text-base font-medium text-gray-800 mb-3">Choose Time Slot</h3>
                
                {/* Morning slots (available on all days) */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedTimeSlot === '8:00 AM - 9:00 AM' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTimeSlot('8:00 AM - 9:00 AM')}
                  >
                    8:00 AM - 9:00 AM
                  </button>
                  
                  <button 
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedTimeSlot === '9:00 AM - 10:00 AM' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTimeSlot('9:00 AM - 10:00 AM')}
                  >
                    9:00 AM - 10:00 AM
                  </button>
                  
                  <button 
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedTimeSlot === '10:00 AM - 11:00 AM' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTimeSlot('10:00 AM - 11:00 AM')}
                  >
                    10:00 AM - 11:00 AM
                  </button>
                  
                  <button 
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedTimeSlot === '11:00 AM - 12:00 NN' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedTimeSlot('11:00 AM - 12:00 NN')}
                  >
                    11:00 AM - 12:00 NN
                  </button>
                </div>
                
                {/* Afternoon slots (only available on weekdays, not Saturday) */}
                {selectedDate && selectedDate.getDay() !== 6 && (
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      className={`px-3 py-2 rounded-full text-sm font-medium ${
                        selectedTimeSlot === '1:00 PM - 2:00 PM' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTimeSlot('1:00 PM - 2:00 PM')}
                    >
                      1:00 PM - 2:00 PM
                    </button>
                    
                    <button 
                      className={`px-3 py-2 rounded-full text-sm font-medium ${
                        selectedTimeSlot === '2:00 PM - 3:00 PM' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTimeSlot('2:00 PM - 3:00 PM')}
                    >
                      2:00 PM - 3:00 PM
                    </button>
                    
                    <button 
                      className={`px-3 py-2 rounded-full text-sm font-medium ${
                        selectedTimeSlot === '3:00 PM - 4:00 PM' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTimeSlot('3:00 PM - 4:00 PM')}
                    >
                      3:00 PM - 4:00 PM
                    </button>
                    
                    <button 
                      className={`px-3 py-2 rounded-full text-sm font-medium ${
                        selectedTimeSlot === '4:00 PM - 5:00 PM' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTimeSlot('4:00 PM - 5:00 PM')}
                    >
                      4:00 PM - 5:00 PM
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button 
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                
                <button 
                  className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors ${
                    (appointmentType && selectedTimeSlot && 
                     (appointmentType !== 'school-year-renewal' || pictureOption))
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-blue-800'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!(appointmentType && selectedTimeSlot && 
                            (appointmentType !== 'school-year-renewal' || pictureOption))}
                  onClick={() => {
                    if (appointmentType && selectedTimeSlot && 
                        (appointmentType !== 'school-year-renewal' || pictureOption)) {
                      // Show confirmation modal instead of alert
                      setShowConfirmModal(true);
                    }
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  Confirm your <span className="text-blue-600">Appointment</span>
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4">You have booked</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700">
                  {selectedDate && formatSelectedDate(selectedDate)}
                </p>
                <p className="text-gray-700">
                  {appointmentType === 'term-renewal' && 'Term Renewal'}
                  {appointmentType === 'school-year-renewal' && 'SY Renewal'}
                  {appointmentType === 'lost-id' && 'Lost ID'}
                  {appointmentType === 'school-year-renewal' && pictureOption && ` (${pictureOption === 'new-picture' ? 'New Picture' : 'Retain Picture'})`}
                </p>
                <p className="text-gray-700">{selectedTimeSlot}</p>
              </div>

              {/* Gmail input (required) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail Account *
                </label>
                <input
                  type="email"
                  value={gmail}
                  onChange={(e) => {
                    setGmail(e.target.value);
                    setGmailError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="yourname@gmail.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Only Gmail accounts are accepted for notifications</p>
                {gmailError && <p className="text-red-600 text-sm mt-1">{gmailError}</p>}
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Back
                </button>
                
                <button 
                  className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-medium rounded-lg transition-colors"
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");

                      // Gmail validation
                      if (!gmail.trim()) {
                        setGmailError('Please enter your Gmail account');
                        return;
                      }
                      if (!validateGmail(gmail)) {
                        setGmailError('Please enter a valid Gmail account (e.g., example@gmail.com)');
                        return;
                      }
                      setGmailError('');
                      
                      // Parse time slot to get start and end times
                      const parseTimeSlot = (timeSlot) => {
                        const [startTime, endTime] = timeSlot.split(' - ');
                        
                        const convertTo24Hour = (time) => {
                          const [timePart, period] = time.split(' ');
                          let [hours, minutes] = timePart.split(':');
                          hours = parseInt(hours);
                          
                          if (period === 'PM' && hours !== 12) {
                            hours += 12;
                          } else if (period === 'AM' && hours === 12) {
                            hours = 0;
                          }
                          
                          return `${hours.toString().padStart(2, '0')}:${minutes || '00'}`;
                        };
                        
                        // Handle special case for "NN" (noon)
                        const cleanEndTime = endTime.replace(' NN', ' PM');
                        
                        return {
                          start: convertTo24Hour(startTime),
                          end: convertTo24Hour(cleanEndTime)
                        };
                      };
                      
                      const { start, end } = parseTimeSlot(selectedTimeSlot);
                      
                      // Create slot data
                      const slotData = {
                        date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD format
                        start: start,
                        end: end,
                        purpose: appointmentType === 'term-renewal' ? 'RENEWAL' : 
                                appointmentType === 'school-year-renewal' ? 'RENEWAL' : 'LOST_REPLACEMENT',
                        capacity: 10
                      };
                      
                      console.log('Creating slot with data:', slotData);
                      
                      // Create or find slot
                      let slotId = null;
                      try {
                        const slotRes = await fetch(`${API_URL}/slots`, {
                          method: 'POST',
                          headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                          },
                          body: JSON.stringify(slotData)
                        });
                        
                        if (slotRes.ok) {
                          const slotResult = await slotRes.json();
                          slotId = slotResult.slot._id;
                          console.log('Slot created successfully:', slotResult);
                        } else {
                          const slotError = await slotRes.json();
                          console.log('Slot creation failed:', slotError);
                          
                          // If slot already exists, try to find it
                          if (slotError.message && slotError.message.includes('already exists')) {
                            // Try to find existing slot
                            const findSlotRes = await fetch(`${API_URL}/slots/range?startDate=${slotData.date}&endDate=${slotData.date}&purpose=${slotData.purpose}`, {
                              headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                              }
                            });
                            
                            if (findSlotRes.ok) {
                              const existingSlots = await findSlotRes.json();
                              const matchingSlot = existingSlots.find(slot => 
                                slot.start === slotData.start && slot.end === slotData.end
                              );
                              if (matchingSlot) {
                                slotId = matchingSlot._id;
                                console.log('Found existing slot:', matchingSlot);
                              }
                            }
                          }
                        }
                      } catch (slotError) {
                        console.error('Error with slot creation/finding:', slotError);
                      }
                      
                      // Create appointment data
                      const appointmentData = {
                        slotId: slotId,
                        type: appointmentType,
                        pictureOption: appointmentType === 'school-year-renewal' ? pictureOption : null,
                        notes: `Appointment for ${appointmentType} on ${formatSelectedDate(selectedDate)} at ${selectedTimeSlot}`,
                        status: 'pending-approval',
                        // Include date and time as backup
                        appointmentDate: formatDateForAPI(selectedDate),
                        appointmentStartTime: start,
                        appointmentEndTime: end,
                        gmail
                      };
                      
                      console.log('Creating appointment with data:', appointmentData);
                      
                      const res = await fetch(`${API_URL}/appointments`, {
                        method: 'POST',
                        headers: {
                          "Authorization": `Bearer ${token}`,
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify(appointmentData)
                      });
                      
                      if (res.ok) {
                        const result = await res.json();
                        console.log('Appointment created successfully:', result);
                        
                        // Refresh appointments from server
                        await fetchUserAppointments(user.id);
                        
                        // Reset all states
                        setShowBookingModal(false);
                        setShowConfirmModal(false);
                        setAppointmentType(null);
                        setPictureOption(null);
                        setSelectedTimeSlot(null);

                        setToast({
                          message: "Appointment confirmed! Details and the calendar invite were sent to your Gmail.",
                          type: "success",
                        });
                      } else {
                        const errorData = await res.json();
                        console.error('Failed to create appointment:', errorData);
                        setToast({
                          message: `Failed to create appointment: ${errorData.message || 'Please try again.'}`,
                          type: 'error',
                        });
                      }
                    } catch (error) {
                      console.error('Error creating appointment:', error);
                      setToast({
                        message: 'Error creating appointment. Please try again.',
                        type: 'error',
                      });
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}


      {/* Toast Notifications */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </div>
  );
}

export default Dashboard;
