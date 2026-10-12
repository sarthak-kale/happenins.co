import React from "react";
import { useFeatures } from "../../context/FeaturesContext";
import { EventDTO, EventOverviewAnalyticsDTO } from "../../types";
import {
  Calendar,
  Ticket,
  Table,
  FileSpreadsheet,
  Loader2,
  Trash2,
  X,
  AlertCircle,
  Pencil,
  Check,
  Users,
  CheckCircle2,
  Clock,
  Percent,
  QrCode,
  Copy
} from "lucide-react";
import { motion } from "motion/react";
import { formatRupees, formatDateIST } from "../../lib/formatters";

interface EventAnalyticsModalProps {
  selectedEventForAnalytics: EventDTO;
  eventAnalyticsData: EventOverviewAnalyticsDTO | null;
  analyticsModalLoading: boolean;
  analyticsModalError: string;
  copiedRosterCode: string | null;
  setCopiedRosterCode: (v: string | null) => void;
  setShowAnalyticsModal: (v: boolean) => void;
  handleViewAnalytics: (ev: EventDTO) => void | Promise<void>;
  handleExporterCSV: (eventId: string, eventTitle: string) => void | Promise<void>;
  handlePromptDelete: (ev: EventDTO) => void;
  handleOpenEditModal: (ev: EventDTO) => void | Promise<void>;
}

export const EventAnalyticsModal: React.FC<EventAnalyticsModalProps> = ({
  selectedEventForAnalytics,
  eventAnalyticsData,
  analyticsModalLoading,
  analyticsModalError,
  copiedRosterCode,
  setCopiedRosterCode,
  setShowAnalyticsModal,
  handleViewAnalytics,
  handleExporterCSV,
  handlePromptDelete,
  handleOpenEditModal,
}) => {
  const { isEnabled } = useFeatures();
  return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-4xl rounded-3xl bg-[#0c0c11] border border-white/[0.08] shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]"
            >
              <div className="absolute -inset-24 rounded-full bg-[#e23744]/5 blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between bg-[#14141b] border-b border-white/[0.08] p-6 relative z-10">
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-md bg-[#e23744]/15 border border-[#e23744]/25 px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider text-rose-300">
                      {selectedEventForAnalytics.category}
                    </span>
                    {selectedEventForAnalytics.endsAt && new Date(selectedEventForAnalytics.endsAt).getTime() < Date.now() ? (
                      <span className="rounded-md bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Passed & Concluded
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Live & Active
                      </span>
                    )}
                    <span className="rounded-md bg-zinc-500/15 border border-zinc-500/25 px-2 py-0.5 text-3xs font-bold text-zinc-400 font-mono">
                      {selectedEventForAnalytics.locationType === "VENUE" ? (selectedEventForAnalytics.venue || selectedEventForAnalytics.city || "Venue") : "Virtual Stream"}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-black text-white tracking-tight">
                    {selectedEventForAnalytics.title}
                  </h2>
                  <p className="text-xs text-zinc-400 flex items-center gap-2 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-[#e23744]" />
                    <span>
                      {formatDateIST(selectedEventForAnalytics.startsAt, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                      {" — "}
                      {formatDateIST(selectedEventForAnalytics.endsAt, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-left relative z-10 custom-scrollbar">
                {analyticsModalLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-[#e23744]" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Generating organizer analytics & audit metrics...
                    </p>
                  </div>
                ) : analyticsModalError ? (
                  <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-center space-y-2">
                    <AlertCircle className="h-6 w-6 text-rose-400 mx-auto" />
                    <p className="text-xs font-bold text-rose-300">{analyticsModalError}</p>
                    <button
                      onClick={() => handleViewAnalytics(selectedEventForAnalytics)}
                      className="mt-2 text-xs text-[#e23744] hover:underline font-bold"
                    >
                      Retry Loading
                    </button>
                  </div>
                ) : eventAnalyticsData ? (
                  <>
                    {/* 4 Metric Cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-4 relative overflow-hidden">
                        <span className="block text-3xs font-extrabold uppercase text-zinc-400 tracking-widest font-mono">
                          Event Gross Revenue
                        </span>
                        <span className="block text-xl font-black text-emerald-400 mt-1 font-display">
                          {formatRupees(eventAnalyticsData.metrics.totalRevenue)}
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1">Confirmed Bookings</span>
                      </div>

                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-4 relative overflow-hidden">
                        <span className="block text-3xs font-extrabold uppercase text-zinc-400 tracking-widest font-mono">
                          Tickets Sold
                        </span>
                        <span className="block text-xl font-black text-rose-200 mt-1 font-display">
                          {eventAnalyticsData.metrics.ticketsSold}{" "}
                          <span className="text-xs text-zinc-400 font-medium">/ {eventAnalyticsData.metrics.totalCapacity}</span>
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1">
                          {eventAnalyticsData.metrics.overallOccupancyRate}% Total Occupancy
                        </span>
                      </div>

                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-4 relative overflow-hidden">
                        <span className="block text-3xs font-extrabold uppercase text-zinc-400 tracking-widest font-mono">
                          Tickets Remaining
                        </span>
                        <span className="block text-xl font-black text-zinc-200 mt-1 font-display">
                          {eventAnalyticsData.metrics.ticketsRemaining}{" "}
                          <span className="text-xs text-zinc-400 font-medium">units</span>
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1">Available for sale</span>
                      </div>

                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-4 relative overflow-hidden">
                        <span className="block text-3xs font-extrabold uppercase text-zinc-400 tracking-widest font-mono">
                          Gate Check-In Rate
                        </span>
                        <span className="block text-xl font-black text-amber-300 mt-1 font-display">
                          {eventAnalyticsData.checkInRatio.percentage}%
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1">
                          {eventAnalyticsData.checkInRatio.checkedIn} of {eventAnalyticsData.checkInRatio.total} passes scanned
                        </span>
                      </div>
                    </div>

                    {/* Tier Breakdown Section */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-[#e23744]" />
                          <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                            Ticket Tier Sales & Capacity Breakdown
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {eventAnalyticsData.tierBreakdown.map((tier) => (
                          <div key={tier.id} className="rounded-xl border border-white/5 bg-white/2 p-3.5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white">{tier.name}</span>
                                <span className="ml-2 text-zinc-400 font-mono">({formatRupees(tier.price)})</span>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-white font-mono">{formatRupees(tier.revenue)}</span>
                                <span className="text-zinc-400 text-3xs ml-2">
                                  ({tier.sold} / {tier.capacity} sold)
                                </span>
                              </div>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#e23744] to-[#ff2a54] transition-all duration-500"
                                style={{ width: `${Math.min(100, tier.occupancyRate)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                              <span>Occupancy: {tier.occupancyRate}%</span>
                              <span>Remaining: {tier.remaining} tickets</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Check-In Monitor */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4 text-emerald-400" />
                          <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                            Live Gate Attendance & QR Verification Monitor
                          </h3>
                        </div>
                        <span className="text-3xs font-extrabold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                          {eventAnalyticsData.checkInRatio.percentage}% Checked In
                        </span>
                      </div>

                      <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${eventAnalyticsData.checkInRatio.percentage}%` }}
                        />
                        <div
                          className="h-full bg-zinc-600/40"
                          style={{ width: `${100 - eventAnalyticsData.checkInRatio.percentage}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                        <div className="rounded-lg bg-white/2 p-2">
                          <span className="block text-[10px] text-zinc-400 uppercase font-mono">Checked In</span>
                          <span className="font-black text-emerald-400 font-mono text-sm">
                            {eventAnalyticsData.checkInRatio.checkedIn}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white/2 p-2">
                          <span className="block text-[10px] text-zinc-400 uppercase font-mono">Pending Gate Entry</span>
                          <span className="font-black text-amber-400 font-mono text-sm">
                            {eventAnalyticsData.checkInRatio.pending}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white/2 p-2">
                          <span className="block text-[10px] text-zinc-400 uppercase font-mono">Total Issued Passes</span>
                          <span className="font-black text-white font-mono text-sm">
                            {eventAnalyticsData.checkInRatio.total}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seating Stats if configured */}
                    {eventAnalyticsData.seatingStats && (
                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4 text-[#e23744]" />
                          <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                            Interactive Seating Grid Allocations
                          </h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="rounded-lg bg-white/2 p-2">
                            <span className="block text-[10px] text-zinc-400 font-mono">Total Grid Seats</span>
                            <span className="font-black text-white font-mono">{eventAnalyticsData.seatingStats.totalSeats}</span>
                          </div>
                          <div className="rounded-lg bg-white/2 p-2">
                            <span className="block text-[10px] text-zinc-400 font-mono">Sold Seats</span>
                            <span className="font-black text-emerald-400 font-mono">{eventAnalyticsData.seatingStats.soldSeats}</span>
                          </div>
                          <div className="rounded-lg bg-white/2 p-2">
                            <span className="block text-[10px] text-zinc-400 font-mono">Held Locks</span>
                            <span className="font-black text-amber-400 font-mono">{eventAnalyticsData.seatingStats.heldSeats}</span>
                          </div>
                          <div className="rounded-lg bg-white/2 p-2">
                            <span className="block text-[10px] text-zinc-400 font-mono">Available Seats</span>
                            <span className="font-black text-zinc-200 font-mono">{eventAnalyticsData.seatingStats.availableSeats}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Promo Codes if any */}
                    {isEnabled("PROMO_CODES") && eventAnalyticsData.promoCodes.length > 0 && (
                      <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4 text-amber-400" />
                          <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                            Event Campaign Promo Codes
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-zinc-300">
                            <thead className="text-[10px] text-zinc-400 font-mono uppercase border-b border-white/5">
                              <tr>
                                <th className="pb-2">Code</th>
                                <th className="pb-2">Discount</th>
                                <th className="pb-2">Redemptions</th>
                                <th className="pb-2 text-right">Max Limit</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                              {eventAnalyticsData.promoCodes.map((p) => (
                                <tr key={p.id}>
                                  <td className="py-2.5 font-bold text-white">{p.code}</td>
                                  <td className="py-2.5 text-emerald-400">
                                    {p.discountType === "PERCENT" ? `${p.discountValue}% OFF` : `${formatRupees(p.discountValue)} OFF`}
                                  </td>
                                  <td className="py-2.5">{p.usedCount} used</td>
                                  <td className="py-2.5 text-right">{p.maxUses ?? "Unlimited"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Attendee Roster Preview */}
                    <div className="rounded-2xl border border-white/[0.08] bg-[#14141b] p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#e23744]" />
                          <h3 className="text-xs font-display font-black text-white uppercase tracking-wider">
                            Confirmed Attendee Roster ({eventAnalyticsData.attendeeRoster.length})
                          </h3>
                        </div>
                        {isEnabled("EVENT_EXPORT") && <button
                          onClick={() => handleExporterCSV(selectedEventForAnalytics.id, selectedEventForAnalytics.title)}
                          className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-3xs font-bold text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                        >
                          <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
                          <span>Export Full CSV</span>
                        </button>}
                      </div>

                      {eventAnalyticsData.attendeeRoster.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">No confirmed bookings placed yet for this event.</p>
                      ) : (
                        <div className="overflow-x-auto max-h-60 custom-scrollbar">
                          <table className="w-full text-left text-xs text-zinc-300">
                            <thead className="text-[10px] text-zinc-400 font-mono uppercase border-b border-white/5 sticky top-0 bg-[#14141b]">
                              <tr>
                                <th className="pb-2">Invoice</th>
                                <th className="pb-2">Attendee</th>
                                <th className="pb-2">Passcode (Gate Entry)</th>
                                <th className="pb-2">Tiers / Qty</th>
                                <th className="pb-2">Amount</th>
                                <th className="pb-2 text-right">Gate Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {eventAnalyticsData.attendeeRoster.map((item) => {
                                const passCode = item.passCode || item.invoiceNumber;
                                return (
                                  <tr key={item.bookingId}>
                                    <td className="py-2 font-mono text-3xs text-zinc-400">{item.invoiceNumber}</td>
                                    <td className="py-2">
                                      <div className="font-bold text-white">{item.customerName}</div>
                                      <div className="text-[10px] text-zinc-400 font-mono">{item.customerEmail}</div>
                                    </td>
                                    <td className="py-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold text-zinc-200 bg-[#060608] border border-white/10 px-2 py-0.5 rounded-lg">
                                          {passCode}
                                        </span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(passCode);
                                            setCopiedRosterCode(item.bookingId);
                                            setTimeout(() => setCopiedRosterCode(null), 2000);
                                          }}
                                          className="text-[10px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-md transition cursor-pointer"
                                          title="Copy passcode for manual gate check-in"
                                        >
                                          {copiedRosterCode === item.bookingId ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                                          ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </td>
                                    <td className="py-2 text-zinc-300 font-medium">
                                      {item.tierNames} ({item.ticketsCount})
                                    </td>
                                    <td className="py-2 font-mono text-emerald-400 font-bold">
                                      {formatRupees(item.totalAmount)}
                                    </td>
                                    <td className="py-2 text-right">
                                      <span
                                        className={`rounded px-2 py-0.5 text-3xs font-extrabold uppercase tracking-wider border ${
                                          item.hasCheckedIn
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        }`}
                                      >
                                        {item.hasCheckedIn ? "Checked In" : "Pending"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between bg-[#14141b] border-t border-white/[0.08] p-5 relative z-10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAnalyticsModal(false);
                      handlePromptDelete(selectedEventForAnalytics);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Event</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAnalyticsModal(false);
                      handleOpenEditModal(selectedEventForAnalytics);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-zinc-200 hover:bg-white/10 transition cursor-pointer"
                  >
                    <Pencil className="h-4 w-4 text-zinc-400" />
                    <span>Edit Event</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isEnabled("EVENT_EXPORT") && <button
                    onClick={() => handleExporterCSV(selectedEventForAnalytics.id, selectedEventForAnalytics.title)}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>}
                  <button
                    onClick={() => setShowAnalyticsModal(false)}
                    className="rounded-xl bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-white/15 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
  );
};
