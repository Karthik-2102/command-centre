import React from "react";

export default function Card({
  children,
  className = "",
  glow = false,
  hoverable = false,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl bg-dark-card/70 backdrop-blur-xl border border-dark-border/80 transition-all duration-300 ${
        glow ? "border-neon-cyan/30 shadow-glow-cyan" : ""
      } ${
        hoverable
          ? "hover:border-neon-cyan/40 hover:shadow-glow-cyan hover:-translate-y-0.5"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
