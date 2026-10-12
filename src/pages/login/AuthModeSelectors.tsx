import React from "react";
import { User, Building2, Sparkles, KeyRound } from "lucide-react";
import type { AuthMode, Setter } from "./types";

interface AuthModeSelectorsProps {
  mode: AuthMode;
  role: "USER" | "ORGANIZER";
  setRole: Setter<"USER" | "ORGANIZER">;
  loginMethod: "otp" | "password";
  setLoginMethod: Setter<"otp" | "password">;
  setError: Setter<string>;
  canOtp?: boolean;
  canPassword?: boolean;
  canOrganizer?: boolean;
}

export const AuthModeSelectors: React.FC<AuthModeSelectorsProps> = ({
  mode, role, setRole, loginMethod, setLoginMethod, setError,
  canOtp = true, canPassword = true, canOrganizer = true,
}) => {
  return (
    <>
            {/* Account Role Selector on Register */}
            {mode === "register" && canOrganizer && (
              <div className="mb-5 p-1 bg-black/50 rounded-2xl border border-white/[0.08] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    role === "USER"
                      ? "bg-[#e23744] text-white shadow-lg shadow-[#e23744]/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  General Attendee
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ORGANIZER")}
                  className={`rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    role === "ORGANIZER"
                      ? "bg-gradient-to-r from-[#e23744] to-[#ff2a54] text-white shadow-lg shadow-[#e23744]/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 text-amber-400" />
                  Event Organizer
                </button>
              </div>
            )}

            {/* Login Method Selector (Pillar 3: Offloading Auth & Preventing CPU Starvation) */}
            {mode === "login" && canOtp && canPassword && (
              <div className="mb-4 p-1 bg-black/50 rounded-2xl border border-white/[0.08] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp");
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === "otp"
                      ? "bg-gradient-to-r from-[#e23744] to-[#ff2a54] text-white shadow-lg shadow-[#e23744]/25"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>⚡ Fast OTP (Drop Mode)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password");
                    setError("");
                  }}
                  className={`rounded-xl py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === "password"
                      ? "bg-white/10 text-white shadow-md border border-white/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Password Login</span>
                </button>
              </div>
            )}
    </>
  );
};
