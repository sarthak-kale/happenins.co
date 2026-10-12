import React from "react";
import { UserCheck, User, Briefcase, Mail, KeyRound, EyeOff, Eye } from "lucide-react";
import { useFeatures } from "../../context/FeaturesContext";
import type { AuthMode, Setter } from "./types";

interface CredentialsSectionProps {
  mode: AuthMode;
  setMode: Setter<AuthMode>;
  isOrganizerMode: boolean;
  fullName: string;
  setFullName: Setter<string>;
  representativeTitle: string;
  setRepresentativeTitle: Setter<string>;
  email: string;
  setEmail: Setter<string>;
  password: string;
  setPassword: Setter<string>;
  showPassword: boolean;
  setShowPassword: Setter<boolean>;
  setResetEmail: Setter<string>;
}

export const CredentialsSection: React.FC<CredentialsSectionProps> = ({
  mode, setMode, isOrganizerMode, fullName, setFullName, representativeTitle,
  setRepresentativeTitle, email, setEmail, password, setPassword, showPassword,
  setShowPassword, setResetEmail,
}) => {
  const { isEnabled } = useFeatures();
  return (
            <div className={isOrganizerMode ? "p-4 rounded-2xl border border-white/[0.08] bg-[#14141b]/60 space-y-3" : "space-y-3"}>
              {isOrganizerMode && (
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08] text-xs font-display font-bold text-zinc-200 uppercase tracking-wider">
                  <UserCheck className="h-4 w-4 text-[#e23744]" />
                  Authorized Representative Details
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mode === "register" && (
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      {isOrganizerMode ? "Representative Full Name *" : "Full Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Rivera"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {isOrganizerMode && (
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Representative Title / Role
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="e.g. Chief Event Officer / Founder"
                        value={representativeTitle}
                        onChange={(e) => setRepresentativeTitle(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className={!isOrganizerMode && mode === "register" ? "col-span-1 sm:col-span-2" : ""}>
                  <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                    {isOrganizerMode ? "Official Business Email *" : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className={!isOrganizerMode && mode === "register" ? "col-span-1 sm:col-span-2" : ""}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest">
                      Password
                    </label>
                    {mode === "login" && isEnabled("PASSWORD_RESET") && (
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setMode("forgot_password");
                        }}
                        className="text-[10px] font-bold text-[#e23744] hover:text-[#ff2a54] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-10 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
  );
};
