import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:5000/api";

function SimpleCalendar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchSlots();
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  // Refetch slots when month changes
  useEffect(() => {
    if (user) {
      fetchSlots();
    }
  }, [currentDate]);

  const fetchSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/slots/available`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data);
        console.log("Fetched slots:", data);
      } else {
        setError("Failed to fetch slots");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click
  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const daySlots = slots.filter(slot => slot.date === dateStr);

    if (daySlots.length > 0) {
      setSelectedDate(dateStr);
      // Here you can open a modal or navigate to booking
      alert(`Selected ${dateStr} with ${daySlots.length} available slots`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchSlots}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calendar grid calculation
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Helper function to get slots for a specific date
  const getSlotsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return slots.filter(slot => slot.date === dateStr);
  };

  // Helper function to check if date is today
  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear();
  };

  // Helper function to check if date is in the past
  const isPastDate = (day) => {
    const dateToCheck = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateToCheck < todayDate;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '12%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '8%',
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 14s ease-in-out infinite reverse'
      }}></div>

      {/* Modern Header */}
      <header style={{
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
            padding: '24px 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                letterSpacing: '-0.02em'
              }}>📅 ITSO Calendar</h1>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{
                color: '#64748b',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                fontWeight: '500'
              }}>Welcome, {user?.email || "User"}</span>
              <button
                onClick={() => navigate("/dashboard")}
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
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 16px rgba(40, 73, 208, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(40, 73, 208, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(40, 73, 208, 0.3)';
                }}
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(107, 114, 128, 0.1)',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(107, 114, 128, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(107, 114, 128, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '40px 24px',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ padding: '0' }}>

          {/* Calendar Header with Navigation */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToToday}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Today
                  </button>
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ITSO Calendar Grid - NBI Style */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              {/* Calendar Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', border: '1px solid #d1d5db' }}>
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} style={{
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    padding: '16px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  if (!day) {
                    return (
                      <div key={index} style={{
                        backgroundColor: '#f9fafb',
                        border: '1px solid #d1d5db',
                        minHeight: '120px'
                      }}></div>
                    );
                  }

                  const daySlots = getSlotsForDate(day);
                  const todayCheck = isToday(day);
                  const pastDate = isPastDate(day);

                  // Group slots by time period
                  const morningSlots = daySlots.filter(slot => {
                    const hour = parseInt(slot.start.split(':')[0]);
                    return hour < 12;
                  });

                  const afternoonSlots = daySlots.filter(slot => {
                    const hour = parseInt(slot.start.split(':')[0]);
                    return hour >= 12;
                  });

                  return (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #d1d5db',
                        minHeight: '120px',
                        padding: '8px',
                        position: 'relative',
                        backgroundColor: pastDate ? '#f3f4f6' : todayCheck ? '#dbeafe' : '#ffffff',
                        borderColor: todayCheck ? '#93c5fd' : '#d1d5db'
                      }}
                    >
                      {/* Date number */}
                      <div style={{
                        fontSize: '14px',
                        fontWeight: todayCheck ? 'bold' : '500',
                        marginBottom: '8px',
                        color: todayCheck ? '#2563eb' : pastDate ? '#9ca3af' : '#111827'
                      }}>
                        {day}
                        {todayCheck && (
                          <span style={{
                            marginLeft: '4px',
                            fontSize: '10px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '4px'
                          }}>TODAY</span>
                        )}
                      </div>

                      {/* Morning slots */}
                      {morningSlots.length > 0 && !pastDate && (
                        <button
                          onClick={() => handleDateClick(day)}
                          style={{
                            width: '100%',
                            marginBottom: '4px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          <div style={{ fontWeight: '600' }}>AM</div>
                          <div>{morningSlots.reduce((sum, slot) => sum + (slot.capacity - slot.bookedCount), 0)} Slots</div>
                        </button>
                      )}

                      {/* Afternoon slots */}
                      {afternoonSlots.length > 0 && !pastDate && (
                        <button
                          onClick={() => handleDateClick(day)}
                          style={{
                            width: '100%',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                        >
                          <div style={{ fontWeight: '600' }}>PM</div>
                          <div>{afternoonSlots.reduce((sum, slot) => sum + (slot.capacity - slot.bookedCount), 0)} Slots</div>
                        </button>
                      )}

                      {/* No slots available */}
                      {daySlots.length === 0 && !pastDate && (
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textAlign: 'center',
                          marginTop: '16px'
                        }}>
                          No slots
                        </div>
                      )}

                      {/* Past date indicator */}
                      {pastDate && (
                        <div style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          textAlign: 'center',
                          marginTop: '16px'
                        }}>
                          Past
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend and Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Legend */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold mb-4">📋 Calendar Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Available ITSO appointment slots</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Today</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 rounded mr-3"></div>
                    <span className="text-sm text-gray-700">Past dates / No slots</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold mb-4">📊 Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total available slots:</span>
                    <span className="text-sm font-medium text-gray-900">{slots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current month:</span>
                    <span className="text-sm font-medium text-gray-900">{monthName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available services:</span>
                    <span className="text-sm font-medium text-gray-900">New ID, Renewal, Replacement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">How to book an appointment</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Click on any blue slot button (AM or PM) to view available appointment times and book your ITSO service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SimpleCalendar;
