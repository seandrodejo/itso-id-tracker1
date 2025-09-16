import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (token) {
      // Store the token
      localStorage.setItem("token", token);

      // Redirect to dashboard after successful authentication
      setStatus("Authentication successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setStatus("Authentication failed. No token received.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [searchParams, navigate]);



  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '20%',
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse'
      }}></div>

      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔄</div>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '900',
          color: '#1f2937',
          marginBottom: '16px',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          letterSpacing: '-0.02em'
        }}>
          Authentication in Progress
        </h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '32px',
          fontSize: '16px',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          lineHeight: '1.6'
        }}>
          {status}
        </p>
        
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthSuccess;
