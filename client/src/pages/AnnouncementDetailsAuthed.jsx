import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import nuLogo from "../assets/images/nu-logo.png";
import API_URL from '../api';

function AnnouncementDetailsAuthed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');
    try { setUser(jwtDecode(token)); } catch {}
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements/${id}`);
        if (!res.ok) throw new Error('Announcement not found');
        const data = await res.json();
        setAnnouncement(data);
      } catch (e) {
        setError(e.message);
      } finally { setLoading(false); }
    };
    run();
  }, [id, navigate]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

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
        top: '10%',
        right: '10%',
        width: '280px',
        height: '280px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.07) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 16s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '220px',
        height: '220px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 12s ease-in-out infinite reverse'
      }}></div>

      {/* Modern Header */}
      <header style={{
        background: 'rgba(40, 73, 208, 0.95)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        boxShadow: '0 8px 32px rgba(40, 73, 208, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={nuLogo} alt="NU Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: '#fde047' }}>NU Dasmarinas</div>
                <div className="text-sm font-bold" style={{ color: '#fde047' }}>ITSO ID Tracker</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className="text-white transition-colors link-underline"
                style={{ ':hover': { color: '#fde047' } }}
                onMouseEnter={(e) => e.target.style.color = '#fde047'}
                onMouseLeave={(e) => e.target.style.color = 'white'}
              >
                Calendar
              </Link>
              <Link 
                to="/announcements" 
                className="text-white transition-colors link-underline"
                style={{ ':hover': { color: '#fde047' } }}
                onMouseEnter={(e) => e.target.style.color = '#fde047'}
                onMouseLeave={(e) => e.target.style.color = 'white'}
              >
                Announcements
              </Link>
              <Link 
                to="/about" 
                className="text-white transition-colors link-underline"
                style={{ ':hover': { color: '#fde047' } }}
                onMouseEnter={(e) => e.target.style.color = '#fde047'}
                onMouseLeave={(e) => e.target.style.color = 'white'}
              >
                About Us
              </Link>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 relative profile-dropdown-container">
              <span className="text-white">Hi, {user?.email?.split('@')[0] || 'User'}!</span>
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center cursor-pointer hover-pop" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{(user?.email || 'U').charAt(0).toUpperCase()}</span>
                </div>
              </div>
              {showProfileDropdown && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <button onClick={()=>navigate(-1)} className="mb-4 text-blue-600 hover:underline">← Back</button>
        <div className="bg-white rounded-lg shadow p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{announcement.title}</h1>
          <div className="text-sm text-gray-500 mb-6">{new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}</div>
          <p className="mb-6 whitespace-pre-wrap text-gray-700 leading-relaxed">{announcement.content}</p>
          {announcement.images?.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcement.images.map((src, idx) => (
                <img key={idx} src={src} alt={`announcement-${idx}`} className="w-full rounded" />
              ))}
            </div>
          )}
          {announcement.links?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Links</h3>
              <ul className="list-disc list-inside">
                {announcement.links.map((href, idx) => (
                  <li key={idx}><a className="text-blue-600 underline" href={href} target="_blank" rel="noreferrer">{href}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="bg-blue-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 NU Dasmarinas ITSO</p>
        </div>
      </footer>
    </div>
  );
}

export default AnnouncementDetailsAuthed;