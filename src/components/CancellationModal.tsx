import React, { useState, useEffect } from "react";
import { BookingDTO, CancellationPreviewDTO } from "../types";
import { api } from "../lib/api";
import { formatRupees, formatDateIST } from "../lib/formatters";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wallet,
  X,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { getErrorMessage } from "../lib/errors";

interface CancellationModalProps {
  booking: BookingDTO;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: (result: {
    booking: BookingDTO;
    cancellationAssessment: CancellationPreviewDTO;
    walletBalance: number;
    whatsappMessage: string;
  }) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCancelled,
}) => {
  const [assessment, setAssessment] = useState<CancellationPreviewDTO | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reason, setReason] = useState("Schedule conflict / unexpected change");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const presetReasons = [
    "Schedule conflict / unexpected change",
    "Medical or personal emergency",
    "Purchased wrong ticket tier or date",
    "Friend / group plans changed",
    "Other reasons",
  ];

  useEffect(() => {
    if (isOpen && booking) {
      loadAssessment();
    }
  }, [isOpen, booking.id]);

  const loadAssessment = async () => {
    setLoadingPreview(true);
    setError("");
    try {
      const data = await api.previewCancellation(booking.id);
      setAssessment(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to calculate cancellation policy refund.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setCancelLoading(true);
    setError("");
    try {
      const finalReason = reason === "Other reasons" ? customReason : reason;
      const res = await api.cancelBooking(booking.id, finalReason);
      onCancelled(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to cancel ticket.");
      setCancelLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0c11] p-6 sm:p-7 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#e23744]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">
                Cancel Ticket & Refund to Wallet
              </h3>
              <p className="text-xs text-slate-400">
                Invoice: <span className="font-mono text-slate-200 font-semibold">{booking.invoiceNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5 relative z-10">
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loadingPreview ? (
            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#ff2a54]" />
              <span>Evaluating cancellation policy rules...</span>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              {/* Policy Assessment Card */}
              <div className="rounded-2xl border border-white/10 bg-[#14141b] p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Policy Assessment
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      (assessment.feePercentage ?? assessment.cancellationFeePercentage ?? 0) === 0
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : (assessment.feePercentage ?? assessment.cancellationFeePercentage ?? 0) <= 25
                        ? "bg-[#e23744]/15 text-[#ff2a54] border-[#e23744]/30"
                        : (assessment.feePercentage ?? assessment.cancellationFeePercentage ?? 0) <= 50
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {assessment.tierDescription || assessment.tier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
                  <div className="rounded-xl bg-[#0c0c11] p-2.5">
                    <span className="text-[10px] text-slate-400 block">Original Paid</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">
                      {formatRupees(assessment.originalAmount ?? assessment.totalAmountPaid ?? booking.totalAmount)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-rose-500/5 border border-rose-500/10 p-2.5">
                    <span className="text-[10px] text-rose-300 block">
                      Fee ({assessment.feePercentage ?? assessment.cancellationFeePercentage ?? 0}%)
                    </span>
                    <span className="text-xs font-bold text-rose-400 mt-0.5 block">
                      -{formatRupees(assessment.cancellationFee)}
                    </span>
                  </div>

                  <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5">
                    <span className="text-[10px] text-emerald-300 block">Wallet Refund</span>
                    <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                      +{formatRupees(assessment.refundAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {assessment.policyExplanation || assessment.policySummary}
                </p>
              </div>

              {/* Reason Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300">
                  Reason for Cancellation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl bg-[#14141b] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e23744]"
                >
                  {presetReasons.map((r) => (
                    <option key={r} value={r} className="bg-[#14141b] text-white">
                      {r}
                    </option>
                  ))}
                </select>

                {reason === "Other reasons" && (
                  <input
                    type="text"
                    placeholder="Specify reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full mt-2 rounded-xl bg-[#14141b] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e23744]"
                  />
                )}
              </div>

              {/* Happenins Wallet Credit Note */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 flex items-start gap-3">
                <Wallet className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-300/90 leading-relaxed">
                  <strong>Instant Wallet Credit:</strong> {formatRupees(assessment.refundAmount)} will be credited to your Happenins Wallet immediately upon cancellation. You can use it as a full or partial deduction on your next ticket booking.
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelLoading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            Keep My Ticket
          </button>

          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelLoading || loadingPreview || !assessment?.canCancel}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {cancelLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-4 w-4" />
                <span>Confirm & Credit to Wallet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
