import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("cc_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cc_sidebar_collapsed", collapsed);
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative overflow-x-hidden">
      {/* Ambient glowing background gradients */}
      <div className="fixed -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-neon-cyan/5 blur-[150px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-neon-purple/5 blur-[150px] pointer-events-none z-0" />

      {/* Grid Pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 z-10 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Header onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
