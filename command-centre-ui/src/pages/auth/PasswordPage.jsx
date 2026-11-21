import React, { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function PasswordPage() {
  const {
    email,
    verifyPassword,
    generateDynamicPassword,
    resetAuthFlow,
    actionLoading,
    authError,
    setAuthError,
    authNotice,
    resendCooldown,
  } = useAuth();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [validitySeconds, setValiditySeconds] = useState(180);

  // 3-minute validity countdown
  useEffect(() => {
    if (validitySeconds <= 0) return;
    const interval = setInterval(() => {
      setValiditySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [validitySeconds]);

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setAuthError("");

    if (!password.trim()) {
      setLocalError("Dynamic password is required.");
      return;
    }

    if (password.trim().length < 8) {
      setLocalError("Password must be at least 10 characters (e.g. Vikash@#02 or Vrsye@2589).");
      return;
    }

    await verifyPassword(password.trim());
  };

  const handleGenerate = async () => {
    if (resendCooldown > 0 || actionLoading) return;
    const ok = await generateDynamicPassword();
    if (ok) {
      setValiditySeconds(180);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      {/* Identity Pill */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-dark-bg/60 border border-dark-border/80">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">
            Authenticated Identity
          </span>
          <span className="text-sm font-medium text-neon-cyan truncate max-w-[200px]">
            {email}
          </span>
        </div>
        <button
          type="button"
          onClick={resetAuthFlow}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-dark-hover"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Change</span>
        </button>
      </div>

      {/* Dynamic Password Option (Just like OTP generator) */}
      <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">
              10-Character Password Generator
            </span>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={resendCooldown > 0 || actionLoading}
            className="text-xs font-medium text-neon-cyan hover:text-cyan-300 disabled:text-gray-500 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded-lg bg-dark-bg/80 border border-dark-border hover:border-neon-cyan/50"
          >
            <RefreshCw className={`w-3 h-3 ${actionLoading ? "animate-spin" : ""}`} />
            <span>
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Generate Password"}
            </span>
          </button>
        </div>

        {authNotice ? (
          <div className="flex items-start justify-between gap-2 text-xs text-green-400 bg-green-950/30 border border-green-800/40 rounded-lg p-2.5">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
              <span>{authNotice}</span>
            </div>
            {validitySeconds > 0 ? (
              <span className="shrink-0 flex items-center gap-1 font-mono text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                <Clock className="w-3 h-3" />
                {formatCountdown(validitySeconds)}
              </span>
            ) : (
              <span className="shrink-0 font-mono text-[11px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                Expired
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            Click <strong>Generate Password</strong> to receive your 10-character dynamic password in Gmail (e.g. <span className="font-mono text-purple-300">Vrsye@2589</span>, <span className="font-mono text-purple-300">Vikash@#02</span>). Valid for 3 minutes.
          </p>
        )}
      </div>

      {/* Password Input below Generate Password */}
      <div>
        <Input
          label="Enter 10-Character Dynamic Password"
          type={showPassword ? "text" : "password"}
          placeholder="e.g. Vrsye@2589 or Vikash@#02"
          icon={KeyRound}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (localError) setLocalError("");
            if (authError) setAuthError("");
          }}
          error={localError || authError}
          autoFocus
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
        />
        <p className="text-[11px] text-gray-500 mt-1 pl-1">
          10 characters (alphabets, symbols & numbers). Valid for 3 minutes.
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          loading={actionLoading}
          className="w-full shadow-glow-cyan"
          size="lg"
        >
          <span>Verify Password & Get 2FA OTP</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </form>
  );
}
