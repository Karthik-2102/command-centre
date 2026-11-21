import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("EMAIL"); // "EMAIL" | "PASSWORD" | "OTP"
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpExpiry, setOtpExpiry] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Check active session on mount
  useEffect(() => {
    checkAuthSession();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const checkAuthSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      if (res.data?.success && res.data?.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkEmail = async (inputEmail) => {
    try {
      setActionLoading(true);
      setAuthError("");
      const res = await api.post("/auth/login", { email: inputEmail });
      if (res.data?.success) {
        const data = res.data.data;
        setEmail(inputEmail);
        if (data.message) {
          setAuthNotice(data.message);
        }
        setStep("PASSWORD");
        return true;
      }
      return false;
    } catch (err) {
      const isConnectionError = !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network Error");
      const msg = isConnectionError
        ? "Cannot connect to backend server. Please make sure the Spring Boot application is started on port 8080."
        : (err.response?.data?.message || "Access denied. Only the registered owner can sign in.");
      setAuthError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const generateDynamicPassword = async () => {
    try {
      setActionLoading(true);
      setAuthError("");
      const res = await api.post("/auth/generate-password", { email });
      if (res.data?.success) {
        setAuthNotice(res.data.data?.message || "New dynamic password sent to your Gmail!");
        setResendCooldown(60);
        return true;
      }
      return false;
    } catch (err) {
      setAuthError(err.response?.data?.message || "Failed to generate dynamic password. Please try again.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const verifyPassword = async (inputPassword) => {
    try {
      setActionLoading(true);
      setAuthError("");
      const res = await api.post("/auth/verify-password", {
        email,
        password: inputPassword,
      });

      if (res.data?.success) {
        const data = res.data.data;
        setTempToken(data.tempToken);
        setOtpExpiry(data.expiresInSeconds || 300);
        setResendCooldown(data.resendCooldownSeconds || 60);
        if (data.message) {
          setAuthNotice(data.message);
        }
        setStep("OTP");
        return true;
      }
      return false;
    } catch (err) {
      const isConnectionError = !err.response || err.code === "ERR_NETWORK" || err.message?.includes("Network Error");
      const msg = isConnectionError
        ? "Cannot connect to backend server. Please verify port 8080."
        : (err.response?.data?.message || "Invalid password. Access rejected.");
      setAuthError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const verifyOtp = async (inputOtp) => {
    try {
      setActionLoading(true);
      setAuthError("");
      const res = await api.post("/auth/verify-otp", {
        tempToken,
        otp: inputOtp,
      });

      if (res.data?.success) {
        const data = res.data.data;
        if (data.sessionToken) {
          localStorage.setItem("command_centre_session", data.sessionToken);
        }
        const owner = data.owner;
        setUser(owner);
        setStep("EMAIL");
        setEmail("");
        setTempToken("");
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid or expired verification code.";
      setAuthError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return false;
    try {
      setActionLoading(true);
      setAuthError("");
      const res = await api.post("/auth/resend-otp", { tempToken });
      if (res.data?.success) {
        const data = res.data.data;
        setTempToken(data.tempToken);
        setOtpExpiry(data.expiresInSeconds || 300);
        setResendCooldown(data.resendCooldownSeconds || 60);
        if (data.message) {
          setAuthNotice(data.message);
        }
        return true;
      }
      return false;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend verification code.";
      setAuthError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      // Ignore error during logout
    } finally {
      localStorage.removeItem("command_centre_session");
      setUser(null);
      setStep("EMAIL");
      setEmail("");
      setTempToken("");
    }
  };

  const resetAuthFlow = () => {
    setStep("EMAIL");
    setEmail("");
    setTempToken("");
    setAuthError("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        step,
        email,
        tempToken,
        otpExpiry,
        resendCooldown,
        authError,
        authNotice,
        setAuthNotice,
        actionLoading,
        checkEmail,
        generateDynamicPassword,
        verifyPassword,
        verifyOtp,
        resendOtp,
        logout,
        resetAuthFlow,
        checkAuthSession,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
