import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import BookingModal from "../components/BookingModal";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaUsers, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Calendar() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedDateSlots, setSelectedDateSlots] = useState([]);
  const [calendarView, setCalendarView] = useState('month'); // month, week
  const [hoveredDate, setHoveredDate] = useState(null);
  const [priceData, setPriceData] = useState({}); // For calendar pricing display
  const navigate = useNavigate();

  console.log("Calendar component loaded, loading state:", loading);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchCalendarData();
    }
  }, [user, currentDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view calendar");
        setLoading(false);
        return;
      }

      console.log("Fetching calendar data...");

      // Fetch available slots
      const slotsRes = await fetch(`${API_URL}/slots/available`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Slots response status:", slotsRes.status);

      if (slotsRes.ok) {
        const availableSlots = await slotsRes.json();
        console.log("Fetched slots:", availableSlots.length);
        setSlots(availableSlots);

        // Generate pricing data for calendar display
        const pricing = {};
        availableSlots.forEach(slot => {
          const dateKey = slot.date;
          if (!pricing[dateKey]) {
            pricing[dateKey] = {
              slotsCount: 0,
              bookedCount: 0,
              availability: 'available'
            };
          }
          pricing[dateKey].slotsCount += slot.capacity || 1;
          pricing[dateKey].bookedCount += slot.bookedCount || 0;

          // Determine availability
          const totalCapacity = pricing[dateKey].slotsCount;
          const totalBooked = pricing[dateKey].bookedCount;

          if (totalBooked >= totalCapacity) {
            pricing[dateKey].availability = 'full';
          } else if (totalBooked > totalCapacity * 0.7) {
            pricing[dateKey].availability = 'limited';
          } else {
            pricing[dateKey].availability = 'available';
          }
        });

        setPriceData(pricing);
        console.log("Generated pricing data for", Object.keys(pricing).length, "dates");
      } else {
        console.log("Failed to fetch slots, status:", slotsRes.status);
        setSlots([]);
        setPriceData({});
      }

      // Set empty events for now
      setEvents([]);

    } catch (err) {
      console.error("Error fetching calendar data:", err);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Date click handler
  const handleDateClick = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(dateStr);

    // Get slots for this date
    const dateSlotsAvailable = slots.filter(slot => slot.date === dateStr);
    const dateAppointments = events.filter(event =>
      event.slotId?.date === dateStr
    );

    setSelectedDateSlots(dateSlotsAvailable);
    setShowSlotModal(true);
  };

  const handleBookingSuccess = (newAppointment) => {
    setEvents(prev => [newAppointment, ...prev]);
    setShowBookingModal(false);
    fetchCalendarData(); // Refresh data
  };

  const closeSlotModal = () => {
    setShowSlotModal(false);
    setSelectedDate(null);
    setSelectedDateSlots([]);
  };

  // Calendar helper functions
  const getCurrentMonthInfo = () => {
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month as date objects
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(event => event.slotId?.date === dateStr);
  };

  const getSlotsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return slots.filter(slot => slot.date === dateStr);
  };

  const getDateStatus = (date) => {
    const dateAppointments = getAppointmentsForDate(date);
    const dateSlots = getSlotsForDate(date);

    if (dateSlots.length === 0) return 'unavailable'; // No slots available

    const totalCapacity = dateSlots.reduce((sum, slot) => sum + slot.capacity, 0);
    const bookedCount = dateSlots.reduce((sum, slot) => sum + slot.bookedCount, 0);

    if (bookedCount >= totalCapacity) return 'fully-booked';
    if (bookedCount > 0) return 'partially-booked';
    return 'available';
  };

  const getDateColor = (date, status) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today.setHours(0, 0, 0, 0);

    if (isPast) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    if (isToday) return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';

    switch (status) {
      case 'fully-booked': return 'bg-red-100 text-red-800 cursor-not-allowed';
      case 'partially-booked': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer';
      case 'available': return 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
      default: return 'bg-gray-50 text-gray-500 cursor-not-allowed';
    }
  };

  const { year, month, monthName } = getCurrentMonthInfo();
  const days = getDaysInMonth(year, month);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="fade-in" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Enhanced background elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(40, 73, 208, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '10%',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }}></div>
        
        <div className="modern-card" style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
            borderRadius: '16px',
            padding: '16px',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
          }}>
            <FaCalendarAlt style={{ color: 'white', fontSize: '24px' }} />
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #2849D0',
            borderRadius: '50%',
            margin: '0 auto 24px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 8px 0',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>ITSO Calendar</h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            margin: '0',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>Loading appointment calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="modern-card" style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            borderRadius: '16px',
            padding: '16px',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
          }}>
            <FaExclamationTriangle style={{ color: 'white', fontSize: '24px' }} />
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#dc2626',
            margin: '0 0 16px 0',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>Error Loading Calendar</h2>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>{error}</p>
          <button
            onClick={fetchCalendarData}
            className="hover-pop"
            style={{
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(40, 73, 208, 0.3)'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative'
    }}>
      {/* Enhanced background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '12%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 16s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite'
      }}></div>

      {/* Modern Header */}
      <header className="slide-down" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
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
            padding: '32px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
              }}>
                <FaCalendarAlt style={{ color: 'white', fontSize: '24px' }} />
              </div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 48px)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                letterSpacing: '-0.02em'
              }}>Calendar</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{
                color: '#374151',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>Welcome, {user?.email || "User"}</span>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(100, 116, 139, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(100, 116, 139, 0.3)';
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 5
      }}>
        <div>
          {/* Modern ITSO Calendar Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
              borderRadius: '50%',
              filter: 'blur(20px)'
            }}></div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 2
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      📅 {monthName}
                    </h1>
                    <p className="text-sm text-gray-600">ITSO Student ID Services</p>
                  </div>

                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                    ✨ FREE for all students
                  </div>
                  <button
                    onClick={goToToday}
                    className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Calendar */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return (
                      <div key={index} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>
                    );
                  }

                  const status = getDateStatus(day);
                  const appointments = getAppointmentsForDate(day);
                  const availableSlots = getSlotsForDate(day);
                  const today = new Date();
                  const isToday = day.toDateString() === today.toDateString();
                  const isPast = day < today.setHours(0, 0, 0, 0);

                  return (
                    <div
                      key={index}
                      onClick={() => !isPast && handleDateClick(day)}
                      className={`min-h-[120px] p-2 border border-gray-200 transition-all duration-200 ${getDateColor(day, status)}`}
                    >
                      {/* Date number */}
                      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-900' : ''}`}>
                        {day.getDate()}
                      </div>

                      {/* Appointments */}
                      <div className="space-y-1">
                        {appointments.slice(0, 2).map((appointment, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-1 rounded bg-blue-200 text-blue-800 truncate"
                            title={`${appointment.slotId?.start} - ${appointment.slotId?.purpose}`}
                          >
                            {appointment.slotId?.start} - {appointment.slotId?.purpose?.replace('_', ' ')}
                          </div>
                        ))}

                        {appointments.length > 2 && (
                          <div className="text-xs text-gray-600 text-center">
                            +{appointments.length - 2} more
                          </div>
                        )}
                      </div>

                      {/* Availability indicator */}
                      {!isPast && availableSlots.length > 0 && (
                        <div className="mt-2 text-xs">
                          {status === 'available' && (
                            <span className="text-green-700 font-medium">
                              {availableSlots.reduce((sum, slot) => sum + (slot.capacity - slot.bookedCount), 0)} slots
                            </span>
                          )}
                          {status === 'partially-booked' && (
                            <span className="text-yellow-700 font-medium">
                              {availableSlots.reduce((sum, slot) => sum + (slot.capacity - slot.bookedCount), 0)} left
                            </span>
                          )}
                          {status === 'fully-booked' && (
                            <span className="text-red-700 font-medium">Full</span>
                          )}
                        </div>
                      )}

                      {isPast && (
                        <div className="mt-2 text-xs text-gray-400">Past</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ITSO Appointment Legend */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-3 sm:p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">ITSO Appointment Calendar Guide</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span className="text-gray-700">Available for booking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                  <span className="text-gray-700">Limited slots remaining</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div>
                  <span className="text-gray-700">Fully booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                  <span className="text-gray-700">Today</span>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>📋 How to book:</strong> Click on any available date (green or yellow) to see time slots for New ID, Renewal, or Lost/Replacement services. All ITSO services are FREE for students.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Events */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Appointments
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Upcoming ITSO appointments synced with Google Calendar
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <li className="px-4 py-4 sm:px-6">
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any upcoming appointments.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                events.map((event, index) => (
                  <li key={event.id || index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">📅</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {event.summary || "ITSO Appointment"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {event.location || "NU Dasmarinas ITSO Office"}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.start).toLocaleDateString()} at{" "}
                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Refresh Button */}
          <div className="mt-6 text-center">
            <button
              onClick={fetchCalendarEvents}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Events
            </button>
          </div>
        </div>
      </main>

      {/* Date Slot Modal */}
      {showSlotModal && selectedDate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <button
                  onClick={closeSlotModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Available ITSO Appointment Slots */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">📋 Available ITSO Services</h4>
                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                    FREE for students
                  </div>
                </div>

                {selectedDateSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No ITSO services available</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      There are no student ID appointment slots available for this date. Please try another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedDateSlots.map((slot) => {
                      const isFullyBooked = slot.bookedCount >= slot.capacity;
                      const availableSpots = slot.capacity - slot.bookedCount;

                      // Service type icons and descriptions
                      const serviceInfo = {
                        'NEW_ID': { icon: '🆕', name: 'New Student ID', desc: 'For first-time students or new enrollment' },
                        'RENEWAL': { icon: '🔄', name: 'ID Renewal', desc: 'Renew your existing student ID' },
                        'LOST_REPLACEMENT': { icon: '🔍', name: 'Lost/Replacement ID', desc: 'Replace lost or damaged student ID' }
                      };

                      const service = serviceInfo[slot.purpose] || { icon: '📋', name: slot.purpose, desc: 'ITSO Service' };

                      return (
                        <div
                          key={slot._id}
                          className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                            isFullyBooked
                              ? 'border-red-300 bg-red-50'
                              : 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-400 cursor-pointer transform hover:scale-105'
                          }`}
                          onClick={() => !isFullyBooked && setShowBookingModal(true)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-3">{service.icon}</span>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {service.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {service.desc}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-700">
                                  🕐 {slot.start} - {slot.end}
                                </div>
                                <div className={`text-xs font-medium px-2 py-1 rounded ${
                                  isFullyBooked
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {isFullyBooked
                                    ? '❌ Fully Booked'
                                    : `✅ ${availableSpots} spot${availableSpots !== 1 ? 's' : ''} available`
                                  }
                                </div>
                              </div>
                            </div>

                            {!isFullyBooked && (
                              <div className="ml-4">
                                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                  📅 Book Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Admin Tools */}
                {user?.role === 'admin' && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Admin Tools</h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          // TODO: Implement create slot functionality
                          alert('Create slot functionality coming soon!');
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Add Slot
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement manage slots functionality
                          alert('Manage slots functionality coming soon!');
                        }}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Manage Slots
                      </button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeSlotModal}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
        preSelectedDate={selectedDate}
      />
    </div>
  );
}

export default Calendar;
