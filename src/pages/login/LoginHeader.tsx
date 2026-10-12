import React from "react";
import { LogoFull } from "../../components/Logo";
import type { AuthMode } from "./types";

interface LoginHeaderProps {
  mode: AuthMode;
  role: "USER" | "ORGANIZER";
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ mode, role }) => {
  return (
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <LogoFull size={44} textClassName="text-2xl" />
          </div>
          <h2 className="text-2xl font-display font-black text-white tracking-tight">
            {mode === "login" 
              ? "Welcome Back to Happenins" 
              : mode === "register" 
              ? (role === "ORGANIZER" ? "Event Organizer Registration" : "Join the Happenins Community")
              : mode === "forgot_password"
              ? "Forgot Your Password?"
              : "Reset Your Password"}
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans max-w-md mx-auto">
            {mode === "login"
              ? "Sign in to access your digital tickets, manage event listings and check-ins."
              : mode === "register"
              ? (role === "ORGANIZER"
                  ? "Register your organization, verify legal credentials, and configure payout accounts to publish verified gate passes."
                  : "Create an account to browse local experiences and buy official gate passes.")
              : mode === "forgot_password"
              ? "Enter your registered email address and we'll send a 6-digit OTP code and secure reset link."
              : "Verify your 6-digit OTP, generate or enter a new secure password, and sign in."}
          </p>
        </div>
  );
};
