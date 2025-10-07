import React, { useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminQRScanner() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [action, setAction] = useState("claim");
  const [manualPayload, setManualPayload] = useState("");

  useEffect(() => {
   
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or unavailable. Use manual input below.");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  const processPayload = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      let data;
      try {
        data = typeof payload === "string" ? JSON.parse(payload) : payload;
      } catch (e) {
        setError("Invalid QR payload. Expecting JSON with { ref, t }.");
        return;
      }

      const res = await fetch(`${API_URL}/appointments/scan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ref: data.ref, t: data.t, action })
      });

      const body = await res.json();
      if (!res.ok) {
        setError(body.message || "Scan failed");
        setResult(null);
      } else {
        setError("");
        setResult(body.appointment);
      }
    } catch (err) {
      setError("Error contacting server");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-2">Camera Preview (for demo)</div>
          <video ref={videoRef} autoPlay playsInline className="w-full rounded border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="check-in">Check-in</option>
            <option value="claim">Mark as Claimed</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">Manual QR Payload</label>
          <textarea
            className="w-full border rounded p-2 h-28"
            placeholder='{"ref": "<appointmentId>", "t": "<token>"}'
            value={manualPayload}
            onChange={(e) => setManualPayload(e.target.value)}
          />
          <button
            onClick={() => processPayload(manualPayload)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Process
          </button>

          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          {result && (
            <div className="mt-3 p-3 border rounded bg-green-50 text-sm">
              <div><strong>ID:</strong> {result.id}</div>
              <div><strong>Status:</strong> {result.status}</div>
              {result.lastScannedAt && (
                <div><strong>Last Scanned:</strong> {new Date(result.lastScannedAt).toLocaleString()}</div>
              )}
              {result.scannedBy && (
                <div><strong>Scanned By:</strong> {result.scannedBy}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500">Tip: For a quick demo, paste the JSON payload returned by Generate QR into the Manual QR Payload box.</div>
    </div>
  );
}
