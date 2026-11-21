import React, { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-wider text-gray-400"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-gray-500 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0b1017] border text-gray-100 placeholder-gray-500 transition-all duration-300 focus:outline-none ${
            Icon ? "pl-10" : ""
          } ${rightElement ? "pr-12" : ""} ${
            error
              ? "border-rose-500/70 text-rose-100 placeholder-rose-300/40 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/40 focus:shadow-[0_0_15px_rgba(244,63,94,0.25)]"
              : "border-[#1e293b] hover:border-cyan-500/40 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/40 focus:shadow-[0_0_18px_rgba(0,240,255,0.25)]"
          } ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 flex items-center">{rightElement}</div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400 flex items-center gap-1.5 mt-1 font-mono animate-fade-in">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
