import React from "react";
import { Sparkles, Phone, Mail, Loader2, User, CheckCircle2 } from "lucide-react";
import type { Setter } from "./types";

interface FastOtpLoginProps {
  otpStep: "input" | "verify";
  setOtpStep: Setter<"input" | "verify">;
  otpIdentifier: string;
  setOtpIdentifier: Setter<string>;
  otpSending: boolean;
  otpMaskedTarget: string;
  otpTimer: number;
  otpCode: string;
  setOtpCode: Setter<string>;
  otpFullName: string;
  setOtpFullName: Setter<string>;
  loading: boolean;
  handleSendOtp: (e?: React.FormEvent) => void | Promise<void>;
}

export const FastOtpLogin: React.FC<FastOtpLoginProps> = ({
  otpStep, setOtpStep, otpIdentifier, setOtpIdentifier, otpSending, otpMaskedTarget,
  otpTimer, otpCode, setOtpCode, otpFullName, setOtpFullName, loading, handleSendOtp,
}) => {
  return (
              <div className="space-y-4">
                {otpStep === "input" ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="leading-snug">
                        <strong className="text-white block font-display">High-Velocity Drop Priority</strong>
                        Instant low-latency login via Phone Number or College Email. Zero waiting in password verification queues.
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                        Phone Number or College / Personal Email
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 flex items-center gap-1 text-zinc-500">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-[10px]">/</span>
                          <Mail className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="+91 98765 43210 or name@college.edu"
                          value={otpIdentifier}
                          onChange={(e) => setOtpIdentifier(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-14 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        Supports Indian mobile numbers (+91), international numbers, and all student/institutional email domains.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={otpSending || !otpIdentifier.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
                    >
                      {otpSending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Send 6-Digit Fast OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300">Code dispatched to:</span>
                        <strong className="text-white font-mono">{otpMaskedTarget}</strong>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                        <span>Code expires in:</span>
                        <span className="font-mono text-amber-400 font-bold">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5 text-center">
                        Enter 6-Digit Numeric Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-3 px-4 text-center text-lg font-mono tracking-[0.5em] text-white placeholder-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                        Your Full Name (Optional if already registered)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="e.g. Alex Rivera"
                          value={otpFullName}
                          onChange={(e) => setOtpFullName(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("input");
                          setOtpCode("");
                        }}
                        className="px-4 py-3 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="submit"
                        disabled={loading || otpCode.length < 4}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Verify & Enter Experience</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      {otpTimer <= 0 ? (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-xs font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
                        >
                          Code expired? Click to resend
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-500">
                          Resend available in {otpTimer}s
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
  );
};
