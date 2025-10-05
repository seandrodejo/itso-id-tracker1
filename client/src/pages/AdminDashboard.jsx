import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import nuLogo from '../assets/images/nu-logo-copy.png';
import { FiLock, FiUser, FiUsers, FiCheckCircle, FiEdit3, FiXCircle, FiCalendar, FiBell, FiBarChart2 } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AdminDashboard() {
  // Helper function to parse date string as local date to avoid timezone issues
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const analyticsRef = useRef(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    enrolledUsers: 0,
    registeredUsers: 0,
    notEnrolledUsers: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'enrollment_status',
    direction: 'desc' // Start with enrolled at top
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null); // For delete confirmation dialog
  const [statusChangeModal, setStatusChangeModal] = useState(null); // For status change with remarks
  const [statusRemarks, setStatusRemarks] = useState("");

  // Appointments filter (admin)
  const [apptFilterMode, setApptFilterMode] = useState('all'); // 'all' | 'day' | 'month' | 'type'
  const [apptFilterDate, setApptFilterDate] = useState('');    // YYYY-MM-DD
  const [apptFilterMonth, setApptFilterMonth] = useState('');  // YYYY-MM
  const [apptFilterType, setApptFilterType] = useState('');    // appointment type key

  // Derived filtered appointments based on filter mode
  const filteredAppointments = React.useMemo(() => {
    if (!appointments || appointments.length === 0) return [];
    if (apptFilterMode === 'day' && apptFilterDate) {
      return appointments.filter((a) => {
        if (!a?.date) return false;
        const y = a.date.getFullYear();
        const m = String(a.date.getMonth() + 1).padStart(2, '0');
        const d = String(a.date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === apptFilterDate;
      });
    }
    if (apptFilterMode === 'month' && apptFilterMonth) {
      return appointments.filter((a) => {
        if (!a?.date) return false;
        const y = a.date.getFullYear();
        const m = String(a.date.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}` === apptFilterMonth;
      });
    }
    if (apptFilterMode === 'type' && apptFilterType) {
      return appointments.filter((a) => {
        if (!a?.type) return false;
        if (apptFilterType === 'school-year-renewal') {
          return a.type === 'school-year-renewal';
        }
        if (apptFilterType === 'school-year-renewal:new-picture') {
          return a.type === 'school-year-renewal' && a.pictureOption === 'new-picture';
        }
        if (apptFilterType === 'school-year-renewal:retain-picture') {
          return a.type === 'school-year-renewal' && (a.pictureOption === 'retain-picture' || a.pictureOption === 'retain');
        }
        return a.type === apptFilterType;
      });
    }
    return appointments;
  }, [appointments, apptFilterMode, apptFilterDate, apptFilterMonth, apptFilterType]);

  // Calendar Management state
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const [closures, setClosures] = useState([]);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [selectedClosureDate, setSelectedClosureDate] = useState(null); // Date object
  const [closureRemarks, setClosureRemarks] = useState("");

  // Scheduling Windows Management state
  const [schedulingWindows, setSchedulingWindows] = useState([]);
  const [showSchedulingWindowModal, setShowSchedulingWindowModal] = useState(false);
  const [schedulingWindowForm, setSchedulingWindowForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    purpose: "ALL",
    isActive: true,
    description: ""
  });
  const [editingSchedulingWindow, setEditingSchedulingWindow] = useState(null);

  // Announcement Management state
  const [announcements, setAnnouncements] = useState([]);
  const [annSearch, setAnnSearch] = useState("");
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annImages, setAnnImages] = useState(""); // comma separated
  const [annLinks, setAnnLinks] = useState("");  // comma separated
  const [annTags, setAnnTags] = useState("");    // comma separated
  const [annEditId, setAnnEditId] = useState(null);

  // Analytics state
  const [analyticsTimePeriod, setAnalyticsTimePeriod] = useState('all-time');
  const [analyticsData, setAnalyticsData] = useState({
    monthlyAppointments: [],
    userRegistrationTrend: [],
    appointmentStatusBreakdown: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      
      // Check if user is admin
      console.log('AdminDashboard: Token decoded:', decoded);
      console.log('AdminDashboard: User role:', decoded.role);
      console.log('AdminDashboard: Is admin?', decoded.role === 'admin');
      
      if (decoded.role !== 'admin') {
        console.log('User is not admin, redirecting to dashboard');
        setLoading(false);
        navigate("/dashboard");
        return;
      }
      
      console.log('User is admin, staying on admin dashboard');
      
      setAdmin(decoded);
      fetchAppointments();
      fetchUsers();
      fetchClosuresForMonth(calendarCurrentDate);
      setLoading(false);
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setLoading(false);
      navigate("/");
    }
  }, [navigate]);

  // Load announcements list initially when tab is opened
  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements(annSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Announcements: CRUD helpers
  const fetchAnnouncements = async (query = "") => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = `${API_URL}/announcements/all${query ? `?q=${encodeURIComponent(query)}` : ""}`;
      const res = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.items || []);
      }
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const submitAnnouncement = async (publish = true) => {
    try {
      const token = localStorage.getItem("token");
      const body = {
        title: annTitle.trim(),
        content: annContent,
        images: annImages.split(',').map(s => s.trim()).filter(Boolean),
        links: annLinks.split(',').map(s => s.trim()).filter(Boolean),
        tags: annTags.split(',').map(s => s.trim()).filter(Boolean),
        isPublished: publish,
      };
      const method = annEditId ? 'PATCH' : 'POST';
      const url = annEditId ? `${API_URL}/announcements/${annEditId}` : `${API_URL}/announcements`;
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        // Reset form
        setAnnTitle("");
        setAnnContent("");
        setAnnImages("");
        setAnnLinks("");
        setAnnTags("");
        setAnnEditId(null);
        fetchAnnouncements(annSearch);
      }
    } catch (err) {
      console.error("Error submitting announcement:", err);
    }
  };

  const editAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/announcements/admin/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const item = await res.json();
        setAnnTitle(item.title || "");
        setAnnContent(item.content || "");
        setAnnImages((item.images || []).join(', '));
        setAnnLinks((item.links || []).join(', '));
        setAnnTags((item.tags || []).join(', '));
        setAnnEditId(item._id);
      }
    } catch (err) {
      console.error("Error loading announcement:", err);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchAnnouncements(annSearch);
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log("Fetching appointments...");
      const token = localStorage.getItem("token");
      console.log("Using token:", token ? "Token exists" : "No token");
      
      const res = await fetch(`${API_URL}/appointments`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Appointments response status:", res.status, res.statusText);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Appointments data received:", data);
        
        if (data.length === 0) {
          console.log("No appointments found in the database");
        }
        
        // Convert date strings to Date objects and normalize field names
        const formattedAppointments = data.map(appointment => {
          // Try to get date from slot first, then from appointment fields
          let appointmentDate = null;
          let timeSlot = 'No time set';
          
          if (appointment.slotId?.date) {
            appointmentDate = parseLocalDate(appointment.slotId.date);
            if (appointment.slotId.start && appointment.slotId.end) {
              timeSlot = `${appointment.slotId.start} - ${appointment.slotId.end}`;
            }
          } else if (appointment.appointmentDate) {
            appointmentDate = parseLocalDate(appointment.appointmentDate);
            if (appointment.appointmentStartTime && appointment.appointmentEndTime) {
              // Convert 24-hour format to 12-hour format for display
              const formatTime = (time24) => {
                const [hours, minutes] = time24.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${ampm}`;
              };
              
              timeSlot = `${formatTime(appointment.appointmentStartTime)} - ${formatTime(appointment.appointmentEndTime)}`;
            }
          }
          
          return {
            ...appointment,
            id: appointment._id, // Map MongoDB _id to id
            date: appointmentDate,
            timeSlot: timeSlot,
            user: {
              first_name: appointment.userId?.name?.split(' ')[0] || '',
              last_name: appointment.userId?.name?.split(' ').slice(1).join(' ') || '',
              email: appointment.userId?.personal_email || '',
              student_id: appointment.userId?.student_id || ''
            }
          };
        });
        
        console.log("Formatted appointments:", formattedAppointments);
        setAppointments(formattedAppointments);
        
        // Update stats
        const pendingCount = formattedAppointments.filter(app => 
          ['pending-approval', 'on-hold', 'for-printing', 'PENDING'].includes(app.status)
        ).length;
        
        const completedCount = formattedAppointments.filter(app => 
          ['to-claim', 'confirmed', 'CONFIRMED', 'CLAIMED'].includes(app.status)
        ).length;
        
        console.log("Appointment stats:", { pendingCount, completedCount });
        
        setStats(prev => ({
          ...prev,
          pendingAppointments: pendingCount,
          completedAppointments: completedCount
        }));
      } else {
        console.error("Failed to fetch appointments:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchClosuresForMonth = async (dateObj) => {
    try {
      const token = localStorage.getItem("token");
      // Build month range YYYY-MM-01 to YYYY-MM-31
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const endDate = new Date(year, dateObj.getMonth() + 1, 0).getDate();
      const end = `${year}-${month}-${String(endDate).padStart(2, '0')}`;

      const res = await fetch(`${API_URL}/calendar-closures?start=${start}&end=${end}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClosures(data);
      }
    } catch (err) {
      console.error("Error fetching calendar closures:", err);
    }
  };

  const createOrUpdateClosure = async (dateStr, remarks) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/calendar-closures`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ date: dateStr, remarks })
      });
      if (res.ok) {
        await fetchClosuresForMonth(calendarCurrentDate);
        return true;
      }
    } catch (err) {
      console.error("Error creating/updating closure:", err);
    }
    return false;
  };

  const deleteClosure = async (dateStr) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/calendar-closures/${dateStr}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        await fetchClosuresForMonth(calendarCurrentDate);
      }
    } catch (err) {
      console.error("Error deleting closure:", err);
    }
  };

  const isDateClosed = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return closures.some(c => c.date === dateStr);
  };

  const getClosureRemarks = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const found = closures.find(c => c.date === dateStr);
    return found?.remarks || "";
  };

  const navigateClosureMonth = (direction) => {
    setCalendarCurrentDate(prev => {
      const nd = new Date(prev);
      nd.setMonth(prev.getMonth() + direction);
      // refresh closures for month
      setTimeout(() => fetchClosuresForMonth(nd), 0);
      return nd;
    });
  };

  // PDF Generation Function
  const generatePDF = async () => {
    if (!analyticsRef.current) return;

    try {
      // Create a temporary container for PDF content
      const pdfContent = document.createElement('div');
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '0';
      pdfContent.style.width = '210mm'; // A4 width
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.padding = '20px';
      pdfContent.style.fontFamily = 'Arial, sans-serif';

   const header = document.createElement('div');
header.innerHTML = `
  <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2849D0; padding-bottom: 15px;">
    <h1 style="color: #2849D0; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">
      ITSO ID TRACKER SUMMARY
    </h1>
    <p style="color: #B8860B; margin: 4px 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
      National University - Dasmariñas
    </p>
    <h2 style="color: #444; margin: 10px 0 0; font-size: 18px; font-weight: 600;">Analytics Report</h2>
    <p style="color: #777; margin: 4px 0 0; font-size: 12px; font-style: italic;">
      Generated on: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </p>
  </div>
`;
      // Create summary section
const summary = document.createElement('div');
summary.innerHTML = `
  <div style="margin-bottom: 30px;">
    <h3 style="color: #2849D0; margin-top: -40px; margin-bottom: 18px; font-size: 16px; font-weight: 600; text-align: center; border-bottom: 2px solid #2849D0; padding-bottom: 6px; letter-spacing: 0.4px;">
      Executive Summary
    </h3>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
      
      <div style="background: linear-gradient(135deg, #ebf4ff, #dbeafe); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
        <h4 style="margin: 0 0 4px 0; color: #3b82f6; font-size: 13px; font-weight: 600;">Total Users</h4>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${stats.totalUsers}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
        <h4 style="margin: 0 0 4px 0; color: #10b981; font-size: 13px; font-weight: 600;">Enrolled Users</h4>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${stats.enrolledUsers}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fef9c3, #fef3c7); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
        <h4 style="margin: 0 0 4px 0; color: #f59e0b; font-size: 13px; font-weight: 600;">Pending Appointments</h4>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${stats.pendingAppointments}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #ede9fe, #ddd6fe); padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.06);">
        <h4 style="margin: 0 0 4px 0; color: #8b5cf6; font-size: 13px; font-weight: 600;">Completed Appointments</h4>
        <p style="margin: 0; font-size: 22px; font-weight: bold; color: #1e293b;">${stats.completedAppointments}</p>
      </div>
      
    </div>
  </div>
`;

      // Create detailed statistics table
      const detailedStats = document.createElement('div');
const enrollmentRate = stats.totalUsers > 0 ? Math.round((stats.enrolledUsers / stats.totalUsers) * 100) : 0;
const completionRate = (stats.pendingAppointments + stats.completedAppointments) > 0 ? 
  Math.round((stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100) : 0;

detailedStats.innerHTML = `
  <div style="margin-bottom: 40px;">
    <h3 style="color: #2849D0; margin-top: -20px; margin-bottom: 25px; font-size: 18px; font-weight: 600; text-align: center; border-bottom: 2px solid #2849D0; padding-bottom: 8px; letter-spacing: 0.5px;">
      Detailed Statistics
    </h3>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <thead>
          <tr style="background: linear-gradient(135deg, #2849D0, #1e3a8a); color: #fff;">
            <th style="padding: 12px; text-align: left; font-weight: 600;">Metric</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Count</th>
            <th style="padding: 12px; text-align: right; font-weight: 600;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f9fafb;">
            <td style="padding: 12px; color: #374151;">Total Registered Users</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.totalUsers}</td>
            <td style="padding: 12px; text-align: right;">100%</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #374151;">Enrolled Users</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.enrolledUsers}</td>
            <td style="padding: 12px; text-align: right;">${enrollmentRate}%</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 12px; color: #374151;">Not Enrolled Users</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.totalUsers - stats.enrolledUsers}</td>
            <td style="padding: 12px; text-align: right;">${100 - enrollmentRate}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #374151;">Total Appointments</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.pendingAppointments + stats.completedAppointments}</td>
            <td style="padding: 12px; text-align: right;">100%</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 12px; color: #374151;">Pending Appointments</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.pendingAppointments}</td>
            <td style="padding: 12px; text-align: right;">${100 - completionRate}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #374151;">Completed Appointments</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #111827;">${stats.completedAppointments}</td>
            <td style="padding: 12px; text-align: right;">${completionRate}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`;
const insights = document.createElement('div');
insights.innerHTML = `
  <div style="margin-bottom: 40px;">
    <h3 style="color: #2849D0; margin-top: -40px; margin-bottom: 18px; font-size: 18px; font-weight: 600; text-align: center; border-bottom: 2px solid #2849D0; padding-bottom: 6px; letter-spacing: 0.4px;">
      Key Insights
    </h3>
    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 5px solid #2849D0; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8; font-size: 14px;">
        <li><strong>Enrollment Rate:</strong> ${enrollmentRate}% of registered users are enrolled in the system.</li>
        <li><strong>Appointment Completion Rate:</strong> ${completionRate}% of appointments have been completed successfully.</li>
        <li><strong>System Usage:</strong> ${stats.totalUsers} total users with ${stats.pendingAppointments + stats.completedAppointments} appointments processed.</li>
        <li><strong>Pending Workload:</strong> ${stats.pendingAppointments} appointments are currently pending processing.</li>
      </ul>
    </div>
  </div>
`;
     const footer = document.createElement('div');
      footer.innerHTML = `
        <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #ddd; text-align: center; color: #555; font-size: 11px; line-height: 1.5;">
          <p style="margin: 0; font-weight: 500;">This report was automatically generated by the <span style="color:#2849D0; font-weight: 600;">National University - Dasmariñas ITSO ID Tracker System</span></p>
          <p style="margin: 5px 0 0;">© 2025 National University - Dasmariñas ITSO. All rights reserved.</p>
        </div>
      `;

      // Append all sections to PDF content
      pdfContent.appendChild(header);
      pdfContent.appendChild(summary);
      pdfContent.appendChild(detailedStats);
      pdfContent.appendChild(insights);
      pdfContent.appendChild(footer);

      // Add to document temporarily
      document.body.appendChild(pdfContent);

      // Generate PDF
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary element
      document.body.removeChild(pdfContent);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const fileName = `ITSO_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async (timePeriod = 'all-time') => {
    try {
      // Generate mock data for demonstration
      // In a real application, this would fetch from the backend
      const now = new Date();
      const monthlyData = [];
      
      // Generate last 6 months of data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        // Mock data based on current stats
        const baseAppointments = Math.floor((stats.pendingAppointments + stats.completedAppointments) / 6);
        const variance = Math.floor(Math.random() * 10) - 5;
        
        monthlyData.push({
          month: monthName,
          appointments: Math.max(0, baseAppointments + variance),
          completed: Math.floor((baseAppointments + variance) * 0.7),
          pending: Math.floor((baseAppointments + variance) * 0.3)
        });
      }

      // Generate user registration trend
      const userTrendData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        const baseUsers = Math.floor(stats.totalUsers / 6);
        const variance = Math.floor(Math.random() * 5);
        
        userTrendData.push({
          month: monthName,
          newUsers: Math.max(0, baseUsers + variance),
          totalUsers: Math.floor(stats.totalUsers * (i + 1) / 6)
        });
      }

      setAnalyticsData({
        monthlyAppointments: monthlyData,
        userRegistrationTrend: userTrendData,
        appointmentStatusBreakdown: [
          { name: 'Completed', value: stats.completedAppointments, color: '#10b981' },
          { name: 'Pending', value: stats.pendingAppointments, color: '#f59e0b' },
          { name: 'Cancelled', value: Math.floor(stats.totalUsers * 0.05), color: '#ef4444' }
        ]
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  };

  // Load analytics data when tab is opened
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData(analyticsTimePeriod);
    }
  }, [activeTab, analyticsTimePeriod, stats]);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const token = localStorage.getItem("token");
      console.log("Using token:", token ? "Token exists" : "No token");
      
      const res = await fetch(`${API_URL}/auth/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log("Users response status:", res.status, res.statusText);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Users data received:", data);
        
        if (data.length === 0) {
          console.log("No users found in the database");
        }
        
        // Normalize user data
        const formattedUsers = data.map(user => ({
          ...user,
          id: user._id, // Map MongoDB _id to id
          first_name: user.name?.split(' ')[0] || '',
          last_name: user.name?.split(' ').slice(1).join(' ') || '',
          email: user.personal_email || '',
          enrollment_status: user.enrollment_status || 'enrolled' // Default to enrolled
        }));
        
        setUsers(formattedUsers);
        
        // Update stats
        const totalUsers = formattedUsers.length;
        const enrolledUsers = formattedUsers.filter(user => user.enrollment_status === 'enrolled').length;
        const registeredUsers = formattedUsers.filter(user => user.enrollment_status === 'registered').length;
        const notEnrolledUsers = formattedUsers.filter(user => user.enrollment_status === 'not-enrolled').length;
        
        console.log("User stats:", { totalUsers, enrolledUsers, registeredUsers, notEnrolledUsers });
        
        setStats(prev => ({
          ...prev,
          totalUsers,
          enrolledUsers,
          registeredUsers,
          notEnrolledUsers
        }));
      } else {
        console.error("Failed to fetch users:", await res.text());
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const updateAppointmentStatus = async (appointmentId, newStatus, remarks = "") => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: newStatus,
          adminRemarks: remarks,
          statusUpdatedAt: new Date().toISOString(),
          statusUpdatedBy: admin?.name || admin?.email || 'Admin'
        })
      });

      if (res.ok) {
        // Update local state
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId 
            ? { 
                ...appointment, 
                status: newStatus,
                adminRemarks: remarks,
                statusUpdatedAt: new Date().toISOString(),
                statusUpdatedBy: admin?.name || admin?.email || 'Admin'
              } 
            : appointment
        ));
        
        // Refresh stats
        fetchAppointments();
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
    }
  };

  const handleStatusChange = (appointmentId, newStatus, currentStatus) => {
    // Check if the status change requires remarks
    const statusesRequiringRemarks = ['on-hold', 'declined', 'for-printing'];
    
    if (statusesRequiringRemarks.includes(newStatus) || newStatus !== currentStatus) {
      // Open modal for remarks
      setStatusChangeModal({
        appointmentId,
        newStatus,
        currentStatus,
        requiresRemarks: statusesRequiringRemarks.includes(newStatus)
      });
      setStatusRemarks("");
    } else {
      // Direct status update for statuses that don't require remarks
      updateAppointmentStatus(appointmentId, newStatus);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusChangeModal) return;
    
    const { appointmentId, newStatus, requiresRemarks } = statusChangeModal;
    
    // Validate remarks for statuses that require them
    if (requiresRemarks && !statusRemarks.trim()) {
      alert("Please provide remarks for this status change.");
      return;
    }
    
    await updateAppointmentStatus(appointmentId, newStatus, statusRemarks.trim());
    
    // Close modal
    setStatusChangeModal(null);
    setStatusRemarks("");
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/user/${userId}`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ enrollment_status: newStatus })
      });

      if (res.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, enrollment_status: newStatus } 
            : user
        ));
        
        // Refresh stats
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        
        // Remove user from local state
        setUsers(users.filter(user => user.id !== userId));
        
        // Refresh data
        fetchUsers();
        fetchAppointments();
        
        // Close confirmation dialog
        setDeleteConfirmation(null);
        
        alert(`User account deleted successfully: ${data.deletedUser.name} (${data.deletedUser.email})`);
      } else {
        const errorData = await res.json();
        alert(`Failed to delete user: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user. Please try again.");
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteConfirmation({
      user: user,
      message: `Are you sure you want to delete the account for ${user.name || user.email}?`,
      details: `Student ID: ${user.student_id}\nEmail: ${user.email}\n\nThis action cannot be undone and will also delete all associated appointments.`
    });
  };

  const isInvalidStudentId = (studentId) => {
    return !studentId || studentId.startsWith('GOOGLE_') || studentId.startsWith('TEMP_');
  };

  const formatDate = (date) => {
    if (!date) {
      return 'No date set';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatAppointmentType = (type, pictureOption) => {
    let formattedType = '';
    
    switch (type) {
      case 'term-renewal':
        formattedType = 'Term Renewal';
        break;
      case 'school-year-renewal':
        formattedType = 'SY Renewal';
        if (pictureOption) {
          formattedType += ` (${pictureOption === 'new-picture' ? 'New Picture' : 'Retain Picture'})`;
        }
        break;
      case 'lost-id':
        formattedType = 'Lost ID';
        break;
      default:
        formattedType = type;
    }
    
    return formattedType;
  };

  const formatAppointmentStatus = (status) => {
    switch (status) {
      case 'pending-approval':
        return 'Pending Approval';
      case 'on-hold':
        return 'On Hold';
      case 'for-printing':
        return 'For Printing';
      case 'to-claim':
        return 'To Claim';
      case 'confirmed':
        return 'Confirmed';
      case 'declined':
        return 'Declined';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending-approval':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-gray-200 text-gray-800';
      case 'for-printing':
        return 'bg-yellow-100 text-yellow-800';
      case 'to-claim':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnrollmentStatusColor = (status) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'not-enrolled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEnrollmentStatus = (status) => {
    switch (status) {
      case 'enrolled':
        return 'Enrolled';
      case 'registered':
        return 'Registered';
      case 'not-enrolled':
        return 'Not Enrolled';
      default:
        return 'Unknown';
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    
    // First filter by status if needed
    if (filterStatus !== 'all') {
      if (filterStatus === 'invalid-student-id') {
        sortableUsers = sortableUsers.filter(user => isInvalidStudentId(user.student_id));
      } else {
        sortableUsers = sortableUsers.filter(user => user.enrollment_status === filterStatus);
      }
    }
    
    // Then sort
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        // Special case for enrollment status to ensure enrolled is at top
        if (sortConfig.key === 'enrollment_status') {
          // Custom order: enrolled > registered > not-enrolled
          const statusOrder = { 'enrolled': 1, 'registered': 2, 'not-enrolled': 3 };
          const aValue = statusOrder[a[sortConfig.key]] || 999;
          const bValue = statusOrder[b[sortConfig.key]] || 999;
          
          if (sortConfig.direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
        
        // For other fields, use standard string comparison
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
        {/* Floating background elements */}
        <div className="absolute -top-6 -left-6 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-full" style={{ background: 'radial-gradient(circle, rgba(40, 73, 208, 0.12) 0%, transparent 70%)', animation: 'float 6s ease-in-out infinite reverse' }} />

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/30 text-center z-10 max-w-md mx-4">
          <div className="w-14 h-14 rounded-full mx-auto mb-6 border-4 border-blue-700 border-t-transparent animate-spin" />
          <h2 className="text-2xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
            <FiLock aria-hidden /> <span>Admin Dashboard</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2">Loading your administrative controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-8 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(40, 73, 208, 0.05) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite' }} />
      <div className="absolute bottom-16 left-8 w-52 h-52 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />

      {/* Modern Header */}
      <header className="sticky top-0 backdrop-blur-md bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600 text-white shadow-xl z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20 gap-6">
            <div className="flex items-center gap-4 min-w-0">
              <img src={nuLogo} alt="NU Logo" className="w-12 h-12 object-contain" />
              <div className="min-w-0">
                <div className="text-2xl font-extrabold bg-gradient-to-tr from-amber-400 to-amber-500 bg-clip-text text-transparent leading-tight truncate">
                  National University - Dasmarinas
                </div>
                <div className="text-white/80 font-medium flex items-center gap-2 text-sm">
                  <FiLock aria-hidden /> <span>Admin Dashboard</span>
                </div>
              </div>
            </div>
              <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-white/10 to-white/5 px-3 py-2 rounded-xl border border-white/20 shadow-md backdrop-blur-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 animate-ping-slow" aria-hidden></div>
                <span className="font-medium text-sm text-white/90 truncate max-w-[12rem] tracking-wide">
                  {admin?.email?.split('@')[0] || 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                bg-gradient-to-r from-rose-600 to-red-500 
                hover:from-rose-500 hover:to-red-400 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-400 ring-offset-slate-900
                shadow-md hover:shadow-lg
                transform transition-all duration-200 ease-out
                hover:-translate-y-[2px]
                active:translate-y-[0px] active:scale-[.97]"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Modern Main Content */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: 'transparent',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '40px 24px'
        }}>
        {/* Modern Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(40, 73, 208, 0.1), rgba(59, 130, 246, 0.1))',
              borderRadius: '50%'
            }}></div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#374151',
              margin: '0 0 16px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FiUsers aria-hidden /> <span>User Accounts</span></span></h3>
            <p style={{
              fontSize: '48px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #2849D0, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 20px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>{stats.totalUsers}</p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              <span style={{ color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FiCheckCircle aria-hidden /> <span>Enrolled: {stats.enrolledUsers}</span></span>
              <span style={{ color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FiEdit3 aria-hidden /> <span>Registered: {stats.registeredUsers}</span></span>
              <span style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FiXCircle aria-hidden /> <span>Not Enrolled: {stats.notEnrolledUsers}</span></span>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
              borderRadius: '50%'
            }}></div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#374151',
              margin: '0 0 16px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>⏳ Pending Appointments</h3>
            <p style={{
              fontSize: '48px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 20px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>{stats.pendingAppointments}</p>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              Awaiting processing or approval
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))',
              borderRadius: '50%'
            }}></div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#374151',
              margin: '0 0 16px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>✅ Completed Appointments</h3>
            <p style={{
              fontSize: '48px',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 20px 0',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>{stats.completedAppointments}</p>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif'
            }}>
              Ready for claiming or confirmed
            </div>
          </div>
        </div>
        
        {/* Modern Tabs */}
        <div className="mb-8 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-lg ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <nav className="flex w-full flex-wrap justify-center items-center gap-2" role="tablist" aria-label="Admin sections">
              {[
                { key: 'appointments', label: 'Appointments', icon: <FiCalendar aria-hidden /> },
                { key: 'users', label: 'Users', icon: <FiUsers aria-hidden /> },
                { key: 'calendar', label: 'Calendar', icon: <FiCalendar aria-hidden /> },
                { key: 'announcements', label: 'Announcements', icon: <FiBell aria-hidden /> },
                { key: 'analytics', label: 'Analytics', icon: <FiBarChart2 aria-hidden /> }
              ].map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab.key)}
                    className={
                      "inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition " +
                      (active
                        ? "bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-md"
                        : "text-slate-500 hover:text-blue-700 hover:bg-blue-50")
                    }
                  >
                    <span className={active ? "text-white" : "text-slate-500"}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
                    {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-[#B8860B]">Announcement Management</h2>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Form */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="Announcement title"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        rows={6}
                        placeholder="Write content or captions here..."
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URLs (comma separated)</label>
                      <input
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="https://... , https://..."
                        value={annImages}
                        onChange={(e) => setAnnImages(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Links (comma separated)</label>
                      <input
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="https://... , https://..."
                        value={annLinks}
                        onChange={(e) => setAnnLinks(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                      <input
                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        placeholder="e.g. id, schedule"
                        value={annTags}
                        onChange={(e) => setAnnTags(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => submitAnnouncement(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {annEditId ? 'Update & Publish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => submitAnnouncement(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Save Draft
                      </button>
                      {annEditId && (
                        <button
                          onClick={() => {
                            setAnnEditId(null);
                            setAnnTitle('');
                            setAnnContent('');
                            setAnnImages('');
                            setAnnLinks('');
                            setAnnTags('');
                          }}
                          className="px-4 py-2 border rounded-md"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>
                          
                          {/* List & Search */}
                          <div> {/* List container */}
                            <div className="mt-6 mb-4"> {/* Search bar wrapper */}
                              <input
                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-5 focus:ring-blue-400 transition"
                                placeholder="Search announcements"
                                value={annSearch}
                                onChange={(e) => { setAnnSearch(e.target.value); fetchAnnouncements(e.target.value); }}
                              />
                            </div> {/* /Search bar wrapper */}

                            <div className="space-y-3 max-h-[540px] overflow-y-auto"> {/* Announcements list */}
                              {announcements.map(item => (
                                <div
                                  key={item._id}
                                  className="p-3 border rounded bg-white hover:bg-blue-50 hover:cursor-pointer hover:bg-blue-100 hover:shadow-md transition duration-200"
                                >
                                  <div className="font-medium">{item.title || 'Untitled'}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(item.publishedAt || item.createdAt).toLocaleString()} {item.isPublished ? '' : '(Draft)'}
                                  </div>
                                  <div className="text-sm line-clamp-2">{item.content}</div>

                                  <div className="mt-2 space-x-2"> {/* Buttons */}
                                    <button
                                      onClick={() => editAnnouncement(item._id)}
                                      className="px-2 py-1 text-xs rounded bg-yellow-400 text-blue-900 hover:bg-yellow-500 transition"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => deleteAnnouncement(item._id)}
                                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 transition"
                                    >
                                      Delete
                                    </button>
                                  </div> {/* /Buttons */}
                                </div>
                              ))}
                            </div> {/* /Announcements list */}
                          </div> {/* /List container */}
                        </div>
                      </div>
                    )}

        {/* Tab Content */}
        {activeTab === 'appointments' && (
            <>
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-[#B8860B]">Appointment Management</h2>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-col md:flex-row md:items-end md:space-x-4 space-y-3 md:space-y-0">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter Mode</label>
                  <select
                    className="w-48 border rounded-md p-2"
                    value={apptFilterMode}
                    onChange={(e) => {
                      setApptFilterMode(e.target.value);
                      // Clear values when switching modes
                      setApptFilterDate('');
                      setApptFilterMonth('');
                      setApptFilterType('');
                    }}
                  >
                    <option value="all">All</option>
                    <option value="day">By Day</option>
                    <option value="month">By Month</option>
                    <option value="type">By Appointment Type</option>
                  </select>
                </div>

                {apptFilterMode === 'day' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
                    <input
                      type="date"
                      className="border rounded-md p-2"
                      value={apptFilterDate}
                      onChange={(e) => setApptFilterDate(e.target.value)}
                    />
                  </div>
                )}

                {apptFilterMode === 'month' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                    <input
                      type="month"
                      className="border rounded-md p-2"
                      value={apptFilterMonth}
                      onChange={(e) => setApptFilterMonth(e.target.value)}
                    />
                  </div>
                )}

                {apptFilterMode === 'type' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Appointment Type</label>
                    <select
                      className="border rounded-md p-2"
                      value={apptFilterType}
                      onChange={(e) => setApptFilterType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="term-renewal">Term Renewal</option>
                      <option value="school-year-renewal">SY Renewal (New Picture)</option>
                      <option value="school-year-renewal(retain)">SY Renewal (Retain Picture)</option>
                      <option value="lost-id">Lost ID</option>
                    </select>
                  </div>
                )}

                {(apptFilterMode === 'day' || apptFilterMode === 'month' || apptFilterMode === 'type') && (
                  <button
                    className="h-10 px-4 bg-gray-100 border rounded-md text-sm hover:bg-gray-200"
                    onClick={() => { setApptFilterMode('all'); setApptFilterDate(''); setApptFilterMonth(''); setApptFilterType(''); }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Remarks
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-800 font-semibold">
                                  {appointment.user?.first_name?.[0] || appointment.user?.email?.[0] || "U"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.user?.first_name && appointment.user?.last_name 
                                    ? `${appointment.user.first_name} ${appointment.user.last_name}`
                                    : appointment.user?.email?.split('@')[0] || "Unknown User"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {appointment.user?.student_id || "No ID"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                            <div className="text-sm text-gray-500">{appointment.timeSlot}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatAppointmentType(appointment.type, appointment.pictureOption)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {formatAppointmentStatus(appointment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {appointment.adminRemarks ? (
                                <div>
                                  <p className="text-gray-700 line-clamp-2" title={appointment.adminRemarks}>
                                    {appointment.adminRemarks}
                                  </p>
                                  {appointment.statusUpdatedBy && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      By: {appointment.statusUpdatedBy}
                                      {appointment.statusUpdatedAt && (
                                        <span className="ml-1">
                                          ({new Date(appointment.statusUpdatedAt).toLocaleDateString()})
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No remarks</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={appointment.status}
                              onChange={(e) => handleStatusChange(appointment.id, e.target.value, appointment.status)}
                            >
                              <option value="pending-approval">Pending Approval</option>
                              <option value="on-hold">On Hold</option>
                              <option value="for-printing">For Printing</option>
                              <option value="to-claim">To Claim</option>  
                              <option value="confirmed">Confirmed</option>
                              <option value="declined">Declined</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#B8860B]">User Management</h2>
              
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                  <select
                    id="status-filter"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="enrolled">Enrolled Only</option>
                    <option value="registered">Registered Only</option>
                    <option value="not-enrolled">Not Enrolled Only</option>
                    <option value="invalid-student-id">Invalid Student IDs</option>
                  </select>
                </div>
                
                <div>
                  <button
                    className={`py-2 px-4 border rounded-md text-sm font-medium mt-1 ${
                      sortConfig.key === 'last_name' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => requestSort('last_name')}
                  >
                    Sort Alphabetically
                    {sortConfig.key === 'last_name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('enrollment_status')}
                    >
                      Status
                      {sortConfig.key === 'enrollment_status' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUsers.length > 0 ? (
                    sortedUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-800 font-semibold">
                                {user.first_name?.[0] || user.email?.[0] || "U"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name && user.last_name 
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.email?.split('@')[0] || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className={`${isInvalidStudentId(user.student_id) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              {user.student_id || "No ID"}
                            </span>
                            {isInvalidStudentId(user.student_id) && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Invalid
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEnrollmentStatusColor(user.enrollment_status)}`}>
                            {formatEnrollmentStatus(user.enrollment_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col space-y-2">
                            <select
                              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={user.enrollment_status}
                              onChange={(e) => updateUserStatus(user.id, e.target.value)}
                            >
                              <option value="enrolled">Enrolled</option>
                              <option value="registered">Registered</option>
                              <option value="not-enrolled">Not Enrolled</option>
                            </select>
                            
                            {/* Remove Account button for all users */}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className={`w-full px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                isInvalidStudentId(user.student_id)
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                              title={isInvalidStudentId(user.student_id) 
                                ? "Remove account with invalid student ID" 
                                : "Remove user account"
                              }
                            >
                              Remove User
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between relative">
              <h2 className="text-lg font-semibold text-[#B8860B]">Calendar Management</h2>
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 rounded border border-[#B8860B] text-[#B8860B] text-sm 
                hover:bg-[#B8860B] hover:text-white hover:shadow-md 
                focus:outline-none focus:ring-2 focus:ring-[#B8860B] transition"
                  onClick={() => navigateClosureMonth(-1)}
                >
                 Previous
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold  
                px-3 py-1 rounded border border-[#1E3C72] text-[#0077B6]">
                  {calendarCurrentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                   className="px-3 py-1 rounded border border-[#B8860B] text-[#B8860B] text-sm 
             hover:bg-[#B8860B] hover:text-white hover:shadow-md 
             focus:outline-none focus:ring-2 focus:ring-[#B8860B] transition"
                  onClick={() => navigateClosureMonth(1)}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Simple calendar grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-600 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              {(() => {
                const firstDay = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 1).getDay();
                const daysInMonth = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth() + 1, 0).getDate();
                const cells = [];
                // Leading blanks
                for (let i = 0; i < firstDay; i++) cells.push(null);
                for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                while (cells.length % 7 !== 0) cells.push(null);

                return (
                  <div className="grid grid-cols-7 gap-2">
                    {cells.map((d, idx) => {
                      const dateObj = d
                        ? new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), d)
                        : null;
                      const closed = dateObj ? isDateClosed(dateObj) : false;
                      const label = d || '';

                      // Determine if the date is in the past (not including today)
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = dateObj ? dateObj < today : false;

                      const baseClasses = 'border rounded p-2 h-20 flex flex-col items-start justify-between';
                      const stateClasses = isPast
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : (closed ? 'bg-red-50 border-red-300 cursor-pointer' : 'bg-white cursor-pointer');

                      return (
                        <div
                          key={idx}
                          className={`${baseClasses} ${stateClasses} hover:bg-blue-50 hover:border-blue-300 transition-colors`}
                          onClick={() => {
                            if (!dateObj || isPast) return; // disable past dates
                            setSelectedClosureDate(dateObj);
                            setClosureRemarks(getClosureRemarks(dateObj));
                            setShowClosureModal(true);
                          }}
                        >
                          <div className={`text-xs ${isPast ? 'text-gray-400' : 'text-gray-700'}`}>{label}</div>
                          {closed && (
                            <div className={`text-[10px] font-medium ${isPast ? 'text-gray-400' : 'text-red-700'}`}>Closed</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal */}
            {showClosureModal && selectedClosureDate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
                  <div className="p-5 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">ITSO Office Close</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {selectedClosureDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                      className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Reason for closure (e.g., Holiday, University Event)"
                      value={closureRemarks}
                      onChange={(e) => setClosureRemarks(e.target.value)}
                    />
                    <div className="text-xs text-gray-500">This remark will be visible to students.</div>
                  </div>
                  <div className="px-5 py-4 border-t flex justify-end space-x-2">
                    {(() => {
                      const y = selectedClosureDate.getFullYear();
                      const m = String(selectedClosureDate.getMonth() + 1).padStart(2, '0');
                      const d = String(selectedClosureDate.getDate()).padStart(2, '0');
                      const dateStr = `${y}-${m}-${d}`;
                      const isClosed = closures.some(c => c.date === dateStr);
                      return (
                        <>
                          {isClosed && (
                            <button
                              className="px-4 py-2 rounded text-sm border border-red-300 text-red-700 hover:bg-red-50"
                              onClick={async () => {
                                await deleteClosure(dateStr);
                                setShowClosureModal(false);
                              }}
                            >
                              Remove Closure
                            </button>
                          )}
                          <button
                            className="px-4 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
                            onClick={async () => {
                              const ok = await createOrUpdateClosure(dateStr, closureRemarks);
                              if (ok) setShowClosureModal(false);
                            }}
                          >
                            Submit
                          </button>
                          <button
                            className="px-4 py-2 rounded text-sm border"
                            onClick={() => setShowClosureModal(false)}
                          >
                            Cancel
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#B8860B]">Analytics & Reports</h2>
                <div className="flex gap-2">
                  <button
                    onClick={generatePDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                </div>
              </div>
              
              <div className="p-6" ref={analyticsRef}>
                {/* Time Period Filter */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-600">View system statistics and generate reports</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Time Period:</label>
                    <select
                      value={analyticsTimePeriod}
                      onChange={(e) => setAnalyticsTimePeriod(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all-time">All Time</option>
                      <option value="last-30-days">Last 30 Days</option>
                      <option value="last-3-months">Last 3 Months</option>
                      <option value="last-6-months">Last 6 Months</option>
                      <option value="last-year">Last Year</option>
                    </select>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Enrolled Users</p>
                        <p className="text-2xl font-bold text-green-900">{stats.enrolledUsers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Pending Appointments</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.pendingAppointments}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Completed Appointments</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.completedAppointments}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* User Enrollment Chart */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 font-[inter]">User Enrollment Status</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 relative">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeDasharray={`${stats.totalUsers > 0 ? (stats.enrolledUsers / stats.totalUsers) * 100 : 0}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">
                              {stats.totalUsers > 0 ? Math.round((stats.enrolledUsers / stats.totalUsers) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Enrolled: {stats.enrolledUsers}</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Not Enrolled: {stats.totalUsers - stats.enrolledUsers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Status Chart */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Status</h3>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 relative">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray={`${(stats.pendingAppointments + stats.completedAppointments) > 0 ? (stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100 : 0}, 100`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">
                              {(stats.pendingAppointments + stats.completedAppointments) > 0 ? Math.round((stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Completed: {stats.completedAppointments}</span>
                          </div>
                          <div className="flex items-center justify-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-600">Pending: {stats.pendingAppointments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trends and Advanced Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Monthly Appointments Trend */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Appointments Trend</h3>
                    <div className="h-64">
                      <div className="flex items-end justify-between h-48 border-b border-gray-200 px-2">
                        {analyticsData.monthlyAppointments.map((data, index) => {
                          const maxValue = Math.max(...analyticsData.monthlyAppointments.map(d => d.appointments));
                          const height = maxValue > 0 ? (data.appointments / maxValue) * 100 : 0;
                          
                          return (
                            <div key={index} className="flex flex-col items-center flex-1 mx-1">
                              <div className="flex flex-col items-center justify-end h-full">
                                <div className="text-xs text-gray-600 mb-1">{data.appointments}</div>
                                <div 
                                  className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                                  style={{ height: `${height}%` }}
                                  title={`${data.month}: ${data.appointments} appointments`}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                                {data.month}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                          <span className="text-gray-600">Total Appointments</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Registration Trend */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">User Registration Trend</h3>
                    <div className="h-64">
                      <div className="flex items-end justify-between h-48 border-b border-gray-200 px-2">
                        {analyticsData.userRegistrationTrend.map((data, index) => {
                          const maxValue = Math.max(...analyticsData.userRegistrationTrend.map(d => d.newUsers));
                          const height = maxValue > 0 ? (data.newUsers / maxValue) * 100 : 0;
                          
                          return (
                            <div key={index} className="flex flex-col items-center flex-1 mx-1">
                              <div className="flex flex-col items-center justify-end h-full">
                                <div className="text-xs text-gray-600 mb-1">{data.newUsers}</div>
                                <div 
                                  className="bg-green-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                                  style={{ height: `${height}%` }}
                                  title={`${data.month}: ${data.newUsers} new users`}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                                {data.month}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                          <span className="text-gray-600">New Users</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Status Breakdown */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Status Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {analyticsData.appointmentStatusBreakdown.map((item, index) => {
                      const total = analyticsData.appointmentStatusBreakdown.reduce((sum, i) => sum + i.value, 0);
                      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                      
                      return (
                        <div key={index} className="text-center">
                          <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={item.color}
                                strokeWidth="3"
                                strokeDasharray={`${percentage}, 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-800">{percentage}%</span>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-800">{item.name}</div>
                          <div className="text-lg font-bold" style={{ color: item.color }}>{item.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-wide text-center mb-8">System Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-black-600">Enrollment Rate</span>
                          <span className="font-medium">{stats.totalUsers > 0 ? Math.round((stats.enrolledUsers / stats.totalUsers) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${stats.totalUsers > 0 ? (stats.enrolledUsers / stats.totalUsers) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-black-600">Completion Rate</span>
                          <span className="font-medium">
                            {(stats.pendingAppointments + stats.completedAppointments) > 0 ? 
                              Math.round((stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${(stats.pendingAppointments + stats.completedAppointments) > 0 ? 
                                (stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-black-600">System Utilization</span>
                          <span className="font-medium">
                            {stats.totalUsers > 0 ? Math.min(100, Math.round(((stats.pendingAppointments + stats.completedAppointments) / stats.totalUsers) * 100)) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${stats.totalUsers > 0 ? Math.min(100, ((stats.pendingAppointments + stats.completedAppointments) / stats.totalUsers) * 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-wide text-center">
                    Quick Stats
                  </h3>
                  <div className="space-y-3 font-[Inter]">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Average appointments per user</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {stats.totalUsers > 0 ? ((stats.pendingAppointments + stats.completedAppointments) / stats.totalUsers).toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Pending vs Completed Ratio</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {stats.completedAppointments > 0 ? (stats.pendingAppointments / stats.completedAppointments).toFixed(1) : 'N/A'}:1
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Enrollment vs Total Ratio</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {stats.totalUsers > 0 ? (stats.enrolledUsers / stats.totalUsers).toFixed(2) : '0.00'}:1
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">System Activity Score</span>
                      <span className="font-bold text-lg bg-gradient-to-r from-[#1E3C72] to-[#2A5298] text-transparent bg-clip-text">
                        {Math.min(100, Math.round(((stats.enrolledUsers * 0.4) + (stats.completedAppointments * 0.6)) / Math.max(1, stats.totalUsers) * 100))}%
                      </span>
                    </div>
                  </div>
                </div>
                </div>

                {/* Detailed Statistics Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900  tracking-wide text-center">Detailed Statistics</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total Registered Users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.totalUsers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            100%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Enrolled Users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.enrolledUsers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.totalUsers > 0 ? Math.round((stats.enrolledUsers / stats.totalUsers) * 100) : 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Not Enrolled Users
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.totalUsers - stats.enrolledUsers}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.totalUsers > 0 ? Math.round(((stats.totalUsers - stats.enrolledUsers) / stats.totalUsers) * 100) : 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total Appointments
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.pendingAppointments + stats.completedAppointments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            100%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Pending Appointments
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.pendingAppointments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(stats.pendingAppointments + stats.completedAppointments) > 0 ? Math.round((stats.pendingAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100) : 0}%
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Completed Appointments
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.completedAppointments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(stats.pendingAppointments + stats.completedAppointments) > 0 ? Math.round((stats.completedAppointments / (stats.pendingAppointments + stats.completedAppointments)) * 100) : 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-blue-800 text-white py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-white tracking-wide">
                © 2025 <span className="font-semibold">National University - Dasmarinas ITSO</span>. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-white tracking-wide">
                <span className="font-semibold">Admin Portal</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Status Change Modal */}
      {statusChangeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4 text-center">
                Change Appointment Status
              </h3>
              <div className="mt-4 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Changing status from <span className="font-semibold text-gray-700">{formatAppointmentStatus(statusChangeModal.currentStatus)}</span> to <span className="font-semibold text-blue-600">{formatAppointmentStatus(statusChangeModal.newStatus)}</span>
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {statusChangeModal.requiresRemarks ? 'Remarks (Required)' : 'Remarks (Optional)'}
                  </label>
                  <textarea
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder={
                      statusChangeModal.newStatus === 'on-hold' 
                        ? 'Please explain why this appointment is being put on hold...'
                        : statusChangeModal.newStatus === 'declined'
                        ? 'Please explain why this appointment is being declined...'
                        : statusChangeModal.newStatus === 'for-printing'
                        ? 'Add any printing instructions or notes...'
                        : 'Add any additional notes or comments...'
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows="4"
                    required={statusChangeModal.requiresRemarks}
                  />
                  {statusChangeModal.requiresRemarks && (
                    <p className="text-xs text-red-600 mt-1">
                      * Remarks are required for this status change
                    </p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        This status change and remarks will be visible to the student in their dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    setStatusChangeModal(null);
                    setStatusRemarks("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusChange}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete User Account</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  {deleteConfirmation.message}
                </p>
                <div className="bg-gray-50 p-3 rounded-md text-left">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {deleteConfirmation.details}
                  </pre>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(deleteConfirmation.user.id)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;