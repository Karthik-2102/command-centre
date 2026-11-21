import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Sparkles, BookOpen, Clock } from "lucide-react";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Command Centre Online",
      message: "Welcome Karthik. Your 10-month backend engineering journey is live.",
      time: "Just now",
      icon: Sparkles,
      color: "text-neon-cyan",
      unread: true,
    },
    {
      id: 2,
      title: "Daily Target: 3.0 Hours",
      message: "Consistent 3 hours of daily focused study planned for Stage 1.",
      time: "Today",
      icon: Clock,
      color: "text-neon-purple",
      unread: true,
    },
    {
      id: 3,
      title: "Stage 1: Java Fundamentals",
      message: "Variables, conditions, loops, and methods are waiting in your roadmap.",
      time: "1d ago",
      icon: BookOpen,
      color: "text-emerald-400",
      unread: false,
    },
  ]);

  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="System Notifications"
        className="relative p-2.5 rounded-xl bg-dark-card/80 border border-dark-border text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/40 hover:shadow-glow-cyan transition-all duration-300 focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-cyan" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#111119] border border-[#1e1e2e] shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e1e2e] bg-[#0a0a0f]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-gray-400 hover:text-neon-cyan flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-dark-border/50 max-h-80 overflow-y-auto">
            {notifications.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-start gap-3.5 transition-colors ${
                    item.unread ? "bg-neon-cyan/5 hover:bg-neon-cyan/10" : "hover:bg-dark-hover"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl bg-dark-bg/80 border border-dark-border shrink-0 ${item.color}`}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-200 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-dark-bg/60 border-t border-dark-border/60 text-center">
            <span className="text-[11px] font-mono text-gray-500">
              Command Centre Intelligence Hub
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
