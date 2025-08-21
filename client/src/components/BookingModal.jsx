import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function BookingModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Select Purpose, 2: Select Date/Time, 3: Confirm
  const [purpose, setPurpose] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get next 7 days for date selection
  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return days;
  };

  const fetchAvailableSlots = async (date, purposeFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      let url = `${API_URL}/slots/available?date=${date}`;
      if (purposeFilter) {
        url += `&purpose=${purposeFilter}`;
      }
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const slots = await res.json();
        setAvailableSlots(slots);
      } else {
        throw new Error("Failed to fetch available slots");
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
      setError("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && purpose) {
      fetchAvailableSlots(selectedDate, purpose);
    }
  }, [selectedDate, purpose]);

  const handlePurposeNext = () => {
    if (!purpose) {
      setError("Please select a purpose for your appointment");
      return;
    }
    setError("");
    setStep(2);
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slotId: selectedSlot._id,
          purpose: purpose,
          notes: notes
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        onSuccess(data.appointment);
        resetModal();
        onClose();
      } else {
        setError(data.message || "Failed to book appointment");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      setError("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setPurpose("");
    setSelectedSlot(null);
    setAvailableSlots([]);
    setSelectedDate("");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Book ID Service Appointment
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  1
                </span>
                <span className="ml-2 text-sm font-medium">Purpose</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  2
                </span>
                <span className="ml-2 text-sm font-medium">Date & Time</span>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  3
                </span>
                <span className="ml-2 text-sm font-medium">Confirm</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Select Purpose */}
          {step === 1 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                What type of ID service do you need?
              </h4>
              <div className="space-y-3">
                {[
                  { value: "NEW_ID", label: "New ID", description: "First time getting your student ID" },
                  { value: "RENEWAL", label: "ID Renewal", description: "Renew your existing student ID" },
                  { value: "LOST_REPLACEMENT", label: "Lost/Replacement", description: "Replace lost or damaged ID" }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="purpose"
                      value={option.value}
                      checked={purpose === option.value}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handlePurposeNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Select your preferred date and time
              </h4>
              
              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {getNextSevenDays().map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-2 text-sm rounded-md border ${
                        selectedDate === day.date
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {day.display}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </label>
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => handleSlotSelection(slot)}
                          className="p-3 text-sm border border-gray-300 rounded-md hover:border-blue-600 hover:bg-blue-50 text-left"
                        >
                          <div className="font-medium">{slot.start} - {slot.end}</div>
                          <div className="text-xs text-gray-500">
                            {slot.capacity - slot.bookedCount} slots left
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm Booking */}
          {step === 3 && selectedSlot && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Confirm your appointment
              </h4>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Service:</span>
                    <p className="text-gray-900">
                      {purpose === "NEW_ID" ? "New ID" : 
                       purpose === "RENEWAL" ? "ID Renewal" : 
                       "Lost/Replacement"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <p className="text-gray-900">{selectedSlot.start} - {selectedSlot.end}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-900">NU Dasmarinas ITSO Office</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requirements or notes..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
