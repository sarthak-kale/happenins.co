import React from "react";
import { BookingDTO, TicketTransferDTO } from "../../types";
import {
  Loader2,
  Send,
  Share2,
  Copy,
  Check,
  User,
  X,
  Mail,
} from "lucide-react";

interface TransferModalProps {
  selectedBooking: BookingDTO;
  transferEmail: string;
  setTransferEmail: (v: string) => void;
  transferName: string;
  setTransferName: (v: string) => void;
  transferNote: string;
  setTransferNote: (v: string) => void;
  transferLoading: boolean;
  transferError: string;
  transferSuccess: string;
  createdTransfer: TicketTransferDTO | null;
  copiedLink: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCopyClaimLink: (code: string) => void;
  onShareWhatsApp: (code: string, eventTitle: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  selectedBooking,
  transferEmail,
  setTransferEmail,
  transferName,
  setTransferName,
  transferNote,
  setTransferNote,
  transferLoading,
  transferError,
  transferSuccess,
  createdTransfer,
  copiedLink,
  onClose,
  onSubmit,
  onCopyClaimLink,
  onShareWhatsApp,
}) => {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-lg rounded-3xl bg-[#0c0c11] border border-white/[0.08] p-6 sm:p-8 shadow-2xl relative space-y-6">
          <button
            onClick={() => onClose()}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
  
          <div>
            <span className="rounded bg-[#e23744]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#ff2a54] tracking-wider font-mono">
              Secure Pass Transfer
            </span>
            <h3 className="text-lg font-display font-black text-white mt-2">
              Send Pass to Friend
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Transfer your pass for "{selectedBooking.eventTitle}" via email or shareable claim link.
            </p>
          </div>
  
          {transferError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-400">
              {transferError}
            </div>
          )}
  
          {transferSuccess && createdTransfer ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                {transferSuccess}
              </div>
  
              <div className="p-4 bg-[#14141b] rounded-2xl border border-white/[0.08] space-y-3">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Share Claim Code: <span className="text-white font-bold">{createdTransfer.transferCode}</span>
                </div>
  
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onCopyClaimLink(createdTransfer.transferCode)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    <span>{copiedLink ? "Link Copied!" : "Copy Claim Link"}</span>
                  </button>
  
                  <button
                    onClick={() => onShareWhatsApp(createdTransfer.transferCode, selectedBooking.eventTitle)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer transition shadow-lg"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share via WhatsApp</span>
                  </button>
                </div>
              </div>
  
              <button
                onClick={() => onClose()}
                className="district-btn-primary w-full py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-white transition cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                  Recipient Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={transferEmail}
                    onChange={(e) => setTransferEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full rounded-xl bg-[#14141b] border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#e23744] focus:outline-none"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                  Recipient Name (Optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={transferName}
                    onChange={(e) => setTransferName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl bg-[#14141b] border border-white/[0.08] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#e23744] focus:outline-none"
                  />
                </div>
              </div>
  
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 font-mono">
                  Personal Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="Enjoy the experience!"
                  className="w-full rounded-xl bg-[#14141b] border border-white/[0.08] p-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744] focus:outline-none resize-none"
                />
              </div>
  
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] text-xs font-bold text-zinc-300 hover:text-white transition cursor-pointer border border-white/[0.08]"
                >
                  Cancel
                </button>
  
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="district-btn-primary flex-1 py-3 rounded-xl text-xs uppercase tracking-wider font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {transferLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
  );
};
