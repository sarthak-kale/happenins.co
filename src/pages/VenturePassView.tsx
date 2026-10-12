import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  QrCode, 
  Calendar,
  Sparkles,
  Loader2,
  Lock,
  ChevronRight,
  Maximize2,
  X
} from "lucide-react";
import QRCode from "qrcode";
import { api, VentureAttendeePassDTO } from "../lib/api";
import { formatTimeIST } from "../lib/formatters";

interface VenturePassViewProps {
  token: string;
  initialRound?: number;
}

export const VenturePassView: React.FC<VenturePassViewProps> = ({ token }) => {
  const activeRound = 3;
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passData, setPassData] = useState<VentureAttendeePassDTO | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null);
  const isPassCheckedInRef = useRef<boolean>(false);
  const pollTimerRef = useRef<any>(null);

  useEffect(() => {
    isPassCheckedInRef.current = false;
    fetchPass(3);

    // Rapid ultra-lightweight heartbeat polling (600ms, <1ms DB lookup)
    // Delivers instant ~300ms confirmation at the gate, then halts immediately.
    pollTimerRef.current = setInterval(() => {
      if (isPassCheckedInRef.current) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        return;
      }
      fetchPassSilent(3);
    }, 600);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [token]);

  const fetchPassSilent = async (round: number = 3) => {
    try {
      if (isPassCheckedInRef.current) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        return;
      }
      const statusData = await api.getVenturePassCheckinStatus(token, round);
      if (statusData && statusData.status === "CHECKED_IN") {
        isPassCheckedInRef.current = true;
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setPassData((prev) => {
          if (!prev) return prev;
          if (prev.currentPass?.status !== "CHECKED_IN") {
            try {
              if ("vibrate" in navigator) navigator.vibrate([150, 75, 150]);
            } catch (_) {}
          }
          return {
            ...prev,
            currentPass: prev.currentPass ? {
              ...prev.currentPass,
              status: "CHECKED_IN",
              checkedInAt: statusData.checkedInAt || new Date().toISOString(),
              checkedInByGate: statusData.checkedInByGate || "Main Security Gate",
            } : prev.currentPass,
            allPasses: prev.allPasses.map((p) =>
              p.roundNumber === round
                ? {
                    ...p,
                    status: "CHECKED_IN",
                    checkedInAt: statusData.checkedInAt || new Date().toISOString(),
                    checkedInByGate: statusData.checkedInByGate || "Main Security Gate",
                  }
                : p
            ),
          };
        });
      }
    } catch (_) {}
  };

  const fetchPass = async (round: number = 3) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVentureAttendeePass(token, round);
      setPassData(data);
      if (data.currentPass?.status === "CHECKED_IN") {
        isPassCheckedInRef.current = true;
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }

      if (data.currentPass?.qrHash) {
        const url = await QRCode.toDataURL(data.currentPass.qrHash, {
          width: 340,
          margin: 2,
          color: {
            dark: "#060608",
            light: "#ffffff",
          },
        });
        setQrDataUrl(url);
      } else {
        setQrDataUrl("");
      }
    } catch (err: unknown) {
      setError("Pass could not be retrieved. The access token may be invalid, expired, or unlisted.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !passData) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 flex items-center gap-3 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff2a54]" />
          <span className="text-sm font-bold text-zinc-300">Retrieving Official Delegate Pass...</span>
        </div>
      </div>
    );
  }

  if (error || !passData) {
    return (
      <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0c0c11] border border-white/10 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-display font-black text-white">Access Denied / Unlisted Pass</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {error || "This delegate pass token is not authorized. Entry is strictly restricted to pre-registered Venture Vault teams."}
          </p>
          <a
            href="/"
            className="district-btn-primary inline-block mt-6 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-lg transition"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const { member, team, event, currentPass, allPasses } = passData;
  const isRoundCurrent = currentPass?.roundNumber === activeRound;
  const isCheckedIn = isRoundCurrent && currentPass?.status === "CHECKED_IN";
  const isLocked = Boolean(
    !loading && isRoundCurrent && (currentPass?.isLocked || currentPass?.status === "LOCKED" || (!currentPass?.qrHash && !isCheckedIn))
  );

  // Extract Team ID if present
  const teamIdMatch = team.teamName.match(/^(?:Team\s*#?\s*|ID\s*#?\s*|#\s*)(\d+)/i);
  const teamId = teamIdMatch ? teamIdMatch[1] : null;

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-[#e23744]/30 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e23744]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#ff2a54]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md rounded-3xl bg-[#0c0c11] border border-white/10 shadow-2xl overflow-hidden relative z-10 flex flex-col">
        
        {/* Banner Hero - Fully visible without cropping or bottom cut */}
        {currentPass?.bannerUrl || event.masterBannerUrl ? (
          <div className="relative w-full overflow-hidden bg-[#060608] border-b border-white/10 flex items-center justify-center">
            <img
              src={currentPass?.bannerUrl || event.masterBannerUrl || ""}
              alt="Event banner"
              className="w-full h-auto max-h-72 object-contain mx-auto block"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 shadow-lg">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Verified Delegate</span>
            </div>
          </div>
        ) : null}

        {/* Pass Header */}
        <div className="p-6 pb-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff2a54]">
              {event.title}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#e23744]/15 border border-[#e23744]/30 text-[#ff2a54] font-mono">
              {teamId ? `TEAM ID: #${teamId}` : "TEAM PASS"}
            </span>
          </div>
          <h1 className="text-xl font-display font-black text-white mt-1">
            {currentPass?.roundTitle || "Venture Access Pass"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-mono">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              {currentPass?.scheduledTime
                ? (currentPass.scheduledTime.toUpperCase().includes("IST") ? currentPass.scheduledTime : `${currentPass.scheduledTime} (IST)`)
                : "Schedule as per event handbook"}
            </span>
          </p>
        </div>

        {/* Round Switcher Tabs - Locked to Round 3, R1 & R2 strictly unclickable */}
        <div className="px-6 py-2">
          <div className="flex bg-[#14141b] border border-white/5 rounded-xl p-1 gap-1">
            <button
              type="button"
              disabled
              className="flex-1 py-2 px-1 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider bg-black/40 text-zinc-500 opacity-60 cursor-not-allowed pointer-events-none flex items-center justify-center gap-1 border border-white/[0.03]"
              title="Round 1 Concluded"
            >
              <span>R1 Concluded</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />
            </button>
            <button
              type="button"
              disabled
              className="flex-1 py-2 px-1 text-center rounded-lg text-[10px] font-mono uppercase tracking-wider bg-black/40 text-zinc-500 opacity-60 cursor-not-allowed pointer-events-none flex items-center justify-center gap-1 border border-white/[0.03]"
              title="Round 2 Concluded"
            >
              <span>R2 Concluded</span>
              <CheckCircle2 className="h-3 w-3 text-emerald-500/70" />
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-1 text-center rounded-lg text-[10px] font-black font-mono uppercase tracking-wider bg-[#e23744] text-white shadow-lg shadow-[#e23744]/25 flex items-center justify-center gap-1.5 cursor-default select-none border border-[#e23744]/40"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span>Round 3 (LIVE)</span>
              {isCheckedIn && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
            </button>
          </div>
        </div>

        {/* Delegate Card */}
        <div className="px-6 py-3">
          <div className="p-4 rounded-2xl bg-[#14141b] border border-white/10 text-left">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                  Delegate Name
                </span>
                <span className="text-base font-black text-white font-display">
                  {member.fullName}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-[#e23744]/15 border border-[#e23744]/30 text-[#ff2a54]">
                {member.role}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1 text-zinc-400">
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  Team ID:
                </span>
                <span className="font-black text-emerald-400 font-mono text-sm">
                  {teamId ? `ID #${teamId}` : team.teamName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-400">Team Name:</span>
                <span className="font-bold text-white font-mono">{team.teamName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card or Vanished Admitted Screen */}
        <div className="px-6 py-4 flex flex-col items-center">
          {loading && !isCheckedIn ? (
            <div className="w-full p-12 rounded-2xl bg-[#14141b]/95 border border-white/10 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54] mb-3" />
              <span className="text-xs font-mono font-bold text-zinc-400">Loading Round {activeRound} Pass...</span>
            </div>
          ) : isCheckedIn ? (
            /* VANISHED QR - REPLACED WITH ADMISSION VALIDATION BADGE */
            <div className="w-full p-6 rounded-2xl bg-gradient-to-b from-emerald-500/15 via-[#0c0c11] to-[#0c0c11] border-2 border-emerald-500/40 shadow-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
              {/* Top Security Tag */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-black uppercase tracking-widest mb-4">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ENTRY ADMITTED • PASS VOIDED</span>
              </div>

              {/* Glowing Validated Badge */}
              <div className="relative my-2">
                <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-2xl animate-pulse" />
                <div className="h-24 w-24 rounded-full bg-[#0c0c11] border-2 border-emerald-400 flex items-center justify-center text-emerald-400 relative shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>

              <h3 className="text-xl font-display font-black text-white mt-4">
                Admission Confirmed
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[260px] leading-relaxed">
                Your entry for <span className="text-white font-bold">{currentPass?.roundTitle || `Round ${activeRound}`}</span> has been authenticated and admitted.
              </p>

              {/* Security Audit Stamp */}
              <div className="mt-5 w-full bg-[#14141b] rounded-xl p-3.5 border border-white/5 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider">Gate Check-in:</span>
                  <span className="text-emerald-400 font-bold">{currentPass?.checkedInByGate || "Main Security Gate"}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider">Time Stamp:</span>
                  <span className="text-white font-bold">
                    {currentPass?.checkedInAt ? formatTimeIST(currentPass.checkedInAt, true) : "Just Now"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider">Security State:</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
                    QR Destroyed / Void for Re-entry
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <span>🚫 QR Code Vanished to Prevent Duplicate Entry</span>
              </div>
            </div>
          ) : isLocked ? (
            /* LOCKED STAGE - ACCESS PASS DISPATCHED ONLY UPON ROUND DISPATCH */
            <div className="w-full p-6 rounded-2xl bg-[#14141b]/95 border border-white/10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-300 animate-in fade-in">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-4">
                <Lock className="h-3 w-3" />
                <span>Stage Locked</span>
              </div>

              <div className="h-20 w-20 rounded-2xl bg-[#0c0c11] border border-white/10 flex items-center justify-center text-zinc-400 my-2 shadow-inner">
                <Lock className="h-9 w-9 text-zinc-400" />
              </div>

              <h3 className="text-lg font-display font-black text-white mt-4">
                {currentPass?.roundTitle || `Round ${activeRound}`} Pass Locked
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-[280px] leading-relaxed">
                Access credentials for this stage will be activated and dispatched to your email once preceding rounds conclude.
              </p>

              <div className="mt-5 w-full bg-[#0c0c11] rounded-xl p-3.5 border border-white/5 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider">Scheduled Window:</span>
                  <span className="text-zinc-200 font-bold">
                    {currentPass?.scheduledTime
                      ? (currentPass.scheduledTime.toUpperCase().includes("IST") ? currentPass.scheduledTime : `${currentPass.scheduledTime} (IST)`)
                      : "As per handbook"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider">Accreditation:</span>
                  <span className="text-emerald-400 font-bold">Verified ({team.teamName})</span>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE QR CODE FOR SCANNER */
            <>
              <div className="p-3 bg-white rounded-2xl shadow-2xl relative group">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Entry QR Pass" className="w-56 h-56 rounded-xl block" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54]" />
                  </div>
                )}
                {/* Anti-screenshot pulse laser animation */}
                <div className="absolute inset-x-3 top-3 h-0.5 bg-gradient-to-r from-transparent via-[#e23744] to-transparent animate-pulse" />
              </div>

              {/* Ready for scan badge */}
              <div className="mt-4 w-full space-y-2">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center gap-2">
                  <QrCode className="h-4 w-4 text-[#ff2a54]" />
                  <span>READY FOR GATE SCANNER • ROUND {activeRound}</span>
                </div>
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={() => setIsMaximized(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-[#ff2a54]" />
                    <span>Tap for High-Contrast Fullscreen QR</span>
                  </button>
                )}
              </div>

              {/* Fullscreen High-Contrast QR Modal */}
              {isMaximized && qrDataUrl && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => setIsMaximized(false)}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                  <div className="text-center mb-6">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#ff2a54] font-black block">
                      {event.title} • ROUND {activeRound}
                    </span>
                    <h2 className="text-xl font-display font-black text-white mt-1">
                      {member.fullName} ({team.teamName})
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Turn phone brightness to max for instant scanning
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-3xl shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                    <img src={qrDataUrl} alt="High Brightness QR" className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl block" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMaximized(false)}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Close Fullscreen
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Advice */}
        <div className="p-5 border-t border-white/5 bg-[#060608]/40 text-center text-[10px] text-zinc-500 leading-relaxed font-mono">
          Show this screen to security volunteers at the entrance. Each pass is tied to your team credentials and locked to 1 entry per round.
        </div>

      </div>
    </div>
  );
};
