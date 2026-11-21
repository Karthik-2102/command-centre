import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  CheckSquare,
  Code2,
  FolderGit2,
  Calendar,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Terminal,
  X,
  Target,
} from "lucide-react";

export const NAV_ITEMS = [
  { path: "/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/roadmap", label: "Learning Roadmap", icon: Map },
  { path: "/tasks", label: "My Tasks", icon: CheckSquare },
  { path: "/dsa", label: "DSA Practice", icon: Code2 },
  { path: "/projects", label: "Projects", icon: FolderGit2 },
  { path: "/calendar", label: "Study Calendar", icon: Calendar },
  { path: "/career", label: "Career Preparation", icon: Briefcase },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/reviews", label: "Weekly Reviews", icon: FileText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const location = useLocation();

  const isRouteActive = (itemPath) => {
    if (itemPath === "/overview") {
      return location.pathname === "/" || location.pathname === "/overview";
    }
    return location.pathname.startsWith(itemPath);
  };

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand / Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-dark-border/80">
        <NavLink
          to="/overview"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-2xl bg-dark-card border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shadow-glow-cyan shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Terminal className="w-5 h-5 animate-pulse" />
          </div>

          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Command Centre
              </span>
              <span className="text-[10px] font-mono text-neon-cyan/80 tracking-wider">
                PERSONAL CONSOLE
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              title={collapsed && !mobileOpen ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                active
                  ? "bg-gradient-to-r from-neon-cyan/15 to-neon-purple/10 text-white border border-neon-cyan/30 shadow-glow-cyan"
                  : "text-gray-400 hover:text-gray-200 hover:bg-dark-hover/70"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  active
                    ? "text-neon-cyan"
                    : "text-gray-400 group-hover:text-neon-cyan"
                }`}
              />

              {(!collapsed || mobileOpen) && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Active side glow pill */}
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-neon-cyan" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Roadmap Status Mini-Card */}
      {(!collapsed || mobileOpen) && (
        <div className="p-4 m-3 rounded-2xl bg-dark-bg/60 border border-dark-border/80 text-xs">
          <div className="flex items-center justify-between text-gray-400 mb-1.5 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-neon-cyan">
              <Target className="w-3.5 h-3.5" />
              <span>Stage 1 of 6</span>
            </span>
            <span className="text-gray-400 font-semibold">Month 1</span>
          </div>
          <p className="font-semibold text-white truncate text-xs">
            Java Fundamentals
          </p>
          <div className="w-full bg-dark-border h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full transition-all duration-500"
              style={{ width: "15%" }}
            />
          </div>
        </div>
      )}

      {/* Desktop Collapse / Expand Toggle Button */}
      <div className="hidden lg:flex p-3 border-t border-dark-border/80 items-center justify-end">
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-hover transition-colors focus:outline-none"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span>Collapse</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-dark-card/90 backdrop-blur-2xl border-r border-dark-border/80 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 h-full bg-dark-card border-r border-dark-border shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
