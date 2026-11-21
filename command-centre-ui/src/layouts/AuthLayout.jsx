import React from "react";
import { Terminal, ShieldCheck, Cpu } from "lucide-react";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-dark-bg overflow-hidden select-none">
      {/* Background ambient neon glow spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neon-cyan/15 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-neon-purple/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-neon-cyan/5 blur-[160px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-dark-card/90 border border-neon-cyan/30 shadow-glow-cyan mb-4">
            <Terminal className="w-7 h-7 text-neon-cyan animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Command Centre
          </h1>

          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <p className="text-xs uppercase tracking-widest font-mono text-neon-cyan/80">
              Personal Developer Console
            </p>
          </div>
        </div>

        {/* Auth Box with Glassmorphism */}
        <div className="relative rounded-3xl bg-dark-card/85 backdrop-blur-2xl border border-dark-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-8">
          {/* Subtle neon top edge highlight */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />

          {/* Form Header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h2 className="text-lg font-semibold text-white tracking-wide">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Main Form Content */}
          {children}

          {/* Footer Security Badges */}
          <div className="mt-8 pt-6 border-t border-dark-border/60 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <div className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-neon-cyan" />
              <span>2FA Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neon-purple" />
              <span>Owner Access Only</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright / system note */}
        <div className="text-center mt-6 text-xs text-gray-600 font-mono">
          Strictly Private &bull; 8–12 Month Backend Engineering Roadmap
        </div>
      </div>
    </div>
  );
}
