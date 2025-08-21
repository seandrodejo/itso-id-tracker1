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
      
      // Check if this was a Google sign-up
      const pendingSignup = localStorage.getItem("pendingGoogleSignup");
      
      if (pendingSignup) {
        // This was a Google sign-up, complete the registration
        completeGoogleSignup(token, JSON.parse(pendingSignup));
      } else {
        // This was a Google sign-in, redirect to dashboard
        setStatus("Authentication successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } else {
      setStatus("Authentication failed. No token received.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [searchParams, navigate]);

  const completeGoogleSignup = async (token, signupData) => {
    try {
      setStatus("Completing your registration...");
      
      // Call backend to complete Google sign-up with student ID
      const res = await fetch("/api/google/auth/google/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: signupData.student_id
        })
      });

      if (res.ok) {
        setStatus("Registration completed successfully! Redirecting...");
        localStorage.removeItem("pendingGoogleSignup");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error("Failed to complete registration");
      }
    } catch (error) {
      setStatus("Failed to complete registration. Please try again.");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication in Progress
        </h2>
        <p className="text-gray-600 mb-6">
          {status}
        </p>
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        
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
