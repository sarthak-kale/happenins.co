import React from "react";
import { EventDTO } from "../../types";
import { useFeatures } from "../../context/FeaturesContext";
import {
  Table,
  FileSpreadsheet,
  Trash2,
  Pencil,
  BarChart2,
  Clock,
  CalendarCheck,
  CalendarX,
  QrCode,
  KeyRound
} from "lucide-react";
import { formatDateIST } from "../../lib/formatters";

export type CatalogTab = "all" | "active" | "passed" | "draft";

interface EventCatalogTableProps {
  events: EventDTO[];
  catalogTab: CatalogTab;
  setCatalogTab: (tab: CatalogTab) => void;
  onNavigateToScanner?: () => void;
  onOpenStaffScanners: (ev: EventDTO) => void;
  handleViewAnalytics: (ev: EventDTO) => void | Promise<void>;
  handleOpenEditModal: (ev: EventDTO) => void | Promise<void>;
  triggerPublish: (id: string) => void | Promise<void>;
  triggerCancel: (id: string) => void | Promise<void>;
  handleExporterCSV: (eventId: string, eventTitle: string) => void | Promise<void>;
  handlePromptDelete: (ev: EventDTO) => void;
}

export const EventCatalogTable: React.FC<EventCatalogTableProps> = ({
  events,
  catalogTab,
  setCatalogTab,
  onNavigateToScanner,
  onOpenStaffScanners,
  handleViewAnalytics,
  handleOpenEditModal,
  triggerPublish,
  triggerCancel,
  handleExporterCSV,
  handlePromptDelete,
}) => {
  const { isEnabled } = useFeatures();
  return (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] shadow-2xl overflow-hidden">
            <div className="border-b border-white/[0.08] bg-[#111116] p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5 text-[#ff2a54]" />
                <h2 className="text-sm font-display font-black text-white uppercase tracking-wider">
                  Organizer Event Catalog & Analytics
                </h2>
              </div>

              {/* Status Filter Tabs */}
              {(() => {
                const nowMs = Date.now();
                const allCount = events.length;
                const activeCount = events.filter((e) => e.status === "PUBLISHED" && (!e.endsAt || new Date(e.endsAt).getTime() >= nowMs)).length;
                const passedCount = events.filter((e) => e.endsAt && new Date(e.endsAt).getTime() < nowMs).length;
                const draftCount = events.filter((e) => e.status === "DRAFT").length;

                return (
                  <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
                    <button
                      onClick={() => setCatalogTab("all")}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        catalogTab === "all"
                          ? "bg-[#e23744] text-white shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <span>All Events</span>
                      <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px]">{allCount}</span>
                    </button>
                    <button
                      onClick={() => setCatalogTab("active")}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        catalogTab === "active"
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <CalendarCheck className="h-3 w-3" />
                      <span>Active & Upcoming</span>
                      <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px]">{activeCount}</span>
                    </button>
                    <button
                      onClick={() => setCatalogTab("passed")}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        catalogTab === "passed"
                          ? "bg-amber-600 text-white shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <CalendarX className="h-3 w-3" />
                      <span>Passed & Concluded</span>
                      <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px]">{passedCount}</span>
                    </button>
                    <button
                      onClick={() => setCatalogTab("draft")}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                        catalogTab === "draft"
                          ? "bg-white/[0.15] text-white shadow-md"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <span>Drafts</span>
                      <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px]">{draftCount}</span>
                    </button>
                  </div>
                );
              })()}
            </div>

            {(() => {
              const nowMs = Date.now();
              const filteredList = events.filter((ev) => {
                const isPassed = ev.endsAt && new Date(ev.endsAt).getTime() < nowMs;
                if (catalogTab === "active") return ev.status === "PUBLISHED" && !isPassed;
                if (catalogTab === "passed") return isPassed;
                if (catalogTab === "draft") return ev.status === "DRAFT";
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="p-16 text-center text-slate-500">
                    {catalogTab === "passed"
                      ? "No concluded or passed events found in your catalog."
                      : catalogTab === "active"
                      ? "No active upcoming events right now. Click 'Create New Event' to publish one!"
                      : catalogTab === "draft"
                      ? "No draft events. Click 'Create New Event' to start a new draft!"
                      : "You haven't configured any community event listings. Click 'Create New Event' to start!"}
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs text-slate-300">
                    <thead className="border-b border-white/5 bg-[#0c0c24]/85 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Event Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Schedule</th>
                        <th className="px-6 py-4">Status & State</th>
                        <th className="px-6 py-4 text-right">Overview, Analytics & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-medium">
                      {filteredList.map((ev) => {
                        const isPassed = Boolean(ev.endsAt && new Date(ev.endsAt).getTime() < nowMs);

                        return (
                          <tr key={ev.id} className="hover:bg-white/2 transition duration-150">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-white font-display text-sm">{ev.title}</span>
                                <span className="text-[11px] text-slate-400 mt-0.5">
                                  {ev.locationType === "VENUE" ? (ev.venue || ev.city || "On-site Venue") : "Online Virtual Event"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-400 font-sans">{ev.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-400">
                              <div className="flex flex-col">
                                <span>{formatDateIST(ev.startsAt, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                                {isPassed && (
                                  <span className="text-[10px] text-amber-400 font-sans font-bold flex items-center gap-1 mt-0.5">
                                    <Clock className="h-3 w-3" /> Concluded
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1 items-start">
                                <span
                                  className={`rounded px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider border ${
                                    isPassed
                                      ? "bg-slate-500/10 border-slate-500/20 text-slate-350"
                                      : ev.status === "PUBLISHED"
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-350"
                                      : ev.status === "DRAFT"
                                      ? "bg-amber-500/10 border-amber-500/20 text-amber-350"
                                      : "bg-rose-500/10 border-rose-500/20 text-rose-350"
                                  }`}
                                >
                                  {isPassed ? "PASSED & CONCLUDED" : ev.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {onNavigateToScanner && ev.status === "PUBLISHED" && isEnabled("STAFF_SCANNERS") && (
                                  <button
                                    onClick={onNavigateToScanner}
                                    title="Open Master Gate Scanner for this event"
                                    className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-3xs font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 transition cursor-pointer active:scale-95 duration-150"
                                  >
                                    <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                                    <span>Gate Scan</span>
                                  </button>
                                )}

                                {/* Staff PINs & Gate Separation Button */}
                                {isEnabled("STAFF_SCANNERS") && <button
                                  onClick={() => onOpenStaffScanners(ev)}
                                  title="Manage Volunteer Staff 6-Digit PINs & Gate Separation (VIP vs General)"
                                  className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-3xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer active:scale-95 duration-150"
                                >
                                  <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Staff PINs & Gates</span>
                                </button>}

                                {/* Organizer Analytics & Deep Dive Button */}
                                <button
                                  onClick={() => handleViewAnalytics(ev)}
                                  title="View Detailed Overview & Analytics for this event (Organizer Only)"
                                  className="flex items-center gap-1.5 rounded-xl border border-[#e23744]/30 bg-[#e23744]/10 px-3 py-2 text-3xs font-black uppercase tracking-wider text-rose-200 hover:bg-[#e23744]/20 transition cursor-pointer active:scale-95 duration-150"
                                >
                                  <BarChart2 className="h-3.5 w-3.5 text-[#e23744]" />
                                  <span>Overview & Analytics</span>
                                </button>

                                {ev.status === "DRAFT" && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditModal(ev)}
                                      className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-3xs font-black uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition cursor-pointer active:scale-95 duration-150"
                                    >
                                      <Pencil className="h-3 w-3" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => triggerPublish(ev.id)}
                                      className="rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] px-3.5 py-2 text-3xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e23744]/20 transition cursor-pointer active:scale-95 duration-150"
                                    >
                                      Publish
                                    </button>
                                  </>
                                )}

                                {ev.status === "PUBLISHED" && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditModal(ev)}
                                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#14141b] px-3 py-2 text-3xs font-black uppercase tracking-wider text-zinc-200 hover:bg-white/10 transition cursor-pointer active:scale-95 duration-150"
                                    >
                                      <Pencil className="h-3 w-3 text-zinc-400" />
                                      <span>Edit</span>
                                    </button>
                                    {!isPassed && (
                                      <button
                                        onClick={() => triggerCancel(ev.id)}
                                        className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-3xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition cursor-pointer active:scale-95 duration-150"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                    {isEnabled("EVENT_EXPORT") && <button
                                      onClick={() => handleExporterCSV(ev.id, ev.title)}
                                      title="Export Attendee Roster CSV"
                                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#14141b] px-3 py-2 text-3xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 transition cursor-pointer active:scale-95 duration-150"
                                    >
                                      <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
                                      <span>CSV</span>
                                    </button>}
                                  </>
                                )}

                                {/* Delete Event Button */}
                                <button
                                  onClick={() => handlePromptDelete(ev)}
                                  title="Delete this event from the platform"
                                  className="flex items-center gap-1 rounded-xl border border-rose-500/20 bg-rose-500/5 px-2.5 py-2 text-3xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/20 transition cursor-pointer active:scale-95 duration-150"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
  );
};
