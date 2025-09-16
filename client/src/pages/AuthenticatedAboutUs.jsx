import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import nuLogo from "../assets/images/nu-logo.png";
import { FaInfoCircle, FaUsers, FaEye, FaBullseye, FaHeart, FaGraduationCap, FaLightbulb, FaHandshake, FaBuilding, FaClock, FaIdCard, FaTools, FaShieldAlt, FaUser, FaChevronDown, FaSignOutAlt, FaCalendarAlt, FaBullhorn } from 'react-icons/fa';

function AuthenticatedAboutUs() {
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '12%',
        width: '320px',
        height: '320px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 22s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '12%',
        left: '6%',
        width: '240px',
        height: '240px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite reverse'
      }}></div>

      {/* Student Navigation Header (match Calendar Dashboard) */}
      <nav style={{
        background: 'linear-gradient(135deg, #2849D0 0%, #3b82f6 50%, #1e40af 100%)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', background: 'rgba(253, 224, 71, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '1px solid rgba(253, 224, 71, 0.3)', position: 'relative' }}>
                <img src={nuLogo} alt="NU Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '20px', background: 'linear-gradient(135deg, #fde047, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', letterSpacing: '-0.01em' }}>NU Dasmarinas</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(253, 224, 71, 0.9)', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>ITSO ID Tracker</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', padding: '12px 20px', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}
              ><span style={{display:'inline-flex',alignItems:'center',gap:'8px'}}><FaCalendarAlt /> Calendar</span></Link>
              <Link to="/announcements" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', padding: '12px 20px', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}
              ><span style={{display:'inline-flex',alignItems:'center',gap:'8px'}}><FaBullhorn /> Announcements</span></Link>
              <Link to="/about" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', padding: '12px 20px', borderRadius: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.transform = 'translateY(0)'; }}
              ><span style={{display:'inline-flex',alignItems:'center',gap:'8px'}}><FaInfoCircle /> About Us</span></Link>
            </div>

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} className="profile-dropdown-container">
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '600', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FaUser /> Hi, {user?.email?.split('@')[0] || 'User'}!
              </span>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #fde047, #fbbf24)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 4px 16px rgba(253, 224, 71, 0.3)', border: '2px solid rgba(255, 255, 255, 0.2)' }}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px) scale(1.05)'; e.target.style.boxShadow = '0 8px 24px rgba(253, 224, 71, 0.4)'; }}
                onMouseLeave={(e) => { e.target.style.transform = 'translateY(0) scale(1)'; e.target.style.boxShadow = '0 4px 16px rgba(253, 224, 71, 0.3)'; }}
              >
                <div style={{ width: '36px', height: '36px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#2849D0', fontWeight: '700', fontSize: '16px', fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
                    {(user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              {showProfileDropdown && (
                <div style={{ position: 'absolute', right: '0', top: '60px', width: '320px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '12px 16px', background: '#ef4444', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '48px 24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="modern-card slide-up" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '48px'
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
                  <FaInfoCircle style={{ color: 'white', fontSize: '24px' }} />
                </div>
                <h1 style={{
                  fontSize: 'clamp(32px, 5vw, 48px)',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: '0',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                  letterSpacing: '-0.02em'
                }}>
                  About Us
                </h1>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '32px',
              alignItems: 'start',
              marginBottom: '40px'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                    borderRadius: '12px',
                    padding: '8px'
                  }}>
                    <FaBuilding style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    NU Dasmarinas ITSO Office
                  </h2>
                </div>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  marginBottom: '24px',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  The Information Technology Services Office (ITSO) at NU Dasmarinas is dedicated to providing 
                  comprehensive IT support and services to our university community. We manage student ID cards, 
                  technical support, and digital infrastructure to ensure seamless academic operations.
                </p>
                <p style={{
                  color: '#64748b',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  Our ID Tracker system streamlines the process of ID card applications, renewals, and status 
                  tracking, making it easier for students to manage their identification needs.
                </p>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(40, 73, 208, 0.05), rgba(59, 130, 246, 0.05))',
                padding: '32px',
                borderRadius: '20px',
                border: '1px solid rgba(40, 73, 208, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                    borderRadius: '12px',
                    padding: '8px'
                  }}>
                    <FaInfoCircle style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2849D0',
                    margin: '0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    Office Information
                  </h3>
                </div>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#2849D0',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaBuilding style={{ color: 'white', fontSize: '14px' }} />
                    </div>
                    <span style={{
                      color: '#1f2937',
                      fontSize: '14px',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                    }}>
                      5th Floor, NU Dasmarinas
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#2849D0',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaClock style={{ color: 'white', fontSize: '14px' }} />
                    </div>
                    <span style={{
                      color: '#1f2937',
                      fontSize: '14px',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                    }}>
                      Mon-Fri: 8:00 AM - 5:00 PM
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#2849D0',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaClock style={{ color: 'white', fontSize: '14px' }} />
                    </div>
                    <span style={{
                      color: '#1f2937',
                      fontSize: '14px',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                    }}>
                      Saturday: 8:00 AM - 12:00 NN
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '40px'
            }}>
              <div className="modern-card hover-pop scale-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                animationDelay: '0.1s'
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
                  margin: '0 auto 20px auto',
                  boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
                }}>
                  <FaIdCard style={{ color: 'white', fontSize: '24px' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  ID Card Services
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  New ID applications, renewals, and replacements for lost or damaged cards.
                </p>
              </div>
              
              <div className="modern-card hover-pop scale-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                animationDelay: '0.2s'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '16px',
                  padding: '16px',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
                }}>
                  <FaShieldAlt style={{ color: 'white', fontSize: '24px' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  Online Tracking
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  Real-time status updates and appointment scheduling through our digital platform.
                </p>
              </div>
              
              <div className="modern-card hover-pop scale-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                animationDelay: '0.3s'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: '16px',
                  padding: '16px',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px auto',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                }}>
                  <FaTools style={{ color: 'white', fontSize: '24px' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '12px',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  Technical Support
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                }}>
                  Comprehensive IT support for students and faculty members.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Our Mission</h2>
              <p className="text-gray-600 text-center leading-relaxed max-w-3xl mx-auto">
                To provide efficient, reliable, and user-friendly IT services that support the academic 
                excellence and administrative efficiency of NU Dasmarinas. We are committed to leveraging 
                technology to enhance the educational experience and streamline administrative processes 
                for our university community.
              </p>
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
                Paliparan III, Bridge SM<br />
                Dasmariñas, Governor's<br />
                Dr. Dasmariñas,<br />
                Dasmariñas<br />
                Philippines
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
    </div>
  );
}

export default AuthenticatedAboutUs;