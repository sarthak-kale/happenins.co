import React from "react";
import { Mail, Loader2, KeyRound } from "lucide-react";
import type { AuthMode, ResetStep, Setter } from "./types";

interface ForgotPasswordFormProps {
  handleSubmit: (e: React.FormEvent) => void | Promise<void>;
  resetEmail: string;
  setResetEmail: Setter<string>;
  email: string;
  setEmail: Setter<string>;
  loading: boolean;
  setMode: Setter<AuthMode>;
  setResetStep: Setter<ResetStep>;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  handleSubmit, resetEmail, setResetEmail, email, setEmail, loading, setMode, setResetStep,
}) => {
  return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                Your Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={resetEmail || email}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setEmail(e.target.value);
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-zinc-400">
                We'll dispatch a 6-digit OTP verification code and a one-click reset link to this address.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Send 6-Digit OTP Code</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode("reset_password");
                  setResetStep("enter_otp");
                }}
                className="text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
              >
                Already have an OTP code?
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
  );
};
