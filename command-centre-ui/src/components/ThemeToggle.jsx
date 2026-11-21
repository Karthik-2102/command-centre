import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Titanium Slate Theme (Eye-Care)" : "Switch to Midnight Cyber Theme"}
      className="relative p-2.5 rounded-xl bg-dark-card/80 border border-dark-border text-gray-400 hover:text-neon-cyan hover:border-neon-cyan/40 hover:shadow-glow-cyan transition-all duration-300 focus:outline-none"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
        ) : (
          <Moon className="w-5 h-5 text-neon-purple transition-transform duration-300 rotate-0 hover:-rotate-45" />
        )}
      </div>
    </button>
  );
}
