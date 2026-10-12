import React, { useState, useEffect } from "react";
import { BookingDTO, WhatsAppNotificationDTO } from "../types";
import { api } from "../lib/api";
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  X,
  Phone,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { getErrorMessage } from "../lib/errors";

interface WhatsAppModalProps {
  booking: BookingDTO;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ booking, isOpen, onClose }) => {
  const [phone, setPhone] = useState<string>("8767164611");
  const [preview, setPreview] = useState<WhatsAppNotificationDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const loadPreview = async (targetPhone = phone) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getWhatsAppConfirmation(booking.id, targetPhone);
      setPreview(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to generate WhatsApp confirmation preview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && booking) {
      loadPreview(phone);
    }
  }, [isOpen, booking.id]);

  const handleSendNotification = async () => {
    setSending(true);
    setError("");
    setSendSuccess(false);
    try {
      await api.sendWhatsAppConfirmation(booking.id, phone);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to dispatch WhatsApp message.");
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = () => {
    if (!preview?.message) return;
    navigator.clipboard.writeText(preview.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0c11] p-6 sm:p-7 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <span>WhatsApp Ticket Dispatch</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20 uppercase">
                  Verified Line
                </span>
              </h3>
              <p className="text-xs text-slate-400">Official Sender: <span className="font-mono text-emerald-300 font-bold">+91 8767164611</span></p>
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
        <div className="overflow-y-auto space-y-4 py-4 flex-1 pr-1 custom-scrollbar relative z-10">
          {error && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              {error}
            </div>
          )}

          {sendSuccess && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Ticket confirmation successfully dispatched to WhatsApp!</span>
            </div>
          )}

          {/* Recipient Phone Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Recipient WhatsApp Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-mono">
                  +91
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="8767164611"
                  className="w-full rounded-xl bg-[#14141b] border border-white/10 pl-11 pr-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={() => loadPreview(phone)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition cursor-pointer shrink-0"
              >
                Update Link
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              The ticket pass with venue details and invoice hash will be formatted for this number.
            </p>
          </div>

          {/* WhatsApp Chat Preview */}
          <div className="rounded-2xl border border-white/10 bg-[#14141b] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Formatted WhatsApp Template</span>
              </span>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                <span>Loading template...</span>
              </div>
            ) : preview ? (
              <div className="rounded-xl bg-[#060608] p-3.5 border border-white/10 font-mono text-[11px] text-emerald-100 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {preview.message}
              </div>
            ) : null}
          </div>

          {/* Direct WhatsApp URL Button */}
          {preview?.directUrl && (
            <a
              href={preview.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in WhatsApp Web / App</span>
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Official Gate Sender: 8767164611</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSendNotification}
              disabled={sending || loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Send Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
