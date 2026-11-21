import React, { useState, useEffect } from "react";
import { Menu, Calendar, Sparkles, Terminal, Bot } from "lucide-react";
import useAuth from "../hooks/useAuth";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import ProfileDropdown from "./ProfileDropdown";
import FocusTimer from "./FocusTimer";
import CheatSheetModal from "./CheatSheetModal";
import AiMentorDrawer from "./AiMentorDrawer";
import { getGreeting } from "../utils/formatters";

export default function Header({ onToggleMobileSidebar }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState("");
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [aiMentorOpen, setAiMentorOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setAiMentorOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  const greeting = getGreeting();

  return (
    <>
      <header className="sticky top-0 z-30 h-20 w-full bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
        {/* Left Greeting & Mobile Toggle */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-dark-card/80 border border-dark-border text-gray-400 hover:text-white hover:border-neon-cyan/40 focus:outline-none"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[160px] sm:max-w-none">
                {greeting}, {user?.name || "Karthik"}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[10px] font-mono">
                <Sparkles className="w-3 h-3" />
                <span>Target: 3h / Day</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{currentDate}</span>
              <span className="text-gray-600 hidden sm:inline">&bull;</span>
              <span className="text-neon-cyan/80 hidden sm:inline">10-Month Sprint</span>
            </div>
          </div>
        </div>

        {/* Right Controls: Focus Timer, Quick Pad, Notifications, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Learning Mentor Trigger */}
          <button
            type="button"
            onClick={() => setAiMentorOpen(true)}
            title="Open Personal AI Learning Mentor (Ctrl + M)"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-neon-cyan/15 via-neon-emerald/10 to-indigo-500/15 border border-neon-cyan/40 text-neon-cyan hover:text-white hover:border-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.12)] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5 group"
          >
            <Bot className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform animate-pulse" />
            <span className="hidden xl:inline text-xs font-mono font-bold tracking-wide">AI Mentor</span>
            <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-mono bg-dark-bg/80 border border-neon-cyan/30 text-neon-cyan font-medium">
              Ctrl+M
            </span>
          </button>

          {/* Integrated Focus Timer */}
          <FocusTimer />

          {/* Quick-Pad / Cheat Sheet Trigger */}
          <button
            type="button"
            onClick={() => setCheatSheetOpen(true)}
            title="Open Developer Quick-Pad (Ctrl + K)"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-dark-card/80 border border-dark-border text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-mono font-medium">Quick-Pad</span>
            <span className="hidden sm:inline-block px-1 py-0.2 rounded text-[9px] font-mono bg-dark-bg border border-dark-border text-gray-500">
              Ctrl+K
            </span>
          </button>

          <NotificationBell />
          <ThemeToggle />
          <div className="h-6 w-px bg-dark-border/80 mx-0.5 hidden sm:block" />
          <ProfileDropdown />
        </div>
      </header>

      {/* Developer Command Quick-Pad Modal */}
      <CheatSheetModal
        isOpen={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
      />

      {/* Personal AI Learning Mentor Slide-Out Drawer */}
      <AiMentorDrawer
        isOpen={aiMentorOpen}
        onClose={() => setAiMentorOpen(false)}
      />
    </>
  );
}
