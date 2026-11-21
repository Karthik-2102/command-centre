import React from "react";
import Spinner from "./Spinner";

export default function Button({
  children,
  type = "button",
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost"
  size = "md", // "sm" | "md" | "lg"
  loading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-neon-cyan via-cyan-400 to-neon-purple text-dark-bg font-semibold hover:shadow-glow-cyan active:scale-[0.98]",
    emerald:
      "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-dark-bg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-[0.98]",
    secondary:
      "bg-dark-card/90 text-gray-200 border border-dark-border hover:border-neon-cyan/40 hover:text-neon-cyan hover:shadow-glow-cyan active:scale-[0.98]",
    danger:
      "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-semibold shadow-[0_0_18px_rgba(244,63,94,0.3)] active:scale-[0.98]",
    ghost:
      "text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/5",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" color={variant === "primary" ? "dark" : "cyan"} />}
      <span>{children}</span>
    </button>
  );
}
