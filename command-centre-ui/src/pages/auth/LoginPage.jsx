import React, { useState } from "react";
import { Mail, ArrowRight, Lock } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const { checkEmail, actionLoading, authError, setAuthError } = useAuth();
  const [inputEmail, setInputEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setAuthError("");

    if (!inputEmail.trim()) {
      setLocalError("Owner email address is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail.trim())) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    await checkEmail(inputEmail.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      <Input
        label="Owner Identity"
        type="email"
        placeholder="Enter your email address"
        icon={Mail}
        value={inputEmail}
        onChange={(e) => {
          setInputEmail(e.target.value);
          if (localError) setLocalError("");
          if (authError) setAuthError("");
        }}
        error={localError || authError}
        autoFocus
        autoComplete="off"
      />

      <div className="pt-2">
        <Button
          type="submit"
          loading={actionLoading}
          className="w-full shadow-glow-cyan"
          size="lg"
        >
          <span>Continue to Password</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="bg-dark-bg/60 border border-dark-border/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-gray-400">
        <Lock className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
        <span>
          Access is strictly restricted to Karthik. A dynamic password (minimum 8 characters) will be generated and dispatched to your registered Gmail.
        </span>
      </div>
    </form>
  );
}
