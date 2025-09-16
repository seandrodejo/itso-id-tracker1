import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import { FaSignInAlt } from 'react-icons/fa';

function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    student_id: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('Attempting login with:', { email: formData.email, student_id: formData.student_id });
      console.log('API URL:', `${API_URL}/auth/login`);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log('Login response status:', res.status);
      const data = await res.json();
      console.log('Login response data:', data);

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        console.log('Token stored, closing modal and navigating to dashboard');
        onClose();
        
        // Check if user is admin and redirect accordingly
        try {
          const decoded = JSON.parse(atob(data.token.split('.')[1]));
          console.log('Decoded token:', decoded);
          console.log('User role:', decoded.role);
          console.log('Is admin?', decoded.role === 'admin');
          
          // Check if this is the admin account
          const isAdminEmail = formData.email === 'admin@nu-dasma.edu.ph';
          console.log('Is admin email?', isAdminEmail);
          
          if (decoded.role === 'admin' || isAdminEmail) {
            console.log('Redirecting to admin dashboard');
            navigate("/admin");
          } else {
            console.log('Redirecting to student dashboard');
            navigate("/dashboard");
          }
        } catch (err) {
          console.error('Error decoding token:', err);
          navigate("/dashboard"); // Default to dashboard on error
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setError("");
    setFormData({ email: "", student_id: "", password: "" });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.4), rgba(59, 130, 246, 0.4))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
        maxWidth: '420px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(0,0,0,0.05)'
      }} className="scale-in">
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 20px 0 20px'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            Log In
          </h2>
          <button
            onClick={() => { onClose(); resetModal(); }}
            style={{
              color: '#94a3b8',
              fontSize: '22px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            aria-label="Close login modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'linear-gradient(180deg, #fff1f2, #fee2e2)',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: '10px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px',
                letterSpacing: '0.02em'
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="student@nu-dasma.edu.ph"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e)=>{ e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor='#60a5fa'; }}
                onBlur={(e)=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#d1d5db'; }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px',
                letterSpacing: '0.02em'
              }}>
                Student ID
              </label>
              <input
                type="text"
                name="student_id"
                placeholder="2023-170301"
                value={formData.student_id}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e)=>{ e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor='#60a5fa'; }}
                onBlur={(e)=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#d1d5db'; }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px',
                letterSpacing: '0.02em'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e)=>{ e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.2)'; e.currentTarget.style.borderColor='#60a5fa'; }}
                onBlur={(e)=>{ e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#d1d5db'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 800,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)'
              }}
              onMouseEnter={(e)=>{ e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={(e)=>{ e.currentTarget.style.transform='translateY(0)'; }}
              className="modern-button"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <FaSignInAlt /> {loading ? "Logging in..." : "Log In"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;