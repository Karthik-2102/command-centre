import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthFlowPage from "./pages/auth/AuthFlowPage";

// Pages
import Overview from "./pages/Overview";
import Roadmap from "./pages/Roadmap";
import Tasks from "./pages/Tasks";
import DsaPractice from "./pages/DsaPractice";
import Projects from "./pages/Projects";
import Calendar from "./pages/Calendar";
import CareerPrep from "./pages/CareerPrep";
import Analytics from "./pages/Analytics";
import WeeklyReview from "./pages/WeeklyReview";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<AuthFlowPage />} />

          {/* Protected Command Centre Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/dsa" element={<DsaPractice />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/career" element={<CareerPrep />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reviews" element={<WeeklyReview />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
