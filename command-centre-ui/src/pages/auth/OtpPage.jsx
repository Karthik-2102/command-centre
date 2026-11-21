import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, RefreshCw, ArrowLeft, Clock, Mail } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Button from "../../components/ui/Button";

export default function OtpPage() {
  const {
    email,
    otpExpiry,
    resendCooldown,
    verifyOtp,
    resendOtp,
    resetAuthFlow,
    actionLoading,
    authError,
    setAuthError,
    authNotice,
  } = useAuth();

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [localError, setLocalError] = useState("");
  const [remainingTime, setRemainingTime] = useState(otpExpiry || 300);
  const inputRefs = useRef([]);

  // Expiration countdown
  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleDigitChange = (index, value) => {
    // Only accept numeric
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Handle paste or single char
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    } else {
      newDigits[index] = value;
      setDigits(newDigits);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (localError) setLocalError("");
    if (authError) setAuthError("");

    // Auto submit if all 6 digits entered
    const combined = newDigits.join("");
    if (combined.length === 6) {
      verifyOtp(combined);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 6) {
      setLocalError("Please enter all 6 digits of the verification code.");
      return;
    }
    verifyOtp(otp);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setDigits(["", "", "", "", "", ""]);
    setRemainingTime(300);
    const success = await resendOtp();
    if (success) {
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-xs text-gray-400">
          We sent a 6-digit verification code to
        </p>
        <p className="text-sm font-semibold text-white mt-0.5 truncate">
          {email}
        </p>
      </div>

      {/* Secure Dispatch Confirmation Banner */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 text-center font-mono animate-fade-in flex items-center justify-center gap-2">
        <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Verification code dispatched to your inbox. Check your email.</span>
      </div>

      {/* 6 Digit Input Group */}
      <div className="flex justify-between gap-2 sm:gap-2.5">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            autoFocus={idx === 0}
            className={`w-11 sm:w-12 h-14 text-center text-xl font-mono font-bold rounded-xl bg-[#0b1017] border transition-all duration-200 focus:outline-none ${
              digit
                ? "border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-neon-cyan/5"
                : "border-[#1e293b] text-gray-200 hover:border-cyan-500/40 focus:border-neon-cyan focus:shadow-glow-cyan"
            }`}
          />
        ))}
      </div>

      {/* Error display */}
      {(localError || authError) && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center animate-fade-in">
          {localError || authError}
        </div>
      )}

      {/* Expiration Timer & Resend */}
      <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span>Expires in:</span>
          <span
            className={`font-semibold ${
              remainingTime < 60 ? "text-red-400" : "text-neon-cyan"
            }`}
          >
            {formatTime(remainingTime)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || actionLoading}
          className={`flex items-center gap-1.5 transition-colors ${
            resendCooldown > 0
              ? "text-gray-600 cursor-not-allowed"
              : "text-neon-cyan hover:text-cyan-300 cursor-pointer"
          }`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              actionLoading ? "animate-spin" : ""
            }`}
          />
          <span>
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Code"}
          </span>
        </button>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          loading={actionLoading}
          className="w-full"
          size="lg"
        >
          <span>Verify & Unlock Console</span>
        </Button>

        <button
          type="button"
          onClick={resetAuthFlow}
          className="w-full text-xs text-gray-500 hover:text-gray-300 flex items-center justify-center gap-1.5 py-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel and return to login</span>
        </button>
      </div>
    </form>
  );
}
