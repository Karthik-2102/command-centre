import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../layouts/AuthLayout";
import LoginPage from "./LoginPage";
import PasswordPage from "./PasswordPage";
import OtpPage from "./OtpPage";
import Spinner from "../../components/ui/Spinner";

export default function AuthFlowPage() {
  const { user, loading, step } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Spinner size="lg" color="cyan" />
      </div>
    );
  }

  // If already authenticated, redirect to root dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  const stepMeta = {
    EMAIL: {
      title: "Security Identification",
      subtitle: "Enter your registered owner email address to begin sign-in.",
    },
    PASSWORD: {
      title: "Dynamic Password Verification",
      subtitle: "Enter the generated 8+ character password sent to your Gmail inbox.",
    },
    OTP: {
      title: "2FA Security Verification",
      subtitle: "Check your email for your single-use 6-digit access code.",
    },
  };

  const meta = stepMeta[step] || stepMeta.EMAIL;

  return (
    <AuthLayout title={meta.title} subtitle={meta.subtitle}>
      {step === "EMAIL" && <LoginPage />}
      {step === "PASSWORD" && <PasswordPage />}
      {step === "OTP" && <OtpPage />}
    </AuthLayout>
  );
}
