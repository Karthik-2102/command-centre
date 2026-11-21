import React from "react";

export default function Spinner({ size = "md", color = "cyan", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  const colorMap = {
    cyan: "border-neon-cyan/20 border-t-neon-cyan",
    purple: "border-neon-purple/20 border-t-neon-purple",
    white: "border-white/20 border-t-white",
    dark: "border-dark-bg/30 border-t-dark-bg",
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeMap[size] || sizeMap.md} ${
        colorMap[color] || colorMap.cyan
      } ${className}`}
    />
  );
}
