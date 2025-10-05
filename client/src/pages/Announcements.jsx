import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import API_URL from '../api';
import nuLogo from '../assets/images/nu-logo.png';
import { FaBullhorn, FaSearch, FaCalendarAlt, FaUser, FaArrowRight } from 'react-icons/fa';

function Announcements() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  // Live announcements from API
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const run = async () => {
      const endpoint = `${API_URL}/announcements${search ? `?q=${encodeURIComponent(search)}` : ''}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setList(data.items || []);
      }
    };
    run();
  }, [search]);

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '8%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 15s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '5%',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite reverse'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        right: '20%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite'
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
              <FaBullhorn style={{ color: 'white', fontSize: '24px' }} />
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
              ITSO Announcements
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
            Stay updated with the latest news and important information from the ITSO office.
          </p>
        </div>

        {/* Modern Search Bar */}
        <div className="modern-card fade-in" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          animationDelay: '0.3s'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search announcements..."
              style={{
                width: '100%',
                padding: '16px 20px 16px 56px',
                borderRadius: '16px',
                border: '2px solid rgba(40, 73, 208, 0.1)',
                fontSize: '16px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                background: 'white',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = '#2849D0';
                e.target.style.boxShadow = '0 0 0 4px rgba(40, 73, 208, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(40, 73, 208, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}>
              <FaSearch style={{ fontSize: '16px' }} />
            </div>
          </div>
        </div>

        {/* Modern Announcements List */}
        <div style={{
          display: 'grid',
          gap: '24px'
        }}>
          {list.length === 0 && (
            <div className="modern-card fade-in" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <FaBullhorn style={{ 
                fontSize: '48px', 
                color: '#cbd5e1', 
                marginBottom: '16px' 
              }} />
              <p style={{
                color: '#64748b',
                fontSize: '18px',
                fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
              }}>
                No announcements available at the moment.
              </p>
            </div>
          )}
          {list.map((item, index) => (
            <div 
              key={item._id}
              className="modern-card hover-pop scale-in"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                animationDelay: `${0.1 * index}s`
              }}
              onClick={() => {
                setSelectedAnnouncement(item);
                setShowAnnouncementModal(true);
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
                  borderRadius: '12px',
                  padding: '12px',
                  flexShrink: 0
                }}>
                  <FaBullhorn style={{ color: 'white', fontSize: '20px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '12px',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    lineHeight: '1.3'
                  }}>
                    {item.title}
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    {item.content?.length > 200 ? item.content.slice(0, 200) + '...' : item.content}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#64748b',
                      fontSize: '14px',
                      fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                    }}>
                      <FaCalendarAlt style={{ fontSize: '14px' }} />
                      <span>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnouncement(item);
                        setShowAnnouncementModal(true);
                      }}
                      className="hover-pop"
                      style={{
                        background: 'linear-gradient(135deg, #fde047, #fbbf24)',
                        color: '#1e40af',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(253, 224, 71, 0.3)'
                      }}
                    >
                      Read More
                      <FaArrowRight style={{ fontSize: '12px' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
                Paliparan III, Bridge SM Dasmariñas, Governor's Dr. Dasmariñas, Cavite, Philippines<br/>
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

      {/* Announcement Modal */}
      {showAnnouncementModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  <span className="text-blue-600">Announcement</span> Details
                </h2>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAnnouncementModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {selectedAnnouncement.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FaCalendarAlt />
                  <span className="text-sm">
                    {new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                  {selectedAnnouncement.content}
                </p>
              </div>

              {selectedAnnouncement.images?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Images</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedAnnouncement.images.map((src, idx) => (
                      <img 
                        key={idx} 
                        src={src} 
                        alt={`announcement-${idx}`} 
                        className="w-full rounded-lg shadow-md" 
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedAnnouncement.links?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Related Links</h4>
                  <div className="space-y-2">
                    {selectedAnnouncement.links.map((href, idx) => (
                      <a 
                        key={idx}
                        href={href} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block text-blue-600 hover:text-blue-800 underline break-all text-sm"
                      >
                        {href}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={closeLogin}
      />
    </div>
  );
}

export default Announcements;

