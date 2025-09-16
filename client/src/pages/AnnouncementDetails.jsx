import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import API_URL from '../api';
import LoginModal from '../components/LoginModal';
import nuLogo from '../assets/images/nu-logo.png';

function AnnouncementDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements/${id}`);
        if (!res.ok) throw new Error('Announcement not found');
        const data = await res.json();
        setAnnouncement(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      position: 'relative'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '8%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(40, 73, 208, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 18s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '6%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 14s ease-in-out infinite reverse'
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
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              <img src={nuLogo} alt="NU Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ color: '#fde047', fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap' }}>NU Dasmarinas</div>
              <div style={{ color: '#fde047', fontSize: '18px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>ITSO ID Tracker</div>
            </div>
          </div>
          {/* Center links */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/" className="link-underline" style={{ color: location.pathname === '/' ? '#fde047' : '#93c5fd', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' }}>Home</Link>
            <Link to="/calendar-public" className="link-underline" style={{ color: location.pathname === '/calendar-public' ? '#fde047' : '#93c5fd', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' }}>Calendar</Link>
            <Link to="/announcements-public" className="link-underline" style={{ color: location.pathname.startsWith('/announcements-public') ? '#fde047' : '#93c5fd', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' }}>Announcements</Link>
            <Link to="/about-public" className="link-underline" style={{ color: location.pathname === '/about-public' ? '#fde047' : '#93c5fd', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' }}>About Us</Link>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsLoginOpen(true)} style={{ backgroundColor: '#fde047', color: '#1e40af', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '14px', whiteSpace: 'nowrap' }}>Log In</button>
          </div>
        </div>
      </nav>

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">← Back</button>
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-2">{announcement.title}</h1>
          <div className="text-sm text-gray-500 mb-6">{new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}</div>
          <p className="mb-6 whitespace-pre-wrap">{announcement.content}</p>
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

      {/* Footer (reuse from public pages kept minimal) */}
      <footer style={{ backgroundColor: '#4a5568', color: 'white', padding: '24px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>© 2025 NU Dasmariñas ITSO ID Tracker</p>
        </div>
      </footer>
    </div>
  );
}

export default AnnouncementDetails;