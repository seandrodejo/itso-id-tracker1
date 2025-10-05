import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import API_URL from '../api';
import nuLogo from '../assets/images/nu-logo.png';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const CalendarLanding = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // August 2025
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Current month's days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = year === today.getFullYear() && 
                   month === today.getMonth() && 
                   day === today.getDate();
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday
    });
  }
  
  // Next month's leading days
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false
    });
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + direction);
    setCurrentDate(newDate);
  };

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  // Stubbed Google signup handler to avoid runtime error
  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    // This app uses login-only flow; show message for now
    alert('Google Sign-In is currently disabled. Please use Log In.');
    setGoogleLoading(false);
  };

  // Optional: stub for opening signup modal if referenced
  const openSignup = () => {
    setIsLoginOpen(true);
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '15%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 25s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '10%',
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '5%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 15s ease-in-out infinite'
      }}></div>

      {/* Modern Navigation */}
      <nav style={{
        background: 'rgba(40, 73, 208, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 24px',
        boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: '80px',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          gap: '24px'
        }}>
          {/* Left: Logo and Brand */}
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
              marginRight: '12px',
              position: 'relative'
            }}>
              <img 
                src={nuLogo} 
                alt="NU Logo" 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  objectFit: 'contain'
                }} 
              />
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
            <Link to="/" className="link-underline" style={{
              color: location.pathname === '/' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>Home</Link>
            <Link to="/calendar-public" className="link-underline" style={{
              color: location.pathname === '/calendar-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>Calendar</Link>
            <Link to="/announcements-public" className="link-underline" style={{
              color: location.pathname === '/announcements-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>Announcements</Link>
            <Link to="/about-public" className="link-underline" style={{
              color: location.pathname === '/about-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>About Us</Link>
          </div>

          {/* Right: Login/Signup Buttons */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={openLogin}
              style={{
                background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                color: '#1e3a8a',
                padding: '10px 22px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                boxShadow: '0 10px 20px rgba(251, 191, 36, 0.25)'
              }}
              onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 12px 24px rgba(251, 191, 36, 0.35)'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 20px rgba(251, 191, 36, 0.25)'; }}
              className="modern-button hover-pop"
            >
              Log In
            </button>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="slide-in-up" style={{
        maxWidth: '1280px',
        margin: '40px auto',
        padding: '48px 24px',
        position: 'relative',
        zIndex: 2,
        animationDelay: '0.2s'
      }}>
        {/* Modern Page Header */}
        <div className="fade-in" style={{
          textAlign: 'center',
          marginBottom: '48px',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
            }}>
              <FaCalendarAlt style={{ color: 'white', fontSize: '24px' }} />
            </div>
            <h1 className="slide-in-up" style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #2849D0, #3b82f6, #1e40af)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing: '-0.02em',
              animationDelay: '0.1s'
            }}>
              Calendar
            </h1>
          </div>
          <p className="slide-in-up" style={{
            fontSize: '18px',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
            lineHeight: '1.6',
            animationDelay: '0.2s'
          }}>
            View available appointment slots and plan your visit to the ITSO office.
          </p>
        </div>

        {/* Calendar Section */}
        <div className="modern-card fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          animationDelay: '0.3s'
        }}>

          {/* Modern Calendar Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
            padding: '20px 32px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              className="hover-pop"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FaChevronLeft style={{ fontSize: '16px' }} />
            </button>
            
            <h2 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing: '-0.01em'
            }}>
              {monthNames[month]} {year}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="hover-pop"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
            >
              <FaChevronRight style={{ fontSize: '16px' }} />
            </button>
          </div>

          {/* Modern Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            backgroundColor: 'rgba(40, 73, 208, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '2px'
          }}>
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                style={{
                  background: 'linear-gradient(135deg, rgba(40, 73, 208, 0.1), rgba(59, 130, 246, 0.1))',
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  color: '#2849D0',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  letterSpacing: '0.5px'
                }}
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((dayObj, index) => (
              <div
                key={index}
                className={dayObj.isCurrentMonth ? 'hover-pop' : ''}
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: dayObj.isCurrentMonth ? '#1f2937' : '#9ca3af',
                  fontWeight: dayObj.isToday ? '700' : dayObj.isCurrentMonth ? '500' : '400',
                  backgroundColor: dayObj.isToday 
                    ? '#2849D0' 
                    : dayObj.isCurrentMonth 
                      ? 'white' 
                      : 'rgba(248, 250, 252, 0.5)',
                  cursor: dayObj.isCurrentMonth ? 'pointer' : 'default',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  fontSize: '16px',
                  ...(dayObj.isToday && { color: 'white', boxShadow: '0 4px 12px rgba(40, 73, 208, 0.4)' })
                }}
              >
                {dayObj.day}
              </div>
            ))}
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

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
      />
    </div>
  );
};

export default CalendarLanding;

