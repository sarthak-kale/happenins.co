import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { StaffScannerSession, GateScanResultDTO } from "../types";
import { formatTimeIST } from "../lib/formatters";
import {
  QrCode,
  ShieldAlert,
  CheckCircle,
  Loader2,
  Camera,
  StopCircle,
  KeyRound,
  Check,
  DoorOpen,
  Users,
  LogOut,
  Sparkles,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "motion/react";
import { getErrorMessage } from "../lib/errors";

interface ScannerConsoleProps {
  onNavigateToOrganizer?: () => void;
  onNavigateToLogin?: () => void;
}

export const ScannerConsole: React.FC<ScannerConsoleProps> = ({
  onNavigateToOrganizer,
  onNavigateToLogin,
}) => {
  const { user, logout } = useAuth();

  // Mode state for switching between Volunteer PIN and Organizer Mode
  const isOrganizerUser = user && (user.role === "ORGANIZER" || user.role === "ADMIN");
  const [modeTab, setModeTab] = useState<"organizer_master" | "volunteer_pin">(() => {
    const saved = localStorage.getItem("happenins_staff_session");
    if (saved) return "volunteer_pin";
    return isOrganizerUser ? "organizer_master" : "volunteer_pin";
  });

  // Staff Session State (from PIN login)
  const [staffSession, setStaffSession] = useState<StaffScannerSession | null>(() => {
    try {
      const saved = localStorage.getItem("happenins_staff_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login PIN state for volunteers
  const [pinInput, setPinInput] = useState("");
  const [pinLoginLoading, setPinLoginLoading] = useState(false);
  const [pinLoginError, setPinLoginError] = useState("");

  // Organizer gate selector
  const [organizerSelectedGate, setOrganizerSelectedGate] = useState("Organizer Master Gate (All Tiers)");

  // Scanner UI States
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [passCodeInput, setPassCodeInput] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<GateScanResultDTO | null>(null);
  const [ventureScanResult, setVentureScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<GateScanResultDTO[]>([]);

  // Venture Vault Mode Switcher
  const [eventMode, setEventMode] = useState<"standard" | "venture">("standard");
  const [ventureRound, setVentureRound] = useState<1 | 2 | 3>(3);
  const [ventureSubEvents, setVentureSubEvents] = useState<Array<{ roundNumber: number; title: string }>>([]);

  // Camera scanner states & continuous high-throughput scanning
  const [cameraActive, setCameraActive] = useState(false);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<{ hash: string; time: number } | null>(null);

  // Sound effects / Haptic feedback
  const triggerFeedback = (success: boolean) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (success) {
          navigator.vibrate([80, 50, 80]);
        } else {
          navigator.vibrate([200, 100, 200]);
        }
      } catch {}
    }
  };

  useEffect(() => {
    // Preload dynamic sub-event stage titles for Venture Vault
    api.getVenturePublicPreview()
      .then((data) => {
        if (data?.subEvents) {
          setVentureSubEvents(data.subEvents);
        }
      })
      .catch(() => {});

    return () => {
      // Stop camera if active on component unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => console.warn("Scanner stop on unmount failed:", err));
      }
    };
  }, []);

  useEffect(() => {
    if (staffSession?.isVenture) {
      setEventMode("venture");
    }
  }, [staffSession?.isVenture]);

  const handleStaffPinLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim() || pinInput.trim().length !== 6) {
      setPinLoginError("Please enter a valid 6-digit staff PIN / OTP.");
      return;
    }

    setPinLoginLoading(true);
    setPinLoginError("");

    try {
      const res = await api.loginStaffPin(pinInput.trim());
      setStaffSession(res.session);
      localStorage.setItem("happenins_staff_session", JSON.stringify(res.session));
      localStorage.setItem("happenins_staff_token", res.session.token);
      if (res.session.isVenture) {
        setEventMode("venture");
      }
      setPinInput("");
      setModeTab("volunteer_pin");
    } catch (err: unknown) {
      setPinLoginError(getErrorMessage(err) || "Invalid 6-digit staff PIN or PIN has expired.");
    } finally {
      setPinLoginLoading(false);
    }
  };

  const handleEndStaffShift = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setCameraActive(false);
    setStaffSession(null);
    localStorage.removeItem("happenins_staff_session");
    if (!user) {
      localStorage.removeItem("happenins_staff_token");
    }
    setScanResult(null);
    setScanError(null);
  };

  const handleScanSubmit = async (codeString: string) => {
    const cleanCode = codeString.trim();
    if (!cleanCode) return;

    setScanLoading(true);
    setScanResult(null);
    setVentureScanResult(null);
    setScanError(null);

    const gateToUse = staffSession?.gateName || organizerSelectedGate;
    const operatorName = staffSession?.staffName
      ? `${staffSession.staffName} (${gateToUse})`
      : gateToUse;

    // Automatic detection of Venture Vault Pass or manual mode
    if (cleanCode.toLowerCase().startsWith("vv") || eventMode === "venture" || staffSession?.isVenture) {
      try {
        const vRes = await api.scanVenturePass({
          qrHash: cleanCode,
          roundNumber: ventureRound,
          gateOperator: operatorName,
          staffScannerId: staffSession?.staffScannerId,
        });

        setVentureScanResult(vRes);
        if (vRes.success) {
          triggerFeedback(true);
          setScanError(null);
        } else {
          triggerFeedback(false);
          setScanError(vRes.message || "Pass verification rejected.");
        }
        setPassCodeInput("");
        return;
      } catch (err: unknown) {
        triggerFeedback(false);
        setScanError(getErrorMessage(err) || "Failed to scan Venture Vault pass.");
        return;
      } finally {
        setScanLoading(false);
      }
    }

    try {
      const data = await api.scanGateTicket(cleanCode, gateToUse);
      setScanResult(data);
      setRecentScans((prev) => [data, ...prev.slice(0, 9)]);
      triggerFeedback(true);
      setPassCodeInput("");
      
      // Update session local scan count if in staff mode
      if (staffSession && data.gateScansCount) {
        const updated = { ...staffSession };
        setStaffSession(updated);
        localStorage.setItem("happenins_staff_session", JSON.stringify(updated));
      }
    } catch (err: unknown) {
      triggerFeedback(false);
      setScanError(getErrorMessage(err) || "Cryptographic scan verification failed.");
    } finally {
      setScanLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanResult(null);
    setScanError(null);
    setCameraActive(true);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 25,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: Math.max(200, size), height: Math.max(200, size) };
            },
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true,
            },
          } as any,
          async (decodedText) => {
            const cleanText = decodedText.trim();
            if (!cleanText) return;

            // Cooldown debounce of 2.2s on identical QR hash to prevent duplicate trigger
            const now = Date.now();
            if (
              lastScannedRef.current &&
              lastScannedRef.current.hash === cleanText &&
              now - lastScannedRef.current.time < 2200
            ) {
              return;
            }
            lastScannedRef.current = { hash: cleanText, time: now };

            if (!continuousMode) {
              if (scannerRef.current && scannerRef.current.isScanning) {
                await scannerRef.current.stop();
              }
              setCameraActive(false);
            }

            await handleScanSubmit(cleanText);
          },
          () => {}
        );
      } catch (err: unknown) {
        console.error("Camera startup failed:", err);
        setCameraActive(false);
        setCameraError(
          getErrorMessage(err) ||
          "Could not access the system camera. Check permissions or switch to the Manual Entry tab."
        );
      }
    }, 150);
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Failed to stop scanner cleanly:", e);
      }
    }
    setCameraActive(false);
    scannerRef.current = null;
  };

  const isVIPGate = staffSession?.gateName?.toLowerCase().includes("vip");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10 animate-fade-in">
      {/* 1. UPPER BAR OF THE GATE SCANNER (MODE SWITCHER & CONTROL HEADER) */}
      <div className="mb-6 rounded-3xl border border-white/10 bg-[#0c0c11]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Mode Switcher Tabs on Upper Bar */}
          <div className="flex items-center gap-2 bg-[#14141b] p-1 rounded-2xl border border-white/10">
            {/* Organizer Master Mode Tab */}
            <button
              onClick={() => {
                if (isOrganizerUser) {
                  setModeTab("organizer_master");
                } else if (onNavigateToLogin) {
                  onNavigateToLogin();
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                modeTab === "organizer_master" && isOrganizerUser
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Organizer Master Scan</span>
              {isOrganizerUser && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Volunteer PIN / OTP Gate Login Tab */}
            <button
              onClick={() => setModeTab("volunteer_pin")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                modeTab === "volunteer_pin" || !isOrganizerUser
                  ? "bg-[#e23744] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Volunteer PIN / OTP Scanner</span>
              {staffSession && (
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Upper Bar Right Actions */}
          <div className="flex items-center gap-2.5">
            {isOrganizerUser && onNavigateToOrganizer && (
              <button
                onClick={onNavigateToOrganizer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
              >
                <DoorOpen className="h-3.5 w-3.5 text-[#ff2a54]" />
                <span>Control Center</span>
              </button>
            )}

            {staffSession && (
              <button
                onClick={handleEndStaffShift}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 border border-rose-500/30 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>End Shift</span>
              </button>
            )}
          </div>
        </div>

        {/* Subheader info inside Upper Bar */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-2xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Strict Privacy Active: Volunteer staff PIN terminals only scan customer entry tickets with zero access to organizer revenue records.</span>
          </div>
          {isOrganizerUser && modeTab === "organizer_master" && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-semibold">Active Gate Policy:</span>
              <select
                value={organizerSelectedGate}
                onChange={(e) => setOrganizerSelectedGate(e.target.value)}
                className="rounded-lg bg-[#14141b] border border-white/10 px-2 py-0.5 text-2xs text-white focus:outline-none"
              >
                <option value="Organizer Master Gate (All Tiers)">Master Gate (All Tiers)</option>
                <option value="VIP Gate">VIP Gate</option>
                <option value="General Gate - East">General Gate - East</option>
                <option value="General Gate - West">General Gate - West</option>
                <option value="Main Entrance">Main Entrance</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 2. VOLUNTEER PIN / OTP LOGIN TERMINAL (When not logged into a staff shift and in volunteer mode) */}
      {!staffSession && (modeTab === "volunteer_pin" || !isOrganizerUser) ? (
        <div className="mx-auto max-w-md my-4 relative z-10 animate-fade-in">
          <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-8 shadow-2xl backdrop-blur-2xl text-center relative overflow-hidden">
            <div className="absolute -inset-24 rounded-full bg-[#e23744]/10 blur-3xl pointer-events-none" />

            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#e23744] to-[#ff2a54] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-red-950/50">
              <KeyRound className="h-8 w-8" />
            </div>

            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#ff2a54] bg-[#e23744]/10 px-3 py-1 rounded-full border border-[#e23744]/20">
              Volunteer Staff Portal
            </span>

            <h1 className="text-2xl font-display font-black text-white mt-3">
              Gate Scanner OTP / PIN Login
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Enter your temporary 6-digit staff PIN provided by the event organizer to start checking in attendees at your assigned gate.
            </p>

            {pinLoginError && (
              <div className="mt-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2 text-left">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{pinLoginError}</span>
              </div>
            )}

            <form onSubmit={handleStaffPinLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2">
                  6-Digit Staff PIN / OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  placeholder="• • • • • •"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center text-3xl font-black font-mono tracking-[0.4em] py-3.5 px-4 rounded-2xl border border-white/10 bg-[#14141b] text-white focus:border-[#e23744] focus:outline-none focus:ring-2 focus:ring-[#e23744]/20 transition placeholder:text-slate-700"
                />
              </div>

              {/* Quick keypad digits for mobile devices */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 6) {
                        setPinInput((prev) => prev + num);
                      }
                    }}
                    className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-[#e23744] text-white font-mono text-base font-bold transition cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput("")}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 6) {
                      setPinInput((prev) => prev + "0");
                    }
                  }}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-[#e23744] text-white font-mono text-base font-bold transition cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-bold transition cursor-pointer"
                >
                  ⌫
                </button>
              </div>

              <button
                type="submit"
                disabled={pinLoginLoading || pinInput.length !== 6}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition disabled:opacity-40 cursor-pointer active:scale-95 duration-150 flex items-center justify-center gap-2"
              >
                {pinLoginLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Verifying PIN...</span>
                  </>
                ) : (
                  <>
                    <span>Log Into Gate Terminal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/5 text-2xs text-slate-400 space-y-1">
              <p>Volunteers can quickly log into any gate using the 6-digit PIN generated by the organizer.</p>
              {isOrganizerUser && (
                <button
                  type="button"
                  onClick={() => setModeTab("organizer_master")}
                  className="text-[#ff2a54] hover:text-white font-bold underline cursor-pointer mt-2 block mx-auto transition"
                >
                  Return to Organizer Master Scanner Mode
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ACTIVE SHIFT & GATE IDENTITY BANNER */}
          {staffSession ? (
            <div
              className={`mb-6 rounded-3xl border p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                isVIPGate
                  ? "bg-[#14141b] border-amber-500/30"
                  : "bg-[#0c0c11] border-white/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isVIPGate ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-[#e23744]/20 text-[#ff2a54] border border-[#e23744]/30"
                    }`}
                  >
                    <DoorOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                          isVIPGate
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-[#e23744]/10 text-[#ff2a54] border-[#e23744]/20"
                        }`}
                      >
                        Volunteer Shift Active
                      </span>
                      <span className="text-2xs text-slate-400 font-mono">• No Financial Access</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-display font-black text-white mt-1">
                      {staffSession.gateName}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>👤 {staffSession.staffName}</span>
                      <span>•</span>
                      <span>🎪 {staffSession.eventTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Gate Policy</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {staffSession.allowedTierNames && staffSession.allowedTierNames.length > 0
                        ? `${staffSession.allowedTierNames.join(", ")} only`
                        : "All Passes Allowed"}
                    </span>
                  </div>
                  <button
                    onClick={handleEndStaffShift}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-xs font-bold text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>End Shift</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-3xl border border-white/10 bg-[#0c0c11]/90 p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    Organizer Master Mode
                  </span>
                  <span className="text-2xs text-slate-400 font-mono">• Full Gate Verification</span>
                </div>
                <h2 className="text-lg font-display font-black text-white mt-1">
                  Master Gate Check-In Terminal
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scanning as Organizer ({user?.fullName || "Organizer"}). Verified tickets will be admitted at: <span className="text-[#ff2a54] font-semibold">{organizerSelectedGate}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStaffSession(null);
                    setModeTab("volunteer_pin");
                    setPinInput("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 border border-white/10 transition cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#ff2a54]" />
                  <span>Switch to Volunteer PIN Mode</span>
                </button>
              </div>
            </div>
          )}

      {/* Event System Switcher (Marketplace vs Venture Vault) */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#0c0c11] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-zinc-400">Target Event:</span>
          <div className="flex bg-[#14141b] border border-white/10 p-1 rounded-xl gap-1">
            <button
              onClick={() => {
                setEventMode("standard");
                setVentureScanResult(null);
                setScanError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer ${
                eventMode === "standard"
                  ? "bg-[#e23744] text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Public Tickets
            </button>
            <button
              onClick={() => {
                setEventMode("venture");
                setScanResult(null);
                setScanError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition cursor-pointer flex items-center gap-1.5 ${
                eventMode === "venture"
                  ? "bg-[#e23744] text-white shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Venture Vault 2026</span>
            </button>
          </div>
        </div>

        {eventMode === "venture" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Active Round:</span>
            <div className="flex bg-[#14141b] border border-white/10 p-1 rounded-xl gap-1 flex-wrap">
              {([1, 2, 3] as const).map((r) => {
                const sub = ventureSubEvents.find((s) => s.roundNumber === r);
                const label = sub?.title ? (sub.title.length > 16 ? `R${r}: ${sub.title.slice(0, 14)}...` : sub.title) : `Round ${r}`;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setVentureRound(r);
                      setVentureScanResult(null);
                      setScanError(null);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                      ventureRound === r
                        ? "bg-emerald-600 text-white shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                    title={sub?.title || `Round ${r}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Verification Viewport (Camera/Manual) */}
      <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -inset-24 rounded-full bg-[#e23744]/5 blur-3xl pointer-events-none" />

        {/* Tabs selection header */}
        <div className="flex border-b border-white/5 mb-6 gap-6 relative z-10 justify-center">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab("camera");
            }}
            className={`pb-3 text-2xs font-display font-extrabold uppercase tracking-widest border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "camera"
                ? "border-[#e23744] text-[#ff2a54]"
                : "border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Live Camera Scanner</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab("manual");
            }}
            className={`pb-3 text-2xs font-display font-extrabold uppercase tracking-widest border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "manual"
                ? "border-[#e23744] text-[#ff2a54]"
                : "border-transparent text-slate-500 hover:text-slate-350"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Manual Code Entry</span>
          </button>
        </div>

        {/* TAB CONTENT: CAMERA */}
        {activeTab === "camera" && (
          <div className="space-y-4 relative z-10">
            {/* Rapid Scan Preference Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#14141b]/80 border border-white/5 text-xs font-mono">
              <label className="flex items-center gap-2 text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="rounded accent-[#e23744] h-4 w-4 cursor-pointer"
                />
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Continuous Rapid Scan (Sub-Second Flow)
                </span>
              </label>
              <span className="text-emerald-400 text-[10px] font-bold">25 FPS Hardware Decode</span>
            </div>

            {!cameraActive ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#14141b]/60 p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
                <div className="h-16 w-16 rounded-2xl bg-[#e23744]/10 border border-[#e23744]/20 text-[#ff2a54] flex items-center justify-center mb-4 shadow-inner">
                  <Camera className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-display font-bold text-white">Camera Check-In Ready</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6 leading-relaxed">
                  Start the camera stream to scan attendee dynamic rotating QR codes directly from smartphone screens or physical tickets.
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition cursor-pointer active:scale-95 duration-150"
                >
                  <Camera className="h-4 w-4" />
                  <span>Start Camera Scanner</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Live Floating HUD Banner above viewfinder */}
                {(ventureScanResult || scanResult || scanError) && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between gap-3 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
                      ventureScanResult
                        ? ventureScanResult.success
                          ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                          : "bg-rose-950/90 border-rose-500/50 text-rose-200"
                        : scanResult
                        ? scanResult.success
                          ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                          : "bg-rose-950/90 border-rose-500/50 text-rose-200"
                        : "bg-rose-950/90 border-rose-500/50 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-left">
                      {(ventureScanResult?.success ?? scanResult?.success) ? (
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-white text-xs">
                          {ventureScanResult
                            ? ventureScanResult.success
                              ? `ADMITTED: ${ventureScanResult.member?.fullName} (${ventureScanResult.member?.teamName})`
                              : ventureScanResult.message
                            : scanResult
                            ? scanResult.success
                              ? `ADMITTED: ${scanResult.ticket?.ownerName || scanResult.staffName || "Guest"}`
                              : scanResult.message
                            : scanError}
                        </p>
                        {ventureScanResult?.teamStats && (
                          <p className="text-[10px] text-zinc-300 mt-0.5">
                            Team Check-ins: {ventureScanResult.teamStats.presentCount} / {ventureScanResult.teamStats.totalMembers} Present
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase font-bold shrink-0">
                      {(ventureScanResult?.success ?? scanResult?.success) ? "VERIFIED" : "FLAGGED"}
                    </span>
                  </div>
                )}

                <div className="relative rounded-2xl bg-[#060608] overflow-hidden border border-white/10 min-h-[320px] flex items-center justify-center">
                  <div id="qr-reader" className="w-full h-full max-w-md"></div>
                  
                  {/* Interactive scanning bracket layout */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
                    <div className="flex justify-between">
                      <div className="h-7 w-7 border-t-4 border-l-4 border-[#e23744] rounded-tl-sm"></div>
                      <div className="h-7 w-7 border-t-4 border-r-4 border-[#e23744] rounded-tr-sm"></div>
                    </div>
                    
                    {/* Scanning Laser animation */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#ff2a54] to-transparent shadow-[0_0_12px_#ff2a54] animate-[bounce_2.5s_infinite]"></div>
                    
                    <div className="flex justify-between">
                      <div className="h-7 w-7 border-b-4 border-l-4 border-[#e23744] rounded-bl-sm"></div>
                      <div className="h-7 w-7 border-b-4 border-r-4 border-[#e23744] rounded-br-sm"></div>
                    </div>
                  </div>

                  {/* Floating Indicator banner */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#0c0c11]/95 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none flex items-center gap-2 z-20">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff2a54]" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest font-mono">
                      Align QR Code in Frame
                    </span>
                  </div>
                </div>

                <button
                  onClick={stopCamera}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/5 py-3 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition cursor-pointer active:scale-95 duration-150"
                >
                  <StopCircle className="h-4 w-4" />
                  <span>Stop Camera Scanner</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 text-rose-300 text-xs text-left">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Camera Initialization Blocked</p>
                  <p className="text-[11px] text-rose-300/80 mt-1 leading-relaxed">
                    {cameraError}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: MANUAL ENTRY */}
        {activeTab === "manual" && (
          <div className="space-y-4 relative z-10 text-left">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleScanSubmit(passCodeInput);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  {eventMode === "venture" ? "Delegate Token / Reference ID / Email" : "Attendee Passcode or Ticket Number"}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder={eventMode === "venture" ? "e.g. VV-6EAC7418, vv_6eac..., or delegate email" : "e.g. HPN-8A3F9D1E or TCK-2026-XXXX"}
                    value={passCodeInput}
                    onChange={(e) => setPassCodeInput(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#14141b] text-base text-white p-4 font-mono uppercase focus:border-[#e23744] focus:outline-none placeholder:text-slate-600 transition tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {eventMode === "venture" ? (
                    <>Enter the delegate's reference ID (<span className="font-mono text-[#ff2a54] font-bold">VV-XXXXXXXX</span>), unique token, or registered email.</>
                  ) : (
                    <>Enter the attendee's 8-character passcode (<span className="font-mono text-[#ff2a54] font-bold">HPN-XXXXXXXX</span>) or Ticket ID.</>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={scanLoading || !passCodeInput.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition disabled:opacity-50 cursor-pointer active:scale-95 duration-150"
              >
                {scanLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                ) : (
                  <span>Verify Pass & Check In</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Processing loader */}
        {scanLoading && (
          <div className="mt-6 rounded-2xl border border-[#e23744]/20 bg-[#e23744]/5 p-4 flex items-center justify-center gap-3 text-[#ff2a54] relative z-10">
            <Loader2 className="h-4.5 w-4.5 animate-spin text-[#ff2a54]" />
            <span className="text-xs font-semibold">Validating gate authorization and cryptographic pass...</span>
          </div>
        )}

        {/* SUCCESS RESULT BANNER */}
        {scanResult && !scanLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 sm:p-6 text-left relative z-10 shadow-xl shadow-emerald-950/40"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    Gate Admittance Approved
                  </span>
                  <span className="text-2xs text-slate-400 font-mono">
                    {formatTimeIST(scanResult.scannedAt)}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black mt-1 font-display text-white">
                  {scanResult.message}
                </h4>

                {scanResult.ticket && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#060608] border border-emerald-500/20 text-xs">
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">Attendee</span>
                      <span className="font-bold text-white block truncate">{scanResult.ticket.ownerName || "Attendee"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">Pass Tier</span>
                      <span className="font-bold text-emerald-400 block truncate">{scanResult.ticket.tierName}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">Seat</span>
                      <span className="font-mono text-white block">{scanResult.ticket.seatNumber || "General Entry"}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-slate-400">Gate Verified</span>
                      <span className="font-bold text-slate-200 block truncate">{scanResult.gateName}</span>
                    </div>
                  </div>
                )}

                {scanResult.gateScansCount !== undefined && (
                  <div className="mt-3 text-[11px] text-emerald-300/80 font-mono">
                    ✓ Total entries admitted through this terminal: <span className="font-bold text-white">{scanResult.gateScansCount}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VENTURE VAULT SUCCESS RESULT BANNER */}
        {ventureScanResult && !scanLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-5 sm:p-6 text-left relative z-10 shadow-2xl shadow-emerald-950/40"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                    Venture Vault • Verified Entry
                  </span>
                  <span className="text-2xs text-zinc-400 font-mono">
                    {ventureScanResult.checkedInAt ? formatTimeIST(ventureScanResult.checkedInAt) : "Just Now"}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black mt-1 font-display text-white">
                  {ventureScanResult.message}
                </h4>

                {ventureScanResult.member && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#060608] border border-emerald-500/20 text-xs">
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-zinc-400">Delegate</span>
                      <span className="font-bold text-white block truncate">{ventureScanResult.member.fullName}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-zinc-400">Team</span>
                      <span className="font-bold text-[#ff2a54] block truncate">{ventureScanResult.member.teamName}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-zinc-400">Role</span>
                      <span className="font-mono text-emerald-400 block">{ventureScanResult.member.role}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-mono font-bold uppercase text-zinc-400">Gate Verified</span>
                      <span className="font-bold text-zinc-200 block truncate">{ventureScanResult.gate}</span>
                    </div>
                  </div>
                )}

                {ventureScanResult.teamStats && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between">
                    <span>Team {ventureScanResult.teamStats.teamName} Attendance:</span>
                    <span className="text-white bg-emerald-600/30 border border-emerald-500/40 px-2.5 py-0.5 rounded-md">
                      {ventureScanResult.teamStats.presentCount} of {ventureScanResult.teamStats.totalMembers} Members in Venue
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ERROR / GATE MISMATCH RESULT BANNER */}
        {scanError && !scanLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 rounded-2xl border p-5 sm:p-6 text-left relative z-10 shadow-xl ${
              scanError.includes("GATE MISMATCH")
                ? "bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-amber-950/40"
                : "bg-rose-950/40 border-rose-500/40 text-rose-200 shadow-rose-950/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  scanError.includes("GATE MISMATCH")
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                    : "bg-rose-500/20 border border-rose-500/30 text-rose-400"
                }`}
              >
                {scanError.includes("GATE MISMATCH") ? (
                  <AlertTriangle className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>

              <div className="flex-1">
                <span
                  className={`text-[10px] font-mono font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                    scanError.includes("GATE MISMATCH")
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {scanError.includes("GATE MISMATCH") ? "Gate Separation Alert" : "Admittance Denied"}
                </span>

                <h4 className="text-base font-black mt-1 font-display text-white">
                  {scanError.includes("GATE MISMATCH") ? "⚠️ Wrong Gate for Attendee Pass" : "✕ Invalid or Ineligible Pass"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {scanError}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* RECENT SCANS LOG */}
      {recentScans.length > 0 && (
        <div className="mt-8 rounded-3xl border border-white/5 bg-[#0c0c11]/80 p-6 text-left">
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
            <span>Recent Shift Check-Ins</span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
              {recentScans.length}
            </span>
          </h3>

          <div className="space-y-2">
            {recentScans.map((scan, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#14141b]/60 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white">{scan.ticket?.ownerName || "Attendee"}</span>
                    <span className="text-2xs text-slate-400 ml-2 font-mono">({scan.ticket?.tierName})</span>
                  </div>
                </div>
                <div className="text-right text-2xs text-slate-400 font-mono">
                  <span>{scan.gateName}</span> • <span>{formatTimeIST(scan.scannedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )}
</div>
  );
};
