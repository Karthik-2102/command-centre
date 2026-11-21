import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Settings, GraduationCap, Target, ChevronDown } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-dark-card/80 border border-dark-border hover:border-neon-cyan/40 hover:shadow-glow-cyan transition-all duration-300 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple p-0.5 flex items-center justify-center font-bold text-dark-bg text-sm shadow-sm">
          <span>{user?.name ? user.name[0].toUpperCase() : "K"}</span>
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-gray-200 leading-tight">
            {user?.name || "Karthik"}
          </span>
          <span className="text-[10px] text-neon-cyan font-mono leading-tight">
            Owner
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-[#111119] border border-[#1e1e2e] shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 overflow-hidden animate-slide-up">
          {/* Header Profile Section */}
          <div className="p-4 bg-[#0a0a0f] border-b border-[#1e1e2e]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-neon-cyan to-neon-purple p-0.5 flex items-center justify-center font-bold text-dark-bg text-base shadow-glow-cyan">
                <span>{user?.name ? user.name[0].toUpperCase() : "K"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || "Karthik"}
                </p>
                <p className="text-xs text-gray-400 truncate font-mono">
                  {user?.email || "Owner Console"}
                </p>
              </div>
            </div>

            {/* Profile Context Tags */}
            <div className="mt-3.5 space-y-1.5 pt-3 border-t border-dark-border/50 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                <span className="truncate">Online BCA &bull; Manipal University Jaipur</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                <span className="truncate">Backend Dev &rarr; Software Engineer</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-2 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Console Settings</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="p-2 border-t border-dark-border/60 bg-dark-bg/40">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session (Logout)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
