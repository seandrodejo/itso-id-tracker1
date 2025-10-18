import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import API_URL from "../api";
import LoginModal from "../components/LoginModal";
import nuLogo from "../assets/images/nu-logo.png";
import landingBackground from "../assets/images/landingbackground.png";
import calendarIcon from "../assets/images/calendar.png";
import { FaCalendarAlt, FaEnvelope, FaBuilding, FaCheckCircle } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  // Latest announcements for landing page
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements?limit=3`);
        if (res.ok) {
          const data = await res.json();
          setLatestAnnouncements(data.items || []);
        }
      } catch (e) {
        console.error('Failed to load latest announcements', e);
      }
    };
    run();
  }, []);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      try {
        // Decode the token
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('LandingPage: User already logged in', decoded);
        
        // Check if admin and redirect accordingly
        if (decoded.role === 'admin') {
          console.log('LandingPage: Redirecting admin to admin dashboard');
          navigate("/admin");
        } else {
          console.log('LandingPage: Redirecting user to dashboard');
          navigate("/dashboard");
        }
      } catch (err) {
        console.error('LandingPage: Error decoding token', err);
        // Invalid token, remove it
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);





  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
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

      {/* Modern Navigation Header*/}
      <nav style={{
        background: 'rgba(40, 73, 208, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '0 clamp(16px, 4vw, 24px)',
        boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="nav-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
          alignItems: 'center',
          height: 'clamp(60px, 8vh, 80px)',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          gap: 'clamp(12px, 3vw, 24px)'
        }}>
          {/* Left: Logo and Brand */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-start'
          }}>
            <div style={{
              width: 'min(48px, max(32px, 6vw))',
              height: 'min(48px, max(32px, 6vw))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'min(12px, max(8px, 2vw))'
            }}>
              <img src={nuLogo} alt="NU Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div className="nav-logo-text" style={{
                fontFamily: 'montserrat',
                color: '#fde047',
                fontWeight: 'bold',
                fontSize: 'clamp(14px, min(3vw, 18px), 18px)',
                whiteSpace: 'nowrap'
              }}>
                NU Dasmarinas
              </div>
              <div className="nav-logo-text" style={{
                fontFamily: 'montserrat',
                color: '#fde047',
                fontSize: 'clamp(12px, min(2.5vw, 16px), 16px)',
                whiteSpace: 'nowrap',
                fontWeight: 'bold'
              }}>
                ITSO ID Tracker
              </div>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <div className="nav-links" style={{
            display: 'flex',
            gap: 'clamp(16px, 4vw, 32px)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link to="/" className="link-underline" style={{
              color: location.pathname === '/' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(12px, 2vw, 16px)'
            }}>Home</Link>
            <Link to="/calendar-public" className="link-underline" style={{
              color: location.pathname === '/calendar-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(12px, 2vw, 16px)'
            }}>Calendar</Link>
            <Link to="/announcements-public" className="link-underline" style={{
              color: location.pathname === '/announcements-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(12px, 2vw, 16px)'
            }}>Announcements</Link>
            <Link to="/about-public" className="link-underline" style={{
              color: location.pathname === '/about-public' ? '#fde047' : '#93c5fd',
              textDecoration: 'none',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(12px, 2vw, 16px)'
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
              className="nav-button"
              style={{
                background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                color: '#1e3a8a',
                padding: 'clamp(8px, 2vh, 10px) clamp(16px, 4vw, 22px)',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.05)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                whiteSpace: 'nowrap',
                boxShadow: '0 10px 20px rgba(251, 191, 36, 0.25)'
              }}
            >
              Log In
            </button>


          </div>
        </div>
      </nav>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          margin: '16px',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: '#dc2626',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>!</span>
            </div>
            <div>
              <p style={{ color: '#dc2626', margin: '0', fontWeight: '500' }}>
                {error}
              </p>
            </div>
            <button
              onClick={() => setError('')}
              style={{
                marginLeft: 'auto',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section" style={{
        backgroundImage: `url(${landingBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        minHeight: 'clamp(400px, 80vh, 700px)',
        height: 'clamp(400px, 80vh, 700px)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 20px)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginLeft: 'clamp(0px, 25vw, 310px)'
        }}>
          {/* Right side - Text content */}
          <div className="slide-up hero-content" style={{
            maxWidth: '600px',
            textAlign: 'left',
            position: 'relative'
          }}>
            {/* Decorative background elements */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(40, 73, 208, 0.1), rgba(59, 130, 246, 0.1))',
              borderRadius: '50%',
              filter: 'blur(40px)',
              zIndex: -1,
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            
            <div style={{
              position: 'absolute',
              bottom: '50px',
              right: '-50px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.2), rgba(251, 191, 36, 0.2))',
              borderRadius: '50%',
              filter: 'blur(30px)',
              zIndex: -1,
              animation: 'float 4s ease-in-out infinite reverse'
            }}></div>

            {/* Main heading with gradient text */}
            <h1 className="hero-title" style={{
              fontSize: 'clamp(60px, 8vw, 100px)',
              fontWeight: '900',
              marginBottom: '8px',
              lineHeight: '0.95',
              background: 'linear-gradient(135deg, #2849D0 0%, #3b82f6 50%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 4px 20px rgba(40, 73, 208, 0.3)',
              letterSpacing: '-0.02em',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              Welcome
            </h1>
            
            {/* Subtitle with modern typography */}
            <div style={{
              marginBottom: '24px',
              marginLeft: '4px'
            }}>
              <h2 className="hero-subtitle" style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: '#1e293b',
                marginBottom: '0',
                fontWeight: '600',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                to{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700'
                }}>
                  ITSO ID Tracker
                </span>
                !
              </h2>
            </div>
            
            {/* Description with better spacing and typography */}
            <p className="hero-description" style={{
              fontSize: '20px',
              color: '#64748b',
              marginBottom: '32px',
              marginLeft: '4px',
              lineHeight: '1.6',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              fontWeight: '400',
              maxWidth: '480px'
            }}>
              Streamline your student ID appointments with our modern, 
              <span style={{ color: '#2849D0', fontWeight: '500' }}> intuitive platform</span> 
              {' '}designed for efficiency and convenience.
            </p>
            
            {/* Modern CTA button with enhanced styling */}
            <div style={{ marginLeft: '4px' }}>
              <button
                onClick={openLogin}
                className="hover-pop modern-button"
                style={{
                  background: 'linear-gradient(135deg, #2849D0 0%, #3b82f6 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3), 0 4px 16px rgba(40, 73, 208, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 12px 40px rgba(40, 73, 208, 0.4), 0 8px 24px rgba(40, 73, 208, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(40, 73, 208, 0.3), 0 4px 16px rgba(40, 73, 208, 0.2)';
                }}
              >
                <span>Get Started</span>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiArrowUpRight size={18} />
                </div>
              </button>
              
              {/* Secondary action */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '14px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <span>Trusted by NU Dasmarinas students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section - Modernized */}
      <section className="fade-in" style={{
        background: 'linear-gradient(135deg, #2849D0 0%, #1e40af 50%, #1e3a8a 100%)',
        padding: '80px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }}></div>

        <div className="fade-in" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          <div className="calendar-grid" style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            minHeight: '200px'

          }}>
            {/* NU Logo with modern styling and animation */}
            <div className="slide-up calendar-item" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minWidth: 'min(200px, 25vw)',
              flex: '0 0 auto'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                animation: 'floatSlow 6s ease-in-out infinite'
              }}>
                <img 
                  src={nuLogo} 
                  alt="NU Logo" 
                  className="wiggle-hover"
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </div>
              {/* Decorative glow effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(253, 224, 71, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 4s ease-in-out infinite',
                zIndex: -1
              }}></div>
            </div>

            {/* Modern connector line */}
            <div className="slide-up calendar-item" style={{
              width: '3px',
              height: 'min(100px, 15vh)',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(253, 224, 71, 0.8), rgba(255, 255, 255, 0.6))',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(253, 224, 71, 0.3)',
              flex: '0 0 auto',
              alignSelf: 'center'
            }}></div>

            {/* Center Text with enhanced styling */}
            <div className="slide-up calendar-item calendar-center" style={{
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: 'clamp(16px, 4vw, 32px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: 'min(400px, 60vw)',
              maxWidth: '500px',
              flex: '1 1 auto'
            }}>
              <div style={{ 
                color: '#fde047', 
                fontSize: '18px', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontWeight: '500',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                Seamlessly Synced with
              </div>
              <div style={{ 
                fontSize: 'clamp(28px, 4vw, 36px)', 
                fontWeight: '800', 
                color: 'white', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #ffffff, #fde047)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                letterSpacing: '-0.01em'
              }}>
                Google Calendar
              </div>
              <div style={{ 
                color: '#e0e7ff', 
                fontSize: '16px',
                lineHeight: '1.6',
                maxWidth: '420px',
                margin: '0 auto',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                fontWeight: '400'
              }}>
                Your appointments are automatically synced to your Google Calendar and maintained by the 
                <span style={{ color: '#fde047', fontWeight: '500' }}> ITSO Department</span> of NU Dasmarinas 
                to make your life easier and more convenient.
              </div>
            </div>

            {/* Modern connector line */}
            <div className="slide-up calendar-item" style={{
              width: '3px',
              height: 'min(100px, 15vh)',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(253, 224, 71, 0.8), rgba(255, 255, 255, 0.6))',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(253, 224, 71, 0.3)',
              flex: '0 0 auto',
              alignSelf: 'center'
            }}></div>

            {/* Calendar Icon with modern styling and enhanced animation */}
            <div className="slide-up calendar-item" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minWidth: 'min(200px, 25vw)',
              flex: '0 0 auto'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                animation: 'floatSlow 7s ease-in-out infinite reverse'
              }}>
                <img 
                  src={calendarIcon} 
                  alt="Google Calendar" 
                  className="wiggle-hover"
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </div>
              {/* Decorative glow effect */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '160px',
                height: '160px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'pulse 3s ease-in-out infinite',
                zIndex: -1
              }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Modernized */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
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
          animation: 'float 10s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Modern Title */}
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #2849D0 0%, #3b82f6 50%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              lineHeight: '1.6'
            }}>
              Get your student ID in just four simple steps. Our streamlined process makes it quick and convenient.
            </p>
          </div>

          {/* Modern Progress Line with Enhanced Dots */}
          <div style={{
            position: 'relative',
            marginBottom: '60px',
            height: '6px'
          }}>
            {/* Gradient Background Line */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '11.5%',
              right: '11.5%',
              height: '6px',
              background: 'linear-gradient(90deg, #2849D0, #3b82f6, #fbbf24, #10b981)',
              transform: 'translateY(-50%)',
              borderRadius: '3px',
              boxShadow: '0 2px 10px rgba(40, 73, 208, 0.3)'
            }}></div>
            
            
          </div>

          {/* Modern Steps Cards */}
          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
            gap: 'clamp(16px, 3vw, 32px)',
            marginTop: 'clamp(20px, 5vh, 40px)'
          }}>
            {/* Step 1: Book - Enhanced */}
            <div className="hover-pop slide-in-up" style={{
              background: 'linear-gradient(135deg, #2849D0 0%, #3b82f6 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(40, 73, 208, 0.2), 0 4px 16px rgba(40, 73, 208, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animationDelay: '0.1s'
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white'
              }}>1</div>
              
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <FaCalendarAlt style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontWeight: '700',
                fontSize: '22px',
                marginBottom: '16px',
                color: 'white',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Book Appointment
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Select your preferred date and time through our intuitive online booking system.
              </p>
            </div>

            {/* Step 2: Get Email - Enhanced */}
            <div className="hover-pop slide-in-up" style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(124, 58, 237, 0.2), 0 4px 16px rgba(124, 58, 237, 0.1)',
              animationDelay: '0.2s',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white'
              }}>2</div>
              
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <FaEnvelope style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontWeight: '700',
                fontSize: '22px',
                marginBottom: '16px',
                color: 'white',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Receive Confirmation
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Get instant email confirmation with all appointment details and instructions.
              </p>
            </div>

            {/* Step 3: Visit ITSO - Enhanced */}
            <div className="hover-pop slide-in-up" style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(245, 158, 11, 0.2), 0 4px 16px rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animationDelay: '0.3s'
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.24)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: '#ffffffff'
              }}>3</div>
              
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(255, 255, 255, 0.24)'
              }}>
                <FaBuilding style={{ fontSize: '32px', color: '#ffffffff' }} />
              </div>
              <h3 style={{
                fontWeight: '700',
                fontSize: '22px',
                marginBottom: '16px',
                color: '#ffffffff',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Visit ITSO Office
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#ffffffff',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Arrive at the ITSO office on your scheduled appointment date and time.
              </p>
            </div>

            {/* Step 4: Claim - Enhanced */}
            <div className="hover-pop slide-in-up" style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '24px',
              padding: '40px 32px',
              textAlign: 'center',
              boxShadow: '0 10px 40px rgba(255, 255, 255, 0.2), 0 4px 16px rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              animationDelay: '0.4s',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {/* Step number */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white'
              }}>4</div>
              
              <div style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px auto',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <FaCheckCircle style={{ fontSize: '32px', color: 'white' }} />
              </div>
              <h3 style={{
                fontWeight: '700',
                fontSize: '22px',
                marginBottom: '16px',
                color: 'white',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Claim Your ID
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                Complete the process and receive your brand new student ID card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Announcements Section - Modernized */}
      <section style={{
        padding: '100px 20px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '5%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 9s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(40, 73, 208, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite reverse'
        }}></div>

        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: '16px',
              color: '#1f2937',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              Latest Announcements
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#374151',
              maxWidth: '600px',
              margin: '0 auto',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              lineHeight: '1.6'
            }}>
              Stay updated with the latest news and important information from ITSO.
            </p>
          </div>

          {/* Modern Container with Glass Effect */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            {latestAnnouncements.length === 0 && (
              <div style={{ 
                color: '#6b7280', 
                textAlign: 'center',
                fontSize: '18px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                padding: '40px 0'
              }}>
                No announcements yet.
              </div>
            )}
            {latestAnnouncements.map((item, idx) => (
              <div key={item._id} className="hover-pop" style={{
                background: idx % 2 === 0 
                  ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                  : 'linear-gradient(135deg, #2849D0 0%, #3b82f6 100%)',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: idx === latestAnnouncements.length - 1 ? '0' : '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                border: idx % 2 === 0 
                  ? '1px solid rgba(40, 73, 208, 0.1)' 
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: idx % 2 === 0 
                  ? '0 4px 20px rgba(40, 73, 208, 0.08)' 
                  : '0 4px 20px rgba(40, 73, 208, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Modern indicator dot */}
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: idx % 2 === 0 
                    ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                    : 'linear-gradient(135deg, #fde047, #fbbf24)',
                  borderRadius: '50%',
                  marginTop: '8px',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
                  animation: 'pulse 3s infinite'
                }}></div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: idx % 2 === 0 ? '#1f2937' : 'white',
                    marginBottom: '12px',
                    margin: '0 0 12px 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    letterSpacing: '-0.01em'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: idx % 2 === 0 ? '#64748b' : 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    margin: '0 0 16px 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    {item.content?.length > 140 ? item.content.slice(0, 140) + '…' : item.content}
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: idx % 2 === 0 ? '#9ca3af' : 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '16px',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    fontWeight: '500'
                  }}>
                    📅 {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/announcements-public')} 
                  className="modern-button"
                  style={{
                    background: idx % 2 === 0 
                      ? 'linear-gradient(135deg, #2849D0, #3b82f6)' 
                      : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: idx % 2 === 0 ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    boxShadow: idx % 2 === 0 
                      ? '0 4px 12px rgba(40, 73, 208, 0.3)' 
                      : '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  Read More
                </button>
              </div>
            ))}

            {/* Modern View All Button */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button 
                onClick={() => navigate('/announcements-public')} 
                className="modern-button hover-pop"
                style={{
                  background: 'linear-gradient(135deg, #64748b, #475569)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  boxShadow: '0 4px 16px rgba(100, 116, 139, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 8px 24px rgba(100, 116, 139, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 4px 16px rgba(100, 116, 139, 0.3)';
                }}
              >
                <span>View All Announcements</span>
                <FiArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

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
          <div className="footer-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
            alignItems: 'start',
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
                  fontFamily: 'montserrat',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: '#fbbf24',
                  margin: '0 0 4px 0'
                }}>NU Dasmarinas</h3>
                <p style={{ 
                  fontFamily: 'montserrat',
                  color: '#fbbf24',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0'
                }}>ITSO ID Tracker</p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div style={{
            borderTop: '1px solid #64748b',
            paddingTop: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              marginBottom: '12px',
              flexWrap: 'wrap'
            }}>
              <Link
                to="/terms-and-conditions"
                style={{
                  color: '#cbd5e0',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}
              >
                Terms and Conditions
              </Link>
              <Link
                to="/privacy-policy"
                style={{
                  color: '#cbd5e0',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact-us"
                style={{
                  color: '#cbd5e0',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#fbbf24'}
                onMouseLeave={(e) => e.target.style.color = '#cbd5e0'}
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
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
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
    </div>
  );
}

export default LandingPage;

