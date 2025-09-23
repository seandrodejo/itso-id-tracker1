import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function MyQRPass() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [qrMap, setQrMap] = useState({});

  const token = useMemo(() => localStorage.getItem("token"), []);
  const user = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        if (!token || !user?.id) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/appointments/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Failed to load appointments (${res.status})`);
        }
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user]);

  const generateQR = async (appointmentId) => {
    try {
      setError("");
      const res = await fetch(`${API_URL}/appointments/${appointmentId}/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `QR generation failed (${res.status})`);
      }
      const data = await res.json();
      setQrMap((prev) => ({
        ...prev,
        [appointmentId]: {
          dataUrl: data.dataUrl,
          payload: data.payload,
          expires: data.expires,
        },
      }));
    } catch (e) {
      setError(e.message || "Failed to generate QR");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-700">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900">My QR Pass</h1>
        <p className="text-sm text-gray-600 mt-1">
          Generate a QR for an appointment. Show this QR to the admin for check-in or claim.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {appointments.length === 0 && (
            <div className="p-4 bg-white border rounded text-gray-700">
              You have no appointments yet.
            </div>
          )}

          {appointments.map((appt) => {
            const apptId = appt._id;
            const slotDate = appt?.slotId?.date || appt?.appointmentDate || "";
            const start = appt?.slotId?.start || appt?.appointmentStartTime || "";
            const end = appt?.slotId?.end || appt?.appointmentEndTime || "";
            const qr = qrMap[apptId];
            const isExpired = qr?.expires ? new Date(qr.expires) < new Date() : false;

            return (
              <div key={apptId} className="bg-white border rounded p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="text-gray-900 font-medium">{slotDate} {start && `• ${start}${end ? ` - ${end}` : ""}`}</div>
                    <div className="text-sm text-gray-500">Status: {appt.status}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => generateQR(apptId)}
                      className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      {qr ? (isExpired ? "Regenerate QR" : "Refresh QR") : "Generate QR"}
                    </button>
                  </div>
                </div>

                {qr && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={qr.dataUrl}
                        alt="Appointment QR"
                        className="w-48 h-48 border rounded bg-white"
                      />
                      <div className="flex-1 text-sm text-gray-700">
                        <div className="font-semibold mb-1">Manual Payload</div>
                        <pre className="bg-gray-50 border rounded p-2 text-xs overflow-auto">
{JSON.stringify(qr.payload, null, 2)}
                        </pre>
                        <div className="mt-2 text-xs text-gray-500">
                          Expires: {qr.expires ? new Date(qr.expires).toLocaleString() : "unknown"}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Tip: If camera scanning fails, the admin can paste this JSON into the Admin QR Scanner.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyQRPass;
