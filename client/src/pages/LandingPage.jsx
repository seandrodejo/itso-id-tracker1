import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import SignupModal from "../components/SignupModal";

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);
  const openSignup = () => setIsSignupOpen(true);
  const closeSignup = () => setIsSignupOpen(false);

  // Handle Google OAuth callback and redirects
  useEffect(() => {
    const token = searchParams.get("token");
    const source = searchParams.get("source");
    const action = searchParams.get("action");

    // Handle Google signup completion redirect
    if (action === "complete_signup") {
      navigate(`/google-signup-complete?${searchParams.toString()}`);
      return;
    }

    if (token && source === "google") {
      // Store the token
      localStorage.setItem("token", token);

      // Check if this was a Google sign-up
      const pendingSignup = localStorage.getItem("pendingGoogleSignup");

      if (pendingSignup) {
        // This was a Google sign-up, complete the registration
        completeGoogleSignup(token, JSON.parse(pendingSignup));
      } else {
        // This was a Google sign-in, redirect to dashboard
        navigate("/dashboard");
      }
    }
  }, [searchParams, navigate]);

  const completeGoogleSignup = async (token, signupData) => {
    try {
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
        localStorage.removeItem("pendingGoogleSignup");
        navigate("/dashboard");
      } else {
        throw new Error("Failed to complete registration");
      }
    } catch (error) {
      console.error("Failed to complete Google signup:", error);
      // Handle error - maybe show a message to user
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Name */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  className="h-12 w-12" 
                  src="/nu-logo.png" 
                  alt="NU Logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  NU
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">
                  NU Dasmarinas ITSO ID Tracker
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link to="/calendar" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Calendar
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  About Us
                </Link>
              </div>
            </div>

            {/* Right Side - Auth Buttons & Profile */}
            <div className="flex items-center space-x-4">
              {/* Login Button */}
              <button
                onClick={openLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
              >
                Login
              </button>
              
              {/* Sign Up Button */}
              <button
                onClick={openSignup}
                className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
              >
                Sign Up
              </button>

              {/* User Profile Icon (Hidden when not logged in) */}
              <div className="hidden">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">U</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to
            <span className="block text-blue-600">ITSO ID Tracker!</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage your student ID appointment with ease! Streamline your ID requests, 
            track status updates, and never miss an important deadline.
          </p>
          
          {/* Get Started Button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-300 shadow-lg hover:shadow-xl mb-12">
            Get Started
          </button>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <img 
                src="/nu-logo.png" 
                alt="NU Logo" 
                className="h-16 w-16"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                NU
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium">Synced with</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <img 
                  src="/google-calendar-logo.png" 
                  alt="Google Calendar" 
                  className="h-8 w-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  GC
                </div>
                <span className="text-gray-700 font-semibold">Google Calendar</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/google-calendar-logo.png" 
                alt="Google Calendar Logo" 
                className="h-16 w-16"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden h-16 w-16 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                GC
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book</h3>
              <p className="text-gray-600">Schedule your ID appointment online</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Email</h3>
              <p className="text-gray-600">Receive confirmation and updates</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit ITSO</h3>
              <p className="text-gray-600">Go to ITSO office on appointment day</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🆔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Claim</h3>
              <p className="text-gray-600">Collect your new ID card</p>
            </div>
          </div>
        </div>
      </section>

      {/* ITSO Announcements Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            ITSO Announcements
          </h2>
          <div className="text-center text-gray-500 text-lg">
            <p>Leave it blank for now</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Name */}
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                  NU
                </div>
                <h3 className="text-xl font-bold">
                  NU Dasmarinas ITSO ID Tracker
                </h3>
              </div>
              <p className="text-gray-300">
                Streamlining student ID management for a better university experience.
              </p>
            </div>
            
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-300 mb-2">
                <a href="mailto:itso@nu-dasma.edu.ph" className="hover:text-white">
                  itso@nu-dasma.edu.ph
                </a>
              </p>
              <p className="text-gray-300 mb-2">
                <a href="/careers" className="hover:text-white">Careers</a>
              </p>
              <p className="text-gray-300">
                NU Dasmarinas Campus
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="/calendar" className="text-gray-300 hover:text-white">Calendar</a></li>
                <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025. Group 2. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} onSignupClick={openSignup} />
      <SignupModal isOpen={isSignupOpen} onClose={closeSignup} onLoginClick={openLogin} />
    </div>
  );
}

export default LandingPage;
