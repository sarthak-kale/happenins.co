import React from "react";
import { ChevronRight, Mail, RefreshCw, KeyRound, ArrowRight, Dices, Check, EyeOff, Eye, Loader2, CheckCircle2 } from "lucide-react";
import type { AuthMode, ResetStep, Setter } from "./types";

interface ResetPasswordFormProps {
  resetStep: ResetStep;
  setResetStep: Setter<ResetStep>;
  setMode: Setter<AuthMode>;
  onNavigateToLogin?: () => void;
  handleProceedToPassword: (e: React.FormEvent) => void;
  handleResetPasswordSubmit: (e: React.FormEvent) => void | Promise<void>;
  handleRequestOtp: (e?: React.FormEvent) => void | Promise<void>;
  generateStrongPassword: () => void;
  resetEmail: string;
  setResetEmail: Setter<string>;
  resetOtp: string;
  setResetOtp: Setter<string>;
  resendTimer: number;
  loading: boolean;
  passwordCopied: boolean;
  newPassword: string;
  setNewPassword: Setter<string>;
  confirmPassword: string;
  setConfirmPassword: Setter<string>;
  showNewPassword: boolean;
  setShowNewPassword: Setter<boolean>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: Setter<boolean>;
  pwdScore: number;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  resetStep, setResetStep, setMode, onNavigateToLogin, handleProceedToPassword,
  handleResetPasswordSubmit, handleRequestOtp, generateStrongPassword,
  resetEmail, setResetEmail, resetOtp, setResetOtp, resendTimer, loading,
  passwordCopied, newPassword, setNewPassword, confirmPassword, setConfirmPassword,
  showNewPassword, setShowNewPassword, showConfirmPassword, setShowConfirmPassword, pwdScore,
}) => {
  return (
          <div className="space-y-5">
            {/* Step Progress Indicators */}
            <div className="flex items-center justify-between px-2 py-2.5 rounded-2xl bg-black/50 border border-white/[0.08] text-[11px] font-bold text-zinc-400">
              <div className={`flex items-center gap-1.5 ${resetStep === "enter_otp" ? "text-[#e23744]" : "text-emerald-400"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${resetStep === "enter_otp" ? "bg-[#e23744] text-white" : "bg-emerald-500 text-slate-950 font-black"}`}>
                  {resetStep === "enter_otp" ? "1" : "✓"}
                </span>
                <span>Enter OTP</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              <div className={`flex items-center gap-1.5 ${resetStep === "set_password" ? "text-[#e23744]" : resetStep === "success" ? "text-emerald-400" : "text-zinc-500"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${resetStep === "set_password" ? "bg-[#e23744] text-white" : resetStep === "success" ? "bg-emerald-500 text-slate-950 font-black" : "bg-white/10 text-zinc-400"}`}>
                  {resetStep === "success" ? "✓" : "2"}
                </span>
                <span>New Password</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
              <div className={`flex items-center gap-1.5 ${resetStep === "success" ? "text-emerald-400" : "text-zinc-500"}`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${resetStep === "success" ? "bg-emerald-500 text-slate-950 font-black" : "bg-white/10 text-zinc-400"}`}>
                  3
                </span>
                <span>Login</span>
              </div>
            </div>

            {/* STEP 1: Enter 6-Digit OTP */}
            {resetStep === "enter_otp" && (
              <form onSubmit={handleProceedToPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest">
                      6-Digit Security OTP Code *
                    </label>
                    {resendTimer > 0 ? (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestOtp()}
                        className="text-[10px] font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="e.g. 849201"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full rounded-xl py-3 pl-9 pr-3 text-sm font-mono tracking-widest text-center font-bold text-rose-200 placeholder-zinc-600 bg-[#14141b] border border-[#e23744]/30 focus:border-[#e23744] focus:outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-zinc-400">
                    Please enter the 6-digit OTP security code sent to your registered email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
                >
                  <span>Continue to Set New Password</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Generate / Keep New Password */}
            {resetStep === "set_password" && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs text-slate-400 font-mono">
                    Resetting for: <strong className="text-white">{resetEmail || "Account"}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e23744]/15 hover:bg-[#e23744]/25 text-rose-300 border border-[#e23744]/30 text-[11px] font-bold transition cursor-pointer active:scale-95"
                  >
                    <Dices className="h-3.5 w-3.5 text-[#e23744]" />
                    <span>⚡ Generate Strong Password</span>
                  </button>
                </div>

                {passwordCopied && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Strong password generated and copied to clipboard!</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest">
                      New Password *
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-10 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400">Password Strength:</span>
                        <span className={`font-bold ${pwdScore <= 2 ? "text-rose-400" : pwdScore <= 4 ? "text-amber-400" : "text-emerald-400"}`}>
                          {pwdScore <= 2 ? "Weak" : pwdScore <= 4 ? "Good" : "Very Strong"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwdScore >= 1 ? (pwdScore <= 2 ? "bg-rose-500" : pwdScore <= 4 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwdScore >= 2 ? (pwdScore <= 2 ? "bg-rose-500" : pwdScore <= 4 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwdScore >= 3 ? (pwdScore <= 4 ? "bg-amber-500" : "bg-emerald-500") : "bg-transparent"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwdScore >= 4 ? "bg-emerald-500" : "bg-transparent"}`} />
                        <div className={`h-full flex-1 rounded-full transition-all duration-300 ${pwdScore >= 5 ? "bg-emerald-400" : "bg-transparent"}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat new password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-10 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-[10px] text-rose-400">Passwords do not match.</p>
                  )}
                  {confirmPassword && newPassword === confirmPassword && (
                    <p className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Passwords match!
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep("enter_otp")}
                    className="px-4 py-3 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Save & Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Banner */}
            {resetStep === "success" && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center space-y-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-2xl border border-emerald-500/30 animate-bounce">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Password Updated Successfully!</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Your password has been changed. You can now log in using your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    if (onNavigateToLogin) onNavigateToLogin();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-xs font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
              >
                ← Return to Sign In
              </button>
            </div>
          </div>
  );
};
