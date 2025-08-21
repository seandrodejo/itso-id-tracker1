import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function IdStatusModal({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchIdStatus();
    }
  }, [isOpen]);

  const fetchIdStatus = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/idcards/status`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      } else {
        throw new Error("Failed to fetch ID status");
      }
    } catch (err) {
      console.error("Error fetching ID status:", err);
      setError("Failed to load ID status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusType) => {
    switch (statusType) {
      case "NO_APPOINTMENT":
        return "text-gray-600 bg-gray-100";
      case "APPOINTMENT_CONFIRMED":
        return "text-blue-600 bg-blue-100";
      case "ID_PROCESSING":
        return "text-yellow-600 bg-yellow-100";
      case "ID_READY":
        return "text-green-600 bg-green-100";
      case "ID_ISSUED":
        return "text-green-600 bg-green-100";
      case "APPOINTMENT_MISSED":
      case "APPOINTMENT_CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (statusType) => {
    switch (statusType) {
      case "NO_APPOINTMENT":
        return "📅";
      case "APPOINTMENT_CONFIRMED":
        return "✅";
      case "ID_PROCESSING":
        return "⏳";
      case "ID_READY":
        return "🎉";
      case "ID_ISSUED":
        return "✅";
      case "APPOINTMENT_MISSED":
      case "APPOINTMENT_CANCELLED":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              ID Status Tracker
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ID status...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchIdStatus}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          ) : status ? (
            <div>
              {/* Current Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
                  <span className="mr-2">{getStatusIcon(status.status)}</span>
                  {status.status?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <p className="mt-2 text-gray-700">{status.message}</p>
              </div>

              {/* Appointment Details */}
              {status.appointment && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Appointment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Service Type:</span>
                      <p className="text-gray-900">
                        {status.appointment.slotId?.purpose === "NEW_ID" ? "New ID" :
                         status.appointment.slotId?.purpose === "RENEWAL" ? "ID Renewal" :
                         "Lost/Replacement"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900 capitalize">
                        {status.appointment.status?.toLowerCase().replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <p className="text-gray-900">
                        {formatDate(status.appointment.slotId?.date)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time:</span>
                      <p className="text-gray-900">
                        {formatTime(status.appointment.slotId?.start)} - {formatTime(status.appointment.slotId?.end)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Booked:</span>
                      <p className="text-gray-900">
                        {new Date(status.appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900">NU Dasmarinas ITSO Office</p>
                    </div>
                  </div>
                  {status.appointment.notes && (
                    <div className="mt-3">
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-900">{status.appointment.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ID Card Details */}
              {status.idCard && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">ID Card Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <p className="text-gray-900 capitalize">
                        {status.idCard.status?.toLowerCase()}
                      </p>
                    </div>
                    {status.idCard.issuedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Issued:</span>
                        <p className="text-gray-900">
                          {new Date(status.idCard.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {status.idCard.returnedAt && (
                      <div>
                        <span className="font-medium text-gray-700">Returned:</span>
                        <p className="text-gray-900">
                          {new Date(status.idCard.returnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Progress Timeline</h4>
                <div className="space-y-3">
                  {/* Appointment Booked */}
                  {status.appointment && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">✓</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Appointment Booked</p>
                        <p className="text-sm text-gray-500">
                          {new Date(status.appointment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ID Processing */}
                  {status.appointment?.status === "CLAIMED" && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-sm">⏳</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">ID Processing</p>
                        <p className="text-sm text-gray-500">Your ID is being prepared</p>
                      </div>
                    </div>
                  )}

                  {/* ID Ready */}
                  {status.idCard?.status === "CLAIMED" && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">🎉</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">ID Ready for Pickup</p>
                        <p className="text-sm text-gray-500">
                          {status.idCard.issuedAt && new Date(status.idCard.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ID Issued */}
                  {status.idCard?.status === "RETURNED" && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">✅</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">ID Issued Successfully</p>
                        <p className="text-sm text-gray-500">
                          {status.idCard.returnedAt && new Date(status.idCard.returnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={fetchIdStatus}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Refresh Status
                </button>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No status information available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IdStatusModal;
