import React, { useState, useEffect } from "react";
import { TransferDetailsDTO } from "../types";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useFeatures } from "../context/FeaturesContext";
import { Login } from "./Login";
import { Ticket, Calendar, MapPin, CheckCircle2, AlertCircle, Clock, ArrowRight, UserCheck, Loader2 } from "lucide-react";
import { formatDateIST } from "../lib/formatters";
import { getErrorMessage } from "../lib/errors";

interface ClaimTicketProps {
  transferCode: string;
  onClaimedSuccess: () => void;
}

export const ClaimTicket: React.FC<ClaimTicketProps> = ({ transferCode, onClaimedSuccess }) => {
  const { user } = useAuth();
  const { isEnabled } = useFeatures();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [transfer, setTransfer] = useState<TransferDetailsDTO | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const details = await api.getTransferDetails(transferCode);
      setTransfer(details);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load ticket transfer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transferCode) {
      fetchDetails();
    }
  }, [transferCode]);

  const handleClaim = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setClaiming(true);
    setError("");
    try {
      await api.claimTicketTransfer(transferCode);
      setSuccess(true);
      setTimeout(() => {
        onClaimedSuccess();
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to claim ticket transfer.");
    } finally {
      setClaiming(false);
    }
  };

  if (!isEnabled("TICKET_TRANSFERS")) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/90 p-8 backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto mb-4 border border-amber-500/20">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-display font-bold text-white">Ticket transfers are not available</h2>
          <p className="text-xs mt-2 text-slate-400 leading-relaxed">Claiming transferred tickets is currently switched off. Please try again later.</p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] px-5 py-2.5 text-xs font-bold text-white hover:from-[#c81e30] hover:to-[#e23744] transition shadow-lg shadow-red-950/40"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <Loader2 className="h-10 w-10 animate-spin text-[#ff2a54] mb-3" />
        <p className="text-xs font-semibold text-slate-400">Loading transfer details...</p>
      </div>
    );
  }

  if (error && !transfer) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-rose-500/20 bg-[#0c0c11]/90 p-8 backdrop-blur-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mx-auto mb-4 border border-rose-500/20">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-display font-bold text-white">Transfer Link Issue</h2>
          <p className="text-xs mt-2 text-rose-300 leading-relaxed">{error}</p>
          <a
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] px-5 py-2.5 text-xs font-bold text-white hover:from-[#c81e30] hover:to-[#e23744] transition shadow-lg shadow-red-950/40"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 relative z-10">
      {showLoginModal && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0c0c11] border border-white/10 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-base font-bold text-white mb-2">Sign in to Claim Ticket</h3>
            <p className="text-xs text-slate-400 mb-4">
              Please sign in or create a Happenins account to receive this ticket pass under your name.
            </p>
            <Login
              initialMode="register"
              onSuccess={() => {
                setShowLoginModal(false);
                handleClaim();
              }}
            />
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {/* Header decoration */}
        <div className="bg-gradient-to-b from-[#14141b] to-[#0c0c11] p-6 sm:p-8 text-white border-b border-white/10 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded bg-[#e23744]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#ff2a54] tracking-wider border border-[#e23744]/30">
              Ticket Transfer Claim
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">{transfer?.transferCode}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
            {transfer?.eventTitle}
          </h2>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            {transfer?.eventStartsAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#ff2a54]" />
                <span>{formatDateIST(transfer.eventStartsAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
              </div>
            )}
            {transfer?.eventVenue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#ff2a54]" />
                <span>{transfer.eventVenue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sender invitation details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#14141b] p-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e23744]/15 text-[#ff2a54] font-bold text-lg border border-[#e23744]/30">
              {transfer?.senderName?.[0]?.toUpperCase() || "T"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {transfer?.senderName} sent you a ticket!
              </h3>
              <p className="text-xs text-slate-300 mt-1 italic">
                "{transfer?.note || "Here is your event ticket! Enjoy the show!"}"
              </p>
              <div className="mt-2 text-[10px] font-medium text-[#ff2a54] flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5" />
                <span>Tier: {transfer?.tierName} ({transfer?.quantity} ticket)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-semibold text-rose-400">
              {error}
            </div>
          )}

          {success ? (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Ticket Claimed Successfully!</h3>
              <p className="text-xs text-slate-300">
                This ticket has been added to your Happenins account. Your dynamic anti-screenshot QR pass is ready in your wallet.
              </p>
              <p className="text-[10px] font-mono text-emerald-400">Redirecting to My Tickets...</p>
            </div>
          ) : (
            <>
              {transfer?.status === "PENDING" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-b border-white/5 py-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Expires</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {formatDateIST(transfer?.expiresAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] font-display font-bold text-white shadow-xl shadow-red-950/40 transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 active:scale-95 duration-150"
                  >
                    {claiming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Securing Ticket Ownership...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5" />
                        <span>Accept & Claim Ticket Pass</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-500">
                    Claiming will assign the cryptographic gate pass to your registered email ({user?.email || "your account"}).
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#14141b] border border-white/5 p-6 text-center">
                  <span className="inline-block rounded-lg bg-amber-500/10 text-amber-400 px-3 py-1 text-xs font-bold uppercase mb-2">
                    Status: {transfer?.status}
                  </span>
                  <p className="text-xs text-slate-400">
                    {transfer?.status === "CLAIMED"
                      ? "This ticket has already been claimed by a recipient."
                      : "This transfer link is no longer active."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
