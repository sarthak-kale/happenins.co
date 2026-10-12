import React, { useState, useEffect } from "react";
import { WalletDTO } from "../types";
import { api } from "../lib/api";
import { formatRupees, formatDateIST } from "../lib/formatters";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Info,
  X,
  Sparkles,
  Ticket,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { getErrorMessage } from "../lib/errors";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreEvents?: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onExploreEvents }) => {
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getWallet();
      setWallet(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load Happenins Wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWallet();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0c11] p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#e23744]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#e23744] to-[#ff2a54] p-0.5 shadow-lg shadow-red-950/40 flex items-center justify-center text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <span>Happenins Wallet</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Instant refunds, zero-wait checkout & balance carry-forward</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadWallet}
              disabled={loading}
              title="Refresh Wallet Balance"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 py-5 flex-1 pr-1 custom-scrollbar relative z-10">
          {/* Balance Hero Card */}
          <div className="rounded-3xl border border-white/10 bg-[#14141b] p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#ff2a54]">
                  Available Spending Balance
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {wallet ? formatRupees(wallet.balance) : "₹0.00"}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Automatically applied at checkout to reduce your next ticket booking price.
                </p>
              </div>

              {onExploreEvents && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onExploreEvents();
                  }}
                  className="rounded-2xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95 duration-150"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Book Next Event</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cancellation Policy Banner */}
          <div className="rounded-2xl border border-white/5 bg-[#14141b]/60 p-4.5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Transparent Cancellation & Refund Policy</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When you cancel a ticket, the refund amount (after deducting nominal policy charges based on hours remaining before showtime) is credited immediately to your Happenins Wallet.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-center">
                <span className="text-[10px] font-bold text-emerald-300 block">&gt; 72 Hours</span>
                <span className="text-xs font-black text-white">0% Fee</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">100% Refund</span>
              </div>
              <div className="rounded-xl border border-[#e23744]/20 bg-[#e23744]/5 p-2.5 text-center">
                <span className="text-[10px] font-bold text-[#ff2a54] block">24 - 72 Hours</span>
                <span className="text-xs font-black text-white">25% Fee</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">75% Refund</span>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-center">
                <span className="text-[10px] font-bold text-amber-300 block">6 - 24 Hours</span>
                <span className="text-xs font-black text-white">50% Fee</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">50% Refund</span>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-center">
                <span className="text-[10px] font-bold text-rose-300 block">&lt; 6 Hours</span>
                <span className="text-xs font-black text-white">Non-Ref.</span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Final Pass</span>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Wallet Activity History
              </h3>
              <span className="text-[11px] text-slate-500">
                {wallet?.transactions?.length || 0} Transactions
              </span>
            </div>

            {loading && !wallet ? (
              <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-[#ff2a54]" />
                <span>Loading activity...</span>
              </div>
            ) : wallet && wallet.transactions && wallet.transactions.length > 0 ? (
              <div className="space-y-2">
                {wallet.transactions.map((tx) => {
                  const isCredit = tx.type === "CREDIT";
                  return (
                    <div
                      key={tx.id}
                      className="rounded-2xl border border-white/5 bg-[#14141b]/60 p-3.5 flex items-center justify-between gap-3 hover:bg-[#14141b] transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-white/5 text-slate-300 border border-white/10"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{tx.description}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                isCredit
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-white/10 text-slate-300"
                              }`}
                            >
                              {tx.category || (isCredit ? "Refund Credit" : "Checkout Debit")}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {formatDateIST(tx.createdAt, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-black block ${
                            isCredit ? "text-emerald-400" : "text-slate-200"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatRupees(tx.amount)}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Bal: {formatRupees(tx.balanceAfter)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                <Wallet className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">No wallet transactions yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Any cancellation refunds or promotional credits will appear right here and can be spent on your next ticket booking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#ff2a54]" />
            <span>Happenins Guaranteed Refunds</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
