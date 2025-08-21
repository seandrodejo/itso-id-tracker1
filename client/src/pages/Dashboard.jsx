import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import BookingModal from "../components/BookingModal";
import IdStatusModal from "../components/IdStatusModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for Google OAuth token in URL params first
    const urlToken = searchParams.get("token");
    const source = searchParams.get("source");

    if (urlToken && source === "google") {
      // Store the Google OAuth token
      localStorage.setItem("token", urlToken);
      // Clean up URL by removing query params
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
      fetchUserData(decoded.id);
      fetchUserAppointments(decoded.id);
      setLoading(false);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate, searchParams]);

  const fetchUserData = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const userData = await res.json();
        setUserDetails(userData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchUserAppointments = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/appointments/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const appointmentData = await res.json();
        setAppointments(appointmentData);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleBookingSuccess = (newAppointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
    // Show success message
    alert("Appointment booked successfully!");
  };

  const createDefaultSlots = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/slots/create-defaults`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Created ${data.slots?.length || 0} default slots successfully!`);
      } else {
        alert(data.message || "Failed to create slots");
      }
    } catch (err) {
      console.error("Error creating slots:", err);
      alert("Failed to create slots");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ITSO ID Tracker
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || "User"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.role === "admin" ? "Administrator" : "Student"}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Book Appointment
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Schedule ID Service
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Book Now →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">🆔</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ID Status
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Check Status
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => setIsStatusModalOpen(true)}
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    View Status →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Calendar
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        View Schedule
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button
                    onClick={() => navigate("/calendar")}
                    className="font-medium text-red-600 hover:text-red-500"
                  >
                    Open Calendar →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Appointments
              </h3>
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <p className="text-gray-500">No appointments yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Book your first appointment to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 3).map((appointment) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">📅</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.slotId?.purpose === "NEW_ID" ? "New ID" :
                             appointment.slotId?.purpose === "RENEWAL" ? "ID Renewal" :
                             "Lost/Replacement"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.slotId?.date).toLocaleDateString()} at {appointment.slotId?.start}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                          appointment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          appointment.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {appointment.status}
                        </div>
                      </div>
                    </div>
                  ))}
                  {appointments.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => navigate("/calendar")}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all appointments →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Section */}
          {(userDetails?.role || user?.role) === "admin" && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Admin Tools
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={createDefaultSlots}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Default Slots
                  </button>
                  <button
                    onClick={() => navigate("/admin")}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Dashboard
                  </button>
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                  Use these tools to manage appointments and slots.
                </p>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Account Information
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userDetails?.name || user?.email || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userDetails?.student_id || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userDetails?.personal_email || user?.email || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {(userDetails?.role || user?.role) === "admin" ? "Administrator" : "Student"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userDetails?.isGoogleUser ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {userDetails?.isGoogleUser ? "Google Account" : "Regular Account"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <IdStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </div>
  );
}

export default Dashboard;
