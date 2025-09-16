import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import nuLogo from "../assets/images/nu-logo.png";
import { FaCalendarAlt, FaBullhorn, FaInfoCircle, FaUser } from 'react-icons/fa';

function AuthenticatedAnnouncements() {
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Get user info from token
  const token = localStorage.getItem("token");
  let user = null;
  
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Live announcements for authenticated users
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    const run = async () => {
      try {
        const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/announcements${search ? `?q=${encodeURIComponent(search)}` : ''}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setAnnouncements(data.items || []);
        }
      } catch (e) {
        console.error('Failed to load announcements', e);
      }
    };
    run();
  }, [search]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '6%',
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '18%',
        left: '4%',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 14s ease-in-out infinite reverse'
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
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px', height: '56px', background: 'rgba(253, 224, 71, 0.2)',
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)', border: '1px solid rgba(253, 224, 71, 0.3)',
                position: 'relative'
              }}>
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

      {/* Enhanced Page Title */}
      <div className="relative bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-sm border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.894A1 1 0 0018 16V3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Announcements</h1>
              <p className="text-gray-600">Stay updated with the latest news and important information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <input
                type="text"
                placeholder="Search announcements by title or content..."
                className="w-full px-6 py-4 pl-14 text-gray-800 placeholder-gray-500 bg-transparent focus:outline-none text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Search results count */}
          {search && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {announcements.length === 0 
                  ? 'No announcements found' 
                  : `Found ${announcements.length} announcement${announcements.length !== 1 ? 's' : ''}`
                }
                {search && (
                  <span className="ml-1">
                    for "<span className="font-medium text-blue-600">{search}</span>"
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Announcements Grid */}
      <div className="container mx-auto px-4 pb-12 flex-1 w-full">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Announcements Yet</h3>
            <p className="text-gray-600 text-center max-w-md">
              Check back later for important updates and announcements from the ITSO office.
            </p>
          </div>
        ) : (
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2
          }}>
            {announcements.map((item, index) => (
              <div 
                key={item._id}
                className="hover-pop"
                style={{
                  background: index % 2 === 0 
                    ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' 
                    : 'linear-gradient(135deg, #2849D0 0%, #3b82f6 100%)',
                  borderRadius: '20px',
                  padding: '28px',
                  marginBottom: index === announcements.length - 1 ? '0' : '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  border: index % 2 === 0 
                    ? '1px solid rgba(40, 73, 208, 0.1)' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: index % 2 === 0 
                    ? '0 4px 20px rgba(40, 73, 208, 0.08)' 
                    : '0 4px 20px rgba(40, 73, 208, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/announcements/${item._id}`)}
              >
                {/* Indicator dot to match landing page style */}
                <div style={{
                  width: '16px',
                  height: '16px',
                  background: index % 2 === 0 
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
                    color: index % 2 === 0 ? '#1f2937' : 'white',
                    margin: '0 0 12px 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    letterSpacing: '-0.01em'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: index % 2 === 0 ? '#64748b' : 'rgba(255, 255, 255, 0.9)',
                    lineHeight: '1.6',
                    margin: '0 0 16px 0',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
                  }}>
                    {item.content?.length > 140 ? item.content.slice(0, 140) + '…' : item.content}
                  </p>
                  <div style={{
                    fontSize: '14px',
                    color: index % 2 === 0 ? '#9ca3af' : 'rgba(255, 255, 255, 0.7)',
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/announcements/${item._id}`);
                  }}
                  className="modern-button"
                  style={{
                    background: index % 2 === 0 
                      ? 'linear-gradient(135deg, #2849D0, #3b82f6)'
                      : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: index % 2 === 0 ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
                    boxShadow: index % 2 === 0 
                      ? '0 4px 12px rgba(40, 73, 208, 0.3)'
                      : '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  Read More
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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

export default AuthenticatedAnnouncements;