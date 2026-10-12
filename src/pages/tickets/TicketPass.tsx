import React, { useState } from "react";
import { BookingDTO } from "../../types";
import { formatRupees, formatDateIST } from "../../lib/formatters";
import { useFeatures } from "../../context/FeaturesContext";
import {
  Calendar,
  MapPin,
  Loader2,
  Send,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Lock,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  isEventDayOrPast,
  isEventPastOrCheckedIn,
  generateICSFile,
  getGoogleCalendarUrl,
} from "./helpers";

interface TicketPassProps {
  selectedBooking: BookingDTO | null;
  qrCodeDataUrl: string;
  qrExpiresIn: number;
  refreshingQR: boolean;
  fetchDynamicToken: (booking: BookingDTO) => Promise<void>;
  onOpenTransfer: () => void;
  onOpenWhatsApp: () => void;
  onOpenCancel: () => void;
  onCancelTransfer: (transferId: string) => void;
}

export const TicketPass: React.FC<TicketPassProps> = ({
  selectedBooking,
  qrCodeDataUrl,
  qrExpiresIn,
  refreshingQR,
  fetchDynamicToken,
  onOpenTransfer,
  onOpenWhatsApp,
  onOpenCancel,
  onCancelTransfer,
}) => {
  const { isEnabled } = useFeatures();
  const [copiedPassCode, setCopiedPassCode] = useState<boolean>(false);

  // Selected Booking calculations
  const isSelectedEventDay = selectedBooking ? isEventDayOrPast(selectedBooking.eventStartsAt) : true;
  const isSelectedCheckedIn = !!selectedBooking?.scannedAt;
  const isSelectedPast = selectedBooking ? isEventPastOrCheckedIn(selectedBooking) : false;
  const shortPassCode = selectedBooking?.qrHash || (selectedBooking ? `HPN-${selectedBooking.invoiceNumber?.slice(-8) || "ACTIVE"}` : "");

  return (
    <div className="md:col-span-7">
      {selectedBooking ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] shadow-2xl overflow-hidden relative">
          {/* Card top banner header */}
          <div className="border-b border-white/[0.08] bg-[#111116] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded bg-[#e23744]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#ff2a54] border border-[#e23744]/25">
                  Official Entry Pass
                </span>
                <h2 className="text-xl md:text-2xl font-display font-black text-white mt-2 leading-tight">
                  {selectedBooking.eventTitle}
                </h2>
                {selectedBooking.eventVenue && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-300">
                    <MapPin className="h-3.5 w-3.5 text-[#ff2a54] shrink-0" />
                    <span>{selectedBooking.eventVenue}</span>
                  </div>
                )}
                {selectedBooking.eventStartsAt && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-300 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{formatDateIST(selectedBooking.eventStartsAt)}</span>
                  </div>
                )}
                {selectedBooking.verifiedCollegeEmail && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Verified College Pass: {selectedBooking.verifiedCollegeEmail}</span>
                  </div>
                )}
              </div>
  
              {/* Actions buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Transfer Button */}
                {selectedBooking.status === "CONFIRMED" && !isSelectedPast && isEnabled("TICKET_TRANSFERS") && (
                  <button
                    onClick={onOpenTransfer}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-white/[0.08] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 text-[#ff2a54]" />
                    <span>Transfer</span>
                  </button>
                )}
  
                {/* WhatsApp notification modal button */}
                {selectedBooking.status === "CONFIRMED" && isEnabled("WHATSAPP_DELIVERY") && (
                  <button
                    onClick={() => onOpenWhatsApp()}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </button>
                )}
  
                {/* Cancellation button */}
                {selectedBooking.status === "CONFIRMED" && !isSelectedPast && (
                  <button
                    onClick={() => onOpenCancel()}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Cancel Pass</span>
                  </button>
                )}
              </div>
            </div>
          </div>
  
          {/* Core card body */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-dashed border-white/10 pb-8">
              {/* Gate Entrance QR Card */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#14141b] border border-white/[0.08] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                
                {/* CONDITION 1: TICKET ALREADY CHECKED IN */}
                {isSelectedCheckedIn ? (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-display">
                      Pass Checked In
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                      Admitted at gate: {formatDateIST(selectedBooking.scannedAt!)}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-zinc-300">
                      <span>Passcode: {shortPassCode}</span>
                    </div>
                  </div>
                ) : !isSelectedEventDay ? (
                  /* CONDITION 2: BEFORE EVENT DAY (LOCKED FOR SECURITY) */
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-[#e23744]/10 border border-[#e23744]/20 flex items-center justify-center text-[#ff2a54] mb-3 shadow-inner">
                      <Lock className="h-7 w-7" />
                    </div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
                      QR Pass Unlocks on Event Day
                    </h4>
                    <p className="text-[11px] text-[#ff2a54] font-mono mt-1 font-bold">
                      {selectedBooking.eventStartsAt
                        ? formatDateIST(selectedBooking.eventStartsAt, { month: "short", day: "numeric", year: "numeric" })
                        : "On Event Date"}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-2.5 leading-relaxed">
                      To protect against scalping and premature duplication, your dynamic entrance QR code and gate passcode unlock automatically on the day of the event.
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Pass Confirmed & Valid</span>
                    </div>
                  </div>
                ) : selectedBooking.status === "CONFIRMED" ? (
                  /* CONDITION 3: ON EVENT DAY & CONFIRMED -> ACTIVE ROTATING QR PASS */
                  <>
                    {/* Top Security Banner */}
                    <div className="w-full flex items-center justify-between text-[9px] font-bold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>Live Entrance Pass</span>
                      </span>
                      <button
                        onClick={() => fetchDynamicToken(selectedBooking)}
                        disabled={refreshingQR}
                        className="text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Force refresh token"
                      >
                        <RefreshCw className={`h-3 w-3 ${refreshingQR ? "animate-spin" : ""}`} />
                      </button>
                    </div>
  
                    <div className="bg-white rounded-2xl p-3 shadow-xl flex items-center justify-center relative">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt="Anti-Screenshot Entrance QR Pass"
                          className="h-36 w-36 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-36 w-36 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#e23744]" />
                        </div>
                      )}
                    </div>
  
                    {/* 30-Second Countdown Timer Bar */}
                    <div className="w-full mt-3.5 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Rotates in {qrExpiresIn}s
                        </span>
                        <span className="text-zinc-500">Anti-Duplicate</span>
                      </div>
  
                      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-[#e23744] transition-all duration-1000 ease-linear rounded-full"
                          style={{ width: `${(qrExpiresIn / 30) * 100}%` }}
                        />
                      </div>
                    </div>
  
                    {/* Short Passcode for manual entry */}
                    <div className="mt-3 flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 w-full">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] text-zinc-400 font-mono uppercase tracking-wider">Gate Passcode</span>
                        <span className="text-xs font-mono font-black text-white tracking-wider">
                          {shortPassCode}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shortPassCode);
                          setCopiedPassCode(true);
                          setTimeout(() => setCopiedPassCode(false), 2000);
                        }}
                        className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition cursor-pointer"
                      >
                        {copiedPassCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedPassCode ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* CONDITION 4: CANCELLED OR UNCONFIRMED */
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
                    <AlertCircle className="h-10 w-10 text-rose-500/60" />
                    <span className="text-[10px] font-semibold mt-2 uppercase tracking-wide text-rose-400">
                      {selectedBooking.status} Pass
                    </span>
                  </div>
                )}
              </div>
  
              {/* Booking parameters metadata list */}
              <div className="md:col-span-7 space-y-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <div>
                  <span className="block leading-none mb-1 text-[10px] text-slate-500 font-display">
                    Invoice Number
                  </span>
                  <span className="block text-sm font-extrabold text-white leading-none font-mono">
                    {selectedBooking.invoiceNumber}
                  </span>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block leading-none mb-1 text-[10px] text-slate-500 font-display">
                      Pass Status
                    </span>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                        selectedBooking.scannedAt
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : selectedBooking.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {selectedBooking.scannedAt ? "CHECKED IN" : selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <span className="block leading-none mb-1 text-[10px] text-slate-500 font-display">
                      Total Paid
                    </span>
                    <span className="block text-sm font-display font-black text-white leading-none">
                      {formatRupees(selectedBooking.totalAmount)}
                    </span>
                  </div>
                </div>
  
                {selectedBooking.status === "CONFIRMED" && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Synchronize Calendar
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => generateICSFile(selectedBooking)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-[10.5px] font-bold text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <Calendar className="h-3.5 w-3.5 text-[#ff2a54]" />
                        <span>Export .ics file</span>
                      </button>
                      <a
                        href={getGoogleCalendarUrl(selectedBooking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-[10.5px] font-bold text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        <span className="inline-block h-3.5 w-3.5 text-center leading-none text-xs text-[#ff2a54] font-extrabold font-mono">
                          G
                        </span>
                        <span>Google Calendar</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
  
            {/* Sub-item purchase tier breakdowns */}
            <div className="mt-6">
              <h4 className="text-xs font-display font-bold uppercase text-zinc-400 tracking-widest mb-3 font-mono">
                Ticket Tier Summary
              </h4>
              <div className="space-y-2.5">
                {selectedBooking.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex justify-between items-center text-sm py-2.5 px-4 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                  >
                    <div className="font-semibold text-zinc-300">
                      {it.tierName}{" "}
                      <span className="text-xs font-medium text-zinc-500 ml-1.5">x{it.quantity}</span>
                    </div>
                    <span className="font-bold text-white">{formatRupees(it.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Active Transfers status on this pass */}
            {selectedBooking.transfers && selectedBooking.transfers.length > 0 && (
              <div className="mt-6 border-t border-white/[0.06] pt-4">
                <h4 className="text-xs font-display font-bold uppercase text-zinc-400 tracking-widest mb-3 flex items-center gap-2 font-mono">
                  <Send className="h-3.5 w-3.5 text-[#ff2a54]" />
                  <span>Ticket Transfers History</span>
                </h4>
  
                <div className="space-y-2">
                  {selectedBooking.transfers.map((tr) => (
                    <div
                      key={tr.id}
                      className="flex items-center justify-between text-xs p-3 bg-slate-900/50 border border-white/5 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tr.recipientEmail}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              tr.status === "CLAIMED"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : tr.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 animate-pulse"
                                : "bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {tr.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                          Code: {tr.transferCode}
                        </span>
                      </div>
  
                      {tr.status === "PENDING" && (
                        <button
                          onClick={() => onCancelTransfer(tr.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline font-bold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="h-60 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-slate-500 font-display">
          Select a booking ticket to view details.
        </div>
      )}
    </div>
  );
};
