import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import nuLogo from '../assets/images/nu-logo.png';
import { FaInfoCircle, FaUsers, FaEye, FaBullseye, FaHeart, FaGraduationCap, FaLightbulb, FaHandshake, FaBuilding, FaClock, FaIdCard, FaTools, FaShieldAlt } from 'react-icons/fa';

function AboutUs() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  // Stubbed signup to reuse login modal and avoid runtime errors
  const openSignup = () => setIsLoginOpen(true);

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
        top: '10%',
        right: '10%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 20s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 16s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '15%',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 14s ease-in-out infinite'
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
              <FaInfoCircle style={{ color: 'white', fontSize: '24px' }} />
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
              About Us
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
            Learn more about the ITSO office and our commitment to serving students.
          </p>
        </div>

        {/* Hero Section */}
        <div className="modern-card fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          animationDelay: '0.3s'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '48px',
            alignItems: 'start'
          }}>
            <div>
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
                  <FaGraduationCap style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <h2 style={{
                  fontSize: '28px',
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

        {/* Mission Section */}
        <div className="modern-card fade-in" style={{
          background: 'linear-gradient(135deg, rgba(40, 73, 208, 0.05), rgba(59, 130, 246, 0.05))',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '40px',
          border: '1px solid rgba(40, 73, 208, 0.1)',
          textAlign: 'center',
          animationDelay: '0.4s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              borderRadius: '12px',
              padding: '8px'
            }}>
              <FaBullseye style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              Our Mission
            </h2>
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            lineHeight: '1.7',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>
            To provide efficient, reliable, and user-friendly IT services that support the academic 
            excellence and administrative efficiency of NU Dasmarinas. We are committed to leveraging 
            technology to enhance the educational experience and streamline administrative processes 
            for our university community.
          </p>
        </div>

        {/* Call to Action */}
        <div className="modern-card fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          animationDelay: '0.5s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              borderRadius: '12px',
              padding: '8px'
            }}>
              <FaHandshake style={{ color: 'white', fontSize: '20px' }} />
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              Ready to Get Started?
            </h2>
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            marginBottom: '32px',
            fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
          }}>
            Join our community and experience seamless ID management services.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={openLogin}
              className="hover-pop"
              style={{
                background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(40, 73, 208, 0.3)'
              }}
            >
              Log In
            </button>
            <button
              onClick={openSignup}
              className="hover-pop"
              style={{
                background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                color: '#1e40af',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(253, 224, 71, 0.3)'
              }}
            >
              Sign Up
            </button>
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
      />
    </div>
  );
}

export default AboutUs;