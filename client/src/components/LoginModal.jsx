import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";

function LoginModal({ isOpen, onClose, onSignupClick }) {
  const [formData, setFormData] = useState({
    personal_email: "",
    student_id: "",
    password: ""
  });
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
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
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        onClose();
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implement forgot password API call
      // const res = await fetch(`${API_URL}/auth/forgot-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.personal_email }),
      // });

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEmailSent(true);
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implement reset password API call
      // const res = await fetch(`${API_URL}/auth/reset-password`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     email: formData.personal_email,
      //     newPassword: formData.newPassword 
      //   }),
      // });

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsResetPassword(false);
      setIsForgotPassword(false);
      setFormData({ ...formData, password: "", newPassword: "", confirmPassword: "" });
      // Show success message
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Require Student ID first for Google sign-in
      if (!formData.student_id) {
        setError("Please enter your Student ID first to sign in with Google");
        return;
      }

      // Store student ID for verification during callback
      localStorage.setItem("pendingGoogleLogin", JSON.stringify({
        student_id: formData.student_id
      }));

      // Get Google OAuth URL from backend
      const res = await fetch(`${API_URL}/google/auth/google`);
      const data = await res.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError("Failed to get Google OAuth URL");
      }
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  const resetModal = () => {
    setIsForgotPassword(false);
    setIsResetPassword(false);
    setIsEmailSent(false);
    setError("");
    setFormData({ personal_email: "", student_id: "", password: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isForgotPassword ? "Forgot Password" : 
             isResetPassword ? "Reset Password" : 
             isEmailSent ? "Check Your Email" : "Login"}
          </h2>
          <button
            onClick={() => { onClose(); resetModal(); }}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Email Sent Message */}
          {isEmailSent && (
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-2">Check your email</h3>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to {formData.personal_email}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.open('https://mail.google.com', '_blank')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Open Email App
                </button>
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Didn't receive email? Click to resend
                </button>
                <button
                  onClick={() => { setIsEmailSent(false); setIsForgotPassword(false); }}
                  className="w-full text-blue-600 hover:text-blue-700"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}

          {/* Reset Password Form */}
          {isResetPassword && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={formData.newPassword || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setIsResetPassword(false)}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                Back to Forgot Password
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {isForgotPassword && !isEmailSent && !isResetPassword && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="personal_email"
                  placeholder="Enter your email address"
                  value={formData.personal_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Login Form */}
          {!isForgotPassword && !isResetPassword && !isEmailSent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="personal_email"
                  placeholder="Enter your email address"
                  value={formData.personal_email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Number
                </label>
                <input
                  type="text"
                  name="student_id"
                  placeholder="Enter your student number"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
              >
                <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
                <span>Sign In with Google</span>
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { onClose(); onSignupClick(); }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
