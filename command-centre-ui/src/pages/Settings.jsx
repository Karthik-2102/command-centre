import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  KeyRound,
  GraduationCap,
  Target,
  Clock,
  Terminal,
  Database,
  CheckCircle2,
  AlertCircle,
  Lock,
  LogOut,
  Laptop,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useAuth from "../hooks/useAuth";
import api from "../api/axios";

export default function Settings() {
  const { user, logout } = useAuth();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordSuccess("Master password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || "Failed to update password. Verify your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-neon-cyan font-mono text-xs uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>System Parameters & Credentials</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Security
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Manage your learning profile, 2FA credentials, and system architecture parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Profile Card */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-dark-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Learning Profile Specification
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configured parameters for your 10-month transition to job readiness
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                Verified Owner
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Owner Name</span>
                <p className="text-white font-bold">{user?.name || "Karthik"}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Education</span>
                <p className="text-white font-semibold">Online BCA, Manipal University Jaipur</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Career Goal</span>
                <p className="text-neon-cyan font-bold">Backend Developer &rarr; Software Engineer</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Target Timeline</span>
                <p className="text-white font-semibold">10 Months (8–12 Flexible)</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Primary Stack</span>
                <p className="text-neon-purple font-semibold">Java 21 &bull; Spring Boot &bull; PostgreSQL</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/70 border border-dark-border/80 space-y-1">
                <span className="text-[10px] text-gray-500 uppercase">Daily Study Commitment</span>
                <p className="text-amber-400 font-bold">3.0 Hours / Day</p>
              </div>
            </div>
          </Card>

          {/* Change Master Password Form */}
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-dark-border/80 pb-4">
              <div className="p-2.5 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Update Master Password
                </h3>
                <p className="text-xs text-gray-400">
                  Password is encrypted using BCrypt (rounds: 12) before database persistence.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="New Master Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="md"
                  loading={passwordLoading}
                  className="shadow-glow-purple"
                >
                  <span>Update Password</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column (1 Col): Security & Session Info */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-neon-cyan/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Security Posture</h4>
                <p className="text-[11px] text-gray-400">Strict Owner-Only 2FA</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border/80">
                <p className="text-[10px] text-gray-500 uppercase">2FA Delivery</p>
                <p className="text-emerald-400 font-semibold mt-0.5">Resend Email API</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border/80">
                <p className="text-[10px] text-gray-500 uppercase">OTP Hashing</p>
                <p className="text-neon-cyan font-semibold mt-0.5">SHA-256 (Pre-DB Hash)</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border/80">
                <p className="text-[10px] text-gray-500 uppercase">Session Storage</p>
                <p className="text-white mt-0.5">HTTP-Only Cookie (24h)</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border/80">
                <p className="text-[10px] text-gray-500 uppercase">Target OS</p>
                <p className="text-gray-300 mt-0.5">Windows</p>
              </div>
            </div>
          </Card>

          {/* Session Termination Button */}
          <Card className="p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Session Management</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Terminating your active session invalidates the authentication token in the PostgreSQL database and clears the HTTP-only cookie.
            </p>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="w-full border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log Out of Console</span>
            </Button>
          </Card>

          {/* System Version */}
          <div className="text-center text-[11px] font-mono text-gray-600 space-y-1">
            <p>Personal Developer Command Centre</p>
            <p>Spring Boot 3.2.5 &bull; React 18 &bull; PostgreSQL 16</p>
          </div>
        </div>
      </div>
    </div>
  );
}
