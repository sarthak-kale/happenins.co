import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";

interface InstitutionOtpVerificationProps {
  eventId: string;
  eventTitle: string;
  allowedDomains: string[];
  isVerified: boolean;
  verifiedCollegeEmail?: string | null;
  institutionName?: string | null;
  onVerified: (data: { verifiedCollegeEmail: string; verificationToken: string }) => void;
  onResetVerification?: () => void;
}

export const InstitutionOtpVerification: React.FC<InstitutionOtpVerificationProps> = ({
  eventId,
  eventTitle,
  allowedDomains = [],
  isVerified,
  verifiedCollegeEmail,
  institutionName,
  onVerified,
  onResetVerification,
}) => {
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Timer for resend OTP countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Clean domain list
  const cleanDomains = allowedDomains.map((d) => d.replace(/^@/, "").trim().toLowerCase());

  // Email domain check helper
  const enteredDomain = collegeEmail.includes("@")
    ? collegeEmail.split("@")[1]?.trim().toLowerCase()
    : "";
  const isEnteredDomainAllowed =
    enteredDomain &&
    cleanDomains.some(
      (allowed) => enteredDomain === allowed || enteredDomain.endsWith("." + allowed)
    );

  const handleDomainChipClick = (domain: string) => {
    setError("");
    const prefix = collegeEmail.includes("@") ? collegeEmail.split("@")[0] : collegeEmail;
    setCollegeEmail(`${prefix || "student"}@${domain}`);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = collegeEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid college email address.");
      return;
    }

    if (!isEnteredDomainAllowed) {
      setError(
        `Email domain @${enteredDomain || "..."} is not authorized for this event. Allowed: ${cleanDomains.map((d) => "@" + d).join(", ")}`
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const res = await api.sendInstitutionOtp({
        eventId,
        collegeEmail: cleanEmail,
      });

      setSuccessMessage(res.message);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      setStep("OTP");
      setResendCountdown(45);
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 150);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to send OTP to college email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.verifyInstitutionOtp({
        eventId,
        collegeEmail: collegeEmail.trim().toLowerCase(),
        otp: cleanOtp,
      });

      setSuccessMessage(res.message);
      onVerified({
        verifiedCollegeEmail: res.verifiedCollegeEmail,
        verificationToken: res.verificationToken,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Verification failed. Please check the OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDebugOtp = () => {
    if (debugOtp) {
      setOtp(debugOtp);
      setError("");
    }
  };

  // If already verified, show the verified pass badge
  if (isVerified && verifiedCollegeEmail) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0a161f]/80 to-emerald-950/30 p-5 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  ✓ College Email OTP Verified
                </span>
                {institutionName && (
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-[#ff2a54]" />
                    {institutionName}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5 font-mono">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                {verifiedCollegeEmail}
              </p>
              <p className="text-xs text-emerald-200/80 mt-1">
                Institutional ticket pass unlocked. Your pass will be bound to this verified college ID.
              </p>
            </div>
          </div>

          {onResetVerification && (
            <button
              type="button"
              onClick={onResetVerification}
              className="text-[11px] font-semibold text-slate-400 hover:text-white underline underline-offset-4 decoration-slate-600 transition shrink-0 cursor-pointer self-start sm:self-center"
            >
              Verify different email
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="institution-otp-section"
      className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-5 md:p-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#e23744]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-3.5 mb-5">
        <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-300 shrink-0">
          <GraduationCap className="h-6 w-6 text-[#ff2a54]" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm md:text-base font-display font-black text-white tracking-tight">
              Institutional Pass Verification Required
            </h3>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              Mandatory OTP
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            This event is strictly reserved for verified students and faculty. Enter your official college email to receive a 6-digit verification code before booking.
          </p>
        </div>
      </div>

      {/* Allowed Domain Chips */}
      {cleanDomains.length > 0 && (
        <div className="mb-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
          <span className="text-[11px] font-mono font-bold text-zinc-400 block mb-2 uppercase tracking-wider">
            Eligible College Domains:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cleanDomains.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => handleDomainChipClick(domain)}
                className="text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-[#e23744]/50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                title={`Click to use @${domain}`}
              >
                <span>@{domain}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Enter College Email */}
      {step === "EMAIL" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              Official College Email ID
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="email"
                required
                value={collegeEmail}
                onChange={(e) => {
                  setCollegeEmail(e.target.value);
                  setError("");
                }}
                placeholder="e.g. yourname@rbunagpur.in"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14141b] border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744] font-mono transition"
              />
            </div>
            {enteredDomain && (
              <div className="mt-1.5 text-[11px] flex items-center gap-1.5 font-mono">
                {isEnteredDomainAllowed ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Domain @{enteredDomain} is eligible for institutional pass!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Domain @{enteredDomain} is not in the allowed list for this event.
                  </span>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !collegeEmail.includes("@")}
            className="district-btn-primary w-full flex items-center justify-center gap-2 text-white text-xs md:text-sm font-bold py-3 px-4 rounded-xl disabled:opacity-50 cursor-pointer uppercase tracking-wider"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending OTP to College Email...</span>
              </>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Enter 6-Digit OTP */}
      {step === "OTP" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-4 w-4 text-[#ff2a54] shrink-0" />
              <span className="font-mono text-white truncate">{collegeEmail}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("EMAIL");
                setError("");
                setOtp("");
              }}
              className="text-[#ff2a54] hover:text-white underline text-[11px] font-semibold shrink-0 cursor-pointer ml-2"
            >
              Change
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-bold text-zinc-300">
                Enter 6-Digit Verification OTP
              </label>
              {debugOtp && (
                <button
                  type="button"
                  onClick={handleFillDebugOtp}
                  className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded hover:bg-amber-500/20 transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Dev Sandbox OTP: <strong>{debugOtp}</strong> (Click to fill)
                </button>
              )}
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                ref={otpInputRef}
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setOtp(val);
                  setError("");
                }}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-3 bg-[#060608] border border-white/[0.1] rounded-xl text-lg text-white font-mono tracking-[0.35em] text-center placeholder:text-zinc-600 placeholder:tracking-normal focus:outline-none focus:border-[#e23744] transition"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Check your college email inbox. The OTP is valid for 10 minutes.
            </p>
          </div>

          {error && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && !error && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={loading || otp.trim().length !== 6}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold py-3 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verify & Unlock Pass</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={loading || resendCountdown > 0}
              onClick={() => handleSendOtp()}
              className="px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{resendCountdown > 0 ? `Resend (${resendCountdown}s)` : "Resend OTP"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
