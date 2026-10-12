import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Loader2, FileCheck, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { AuthMode, ResetStep } from "./login/types";
import { generateStrongPasswordValue, calculateStrength } from "./login/passwordUtils";
import { useOrganizerFields } from "./login/useOrganizerFields";
import { VerifyEmailStep } from "./login/VerifyEmailStep";

interface LoginProps {
  onSuccess: () => void;
  initialMode?: "login" | "register" | "forgot_password" | "reset_password";
  initialResetData?: { token?: string; otp?: string; email?: string };
  onNavigateToLogin?: () => void;
}

export const Login: React.FC<LoginProps> = ({ 
  onSuccess, 
  initialMode = "login",
  initialResetData,
  onNavigateToLogin
}) => {

  // Password Reset & OTP States
  const [resetEmail, setResetEmail] = useState(initialResetData?.email || "");
  const [resetOtp, setResetOtp] = useState(initialResetData?.otp || "");
  const [resetToken, setResetToken] = useState(initialResetData?.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStep, setResetStep] = useState<"enter_otp" | "set_password" | "success">(
    initialResetData?.token || initialResetData?.otp ? "set_password" : "enter_otp"
  );
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Fast-Drop OTP State (Pillar 3: Offloading Auth & Preventing CPU Starvation)
  const [chosenMethod, setLoginMethod] = useState<"otp" | "password">("otp");
  // Only offer methods the server has enabled; fall back to whichever remains
  const loginMethod: "otp" | "password" =
    chosenMethod === "otp" && !canOtp && canPassword ? "password"
    : chosenMethod === "password" && !canPassword && canOtp ? "otp"
    : chosenMethod;
  const noLoginMethod = !canOtp && !canPassword;
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpStep, setOtpStep] = useState<"input" | "verify">("input");
  const [otpMaskedTarget, setOtpMaskedTarget] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpFullName, setOtpFullName] = useState("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!otpIdentifier.trim()) {
      setError("Please enter your Phone Number or College / Personal Email.");
      return;
    }
    setOtpSending(true);
    try {
      const res = await api.sendOtp({ identifier: otpIdentifier.trim() });
      setOtpMaskedTarget(res.maskedTarget);
      setOtpStep("verify");
      setOtpTimer(res.expiresInSeconds || 300);
      setSuccessMsg(`6-digit fast-login OTP sent to ${res.maskedTarget}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to dispatch verification code.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otpCode || otpCode.trim().length < 4) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOtp({
        identifier: otpIdentifier.trim(),
        otp: otpCode.trim(),
        fullName: otpFullName.trim() || undefined,
      });
      await refreshUser();
      setLoading(false);
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Verification failed. Please check the OTP code.");
      setLoading(false);
    }
  };

  // Extended Organizer Registration & Legal Details + Legal & Compliance Checkboxes
  const organizer = useOrganizerFields();
  const {
    companyName, entityType, representativeTitle, phone, businessAddress, taxId,
    website, bankName, bankAccountName, bankAccountNumber,
    acceptedTerms, acceptedLiability, acceptedPrivacy, certifiedAuthorized,
  } = organizer;

  // Legal Terms Modal Toggle
  const [showLegalModal, setShowLegalModal] = useState(false);


  useEffect(() => {
    if (initialResetData) {
      if (initialResetData.email) {
        setResetEmail(initialResetData.email);
        setEmail(initialResetData.email);
      }
      if (initialResetData.otp) setResetOtp(initialResetData.otp);
      if (initialResetData.token) setResetToken(initialResetData.token);
      setMode("reset_password");
      setResetStep("set_password");
    }
  }, [initialResetData]);

  // Resend countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const currentRedirectUri = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "";

  const handleCopyRedirectUri = () => {
    if (currentRedirectUri) {
      navigator.clipboard.writeText(currentRedirectUri);
      setCopiedRedirect(true);
      setTimeout(() => setCopiedRedirect(false), 2000);
    }
  };

  // Password Generator Utility
  const generateStrongPassword = () => {
    const shuffled = generateStrongPasswordValue();
    setNewPassword(shuffled);
    setConfirmPassword(shuffled);
    setShowNewPassword(true);
    setShowConfirmPassword(true);

    navigator.clipboard.writeText(shuffled);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 3000);
  };


  // Password Strength Evaluation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdScore = calculateStrength(newPassword);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(targetEmail);
      setResetEmail(targetEmail);
      setMode("reset_password");
      setResetStep("enter_otp");
      setResendTimer(60);
      setSuccessMsg(`A 6-digit OTP code has been dispatched to ${targetEmail}. Please check your email inbox.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!resetOtp || resetOtp.trim().length < 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }
    setResetStep("set_password");
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters in length.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The confirmation password does not match the new password.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({
        token: resetToken || undefined,
        otp: resetOtp ? resetOtp.trim() : undefined,
        email: resetEmail.trim() ? resetEmail.trim() : undefined,
        newPassword: newPassword.trim(),
      });

      setResetStep("success");
      setEmail(resetEmail);
      setPassword(newPassword);
      setSuccessMsg("Password reset completed successfully!");

      // Auto redirect to login after short delay
      setTimeout(() => {
        setMode("login");
      }, 2200);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Password reset failed. Please check your OTP code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        if (loginMethod === "otp") {
          if (otpStep === "input") {
            await handleSendOtp();
            return;
          } else {
            await handleVerifyOtp(e);
            return;
          }
        }
        setLoading(true);
        await authLogin(email, password);
        onSuccess();
      } else if (mode === "register") {
        setLoading(true);
        if (role === "ORGANIZER") {
          if (!companyName.trim()) {
            throw new Error("Organization or Company Name is required for Event Organizers.");
          }
          if (!acceptedTerms || !acceptedLiability || !acceptedPrivacy || !certifiedAuthorized) {
            throw new Error("You must review and accept all legal and safety agreements to host events on Happenins.");
          }

          const started = await authRegister(fullName, email, password, role, {
            companyName: companyName.trim(),
            entityType,
            representativeTitle: representativeTitle.trim(),
            phone: phone.trim(),
            businessAddress: businessAddress.trim(),
            taxId: taxId.trim(),
            website: website.trim(),
            bankName: bankName.trim(),
            bankAccountName: bankAccountName.trim(),
            bankAccountNumber: bankAccountNumber.trim(),
            acceptedTerms,
            acceptedLiability,
            acceptedPrivacy,
          });
          if (started.loggedIn) {
            onSuccess();
            return;
          }
          setVerifyEmail(started.email);
          if (started.otpPreview) setSuccessMsg(`Dev preview code: ${started.otpPreview}`);
        } else {
          const started = await authRegister(fullName, email, password, role);
          if (started.loggedIn) {
            onSuccess();
            return;
          }
          setVerifyEmail(started.email);
          if (started.otpPreview) setSuccessMsg(`Dev preview code: ${started.otpPreview}`);
        }
      } else if (mode === "forgot_password") {
        await handleRequestOtp();
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "register" && !canRegister) setMode("login");
  }, [mode, canRegister]);
  useEffect(() => {
    if (role === "ORGANIZER" && !canOrganizer) setRole("USER");
  }, [role, canOrganizer]);
  useEffect(() => {
    if (mode === "forgot_password" && !canReset) setMode("login");
  }, [mode, canReset]);

  const handleGoogleOAuth = useGoogleOAuth({ refreshUser, onSuccess, setError, setLoading });

  const isOrganizerMode = mode === "register" && role === "ORGANIZER";

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!verifyEmail) return;
    if (!/^\d{6}$/.test(verifyCode.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      await verifyRegistration(verifyEmail, verifyCode.trim());
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  if (verifyEmail) {
    return (
      <VerifyEmailStep
        verifyEmail={verifyEmail}
        verifyCode={verifyCode}
        setVerifyCode={setVerifyCode}
        setVerifyEmail={setVerifyEmail}
        error={error}
        setError={setError}
        successMsg={successMsg}
        setSuccessMsg={setSuccessMsg}
        loading={loading}
        handleVerifyRegistration={handleVerifyRegistration}
      />
    );
  }


  return (
    <div className={`mx-auto ${isOrganizerMode ? "max-w-3xl" : "max-w-lg"} px-4 py-12 sm:px-6 relative z-10 transition-all duration-300`}>
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
        <LoginHeader mode={mode} role={role} />

        {error && (
          <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-300 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && mode !== "reset_password" && (
          <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs font-semibold text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ===================== MODE: RESET PASSWORD WITH STEP-BY-STEP OTP & GENERATOR ===================== */}
        {mode === "reset_password" ? (
          <ResetPasswordForm
            resetStep={resetStep}
            setResetStep={setResetStep}
            setMode={setMode}
            onNavigateToLogin={onNavigateToLogin}
            handleProceedToPassword={handleProceedToPassword}
            handleResetPasswordSubmit={handleResetPasswordSubmit}
            handleRequestOtp={handleRequestOtp}
            generateStrongPassword={generateStrongPassword}
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            resetOtp={resetOtp}
            setResetOtp={setResetOtp}
            resendTimer={resendTimer}
            loading={loading}
            passwordCopied={passwordCopied}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            pwdScore={pwdScore}
          />
        ) : mode === "forgot_password" ? (
          /* ===================== MODE: FORGOT PASSWORD (REQUEST CODE) ===================== */
          <ForgotPasswordForm
            handleSubmit={handleSubmit}
            resetEmail={resetEmail}
            setResetEmail={setResetEmail}
            email={email}
            setEmail={setEmail}
            loading={loading}
            setMode={setMode}
            setResetStep={setResetStep}
          />
        ) : (
          /* ===================== MODE: STANDARD LOGIN & REGISTER ===================== */
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthModeSelectors mode={mode} role={role} setRole={setRole} loginMethod={loginMethod} setLoginMethod={setLoginMethod} setError={setError} canOtp={canOtp} canPassword={canPassword} canOrganizer={canOrganizer} />

            {mode === "login" && noLoginMethod && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs font-semibold text-amber-300">
                Email sign-in is not enabled right now.{canGoogle ? " Please continue with Google below." : ""}
              </div>
            )}

            {/* FAST-DROP OTP INTERFACE (Pillar 3) */}
            {mode === "login" && noLoginMethod ? null : mode === "login" && loginMethod === "otp" ? (
              <FastOtpLogin
                otpStep={otpStep}
                setOtpStep={setOtpStep}
                otpIdentifier={otpIdentifier}
                setOtpIdentifier={setOtpIdentifier}
                otpSending={otpSending}
                otpMaskedTarget={otpMaskedTarget}
                otpTimer={otpTimer}
                otpCode={otpCode}
                setOtpCode={setOtpCode}
                otpFullName={otpFullName}
                setOtpFullName={setOtpFullName}
                loading={loading}
                handleSendOtp={handleSendOtp}
              />
            ) : (
              /* STANDARD CREDENTIALS (PASSWORD LOGIN / REGISTER) - Worker Thread Protected */
              <>
            <CredentialsSection
              mode={mode}
              setMode={setMode}
              isOrganizerMode={isOrganizerMode}
              fullName={fullName}
              setFullName={setFullName}
              representativeTitle={representativeTitle}
              setRepresentativeTitle={organizer.setRepresentativeTitle}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              setResetEmail={setResetEmail}
            />

            <OrganizerSections
              isOrganizerMode={isOrganizerMode}
              organizer={organizer}
              setShowLegalModal={setShowLegalModal}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e23744]/25 transition disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : mode === "login" ? (
                "Sign In to Your Account"
              ) : mode === "register" ? (
                role === "ORGANIZER" ? (
                  <>
                    <FileCheck className="h-4 w-4 text-emerald-300" />
                    <span>Complete Organizer Legal Registration</span>
                  </>
                ) : (
                  "Complete Attendee Registration"
                )
              ) : (
                "Send Password Reset Code"
              )}
            </button>
            </>
            )}
          </form>
        )}

        {/* Dynamic toggle between login, register, and forgot password */}
        {mode !== "reset_password" && mode !== "forgot_password" && (
          <div className="mt-5 text-center text-xs text-zinc-500 space-y-1 font-medium">
            {mode === "login" ? (
              canRegister && <div>
                New to Happenins?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
                >
                  Sign up instead
                </button>
              </div>
            ) : mode === "register" ? (
              <div>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </div>
            ) : null}
          </div>
        )}

      </div>

      {/* Organizer Legal Policy Modal */}
      {showLegalModal && (
        <LegalModal setShowLegalModal={setShowLegalModal} />
      )}
    </div>
  );
};
