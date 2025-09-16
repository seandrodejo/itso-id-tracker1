import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Calendar from "./pages/SimpleCalendar";
import CalendarLanding from "./pages/CalendarLanding";
import Announcements from "./pages/Announcements";
import AnnouncementDetails from "./pages/AnnouncementDetails";
import AuthenticatedAnnouncements from "./pages/AuthenticatedAnnouncements";
import AnnouncementDetailsAuthed from "./pages/AnnouncementDetailsAuthed";
import AboutUs from "./pages/AboutUs";
import AuthenticatedAboutUs from "./pages/AuthenticatedAboutUs";
import AuthSuccess from "./pages/AuthSuccess";
import GoogleSignupComplete from "./pages/GoogleSignupComplete";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/announcements"
          element={
            <ProtectedRoute>
              <AuthenticatedAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/announcements/:id"
          element={
            <ProtectedRoute>
              <AnnouncementDetailsAuthed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <AuthenticatedAboutUs />
            </ProtectedRoute>
          }
        />
        <Route path="/calendar-public" element={<CalendarLanding />} />
        <Route path="/announcements-public" element={<Announcements />} />
        <Route path="/announcements-public/:id" element={<AnnouncementDetails />} />
        <Route path="/about-public" element={<AboutUs />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/google-signup-complete" element={<GoogleSignupComplete />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);