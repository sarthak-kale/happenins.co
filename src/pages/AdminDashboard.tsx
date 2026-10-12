import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { formatRupees, formatDateIST } from "../lib/formatters";
import { AdminAnalytics, AdminOrganizerProfile, EventDTO, EventStatus, AdminAuditLog } from "../types";
import {
  ShieldAlert,
  Calendar,
  Users,
  DollarSign,
  Ticket,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  AlertCircle,
  Loader2,
  Lock,
  Globe,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getErrorMessage } from "../lib/errors";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"billing" | "moderation" | "organizers" | "audit">("billing");
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [organizers, setOrganizers] = useState<AdminOrganizerProfile[]>([]);
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdminMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const [stats, orgList, evList, logList] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminOrganizers(),
        api.getAdminEvents(),
        api.getAdminAuditLogs(),
      ]);
      setAnalytics(stats);
      setOrganizers(orgList);
      setEvents(evList);
      setLogs(logList);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load administrative control center records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const handleVerifyOrganizer = async (id: string, currentStatus: boolean) => {
    setActionLoading(`verify-${id}`);
    setError("");
    setSuccess("");
    try {
      await api.verifyOrganizer(id, !currentStatus);
      setSuccess(`Organizer status updated successfully.`);
      
      // Refresh state
      const updatedOrgs = organizers.map((org) => 
         org.id === id ? { ...org, isVerified: !currentStatus } : org
      );
      setOrganizers(updatedOrgs);

      // Re-fetch analytics & logs in background
      api.getAdminAnalytics().then(setAnalytics);
      api.getAdminAuditLogs().then(setLogs);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to progress organizer verification.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateEventStatus = async (id: string, nextStatus: string) => {
    setActionLoading(`mod-${id}`);
    setError("");
    setSuccess("");
    try {
      await api.moderateEventStatus(id, nextStatus);
      setSuccess(`Event is successfully moderated to state: ${nextStatus}.`);
      
      // Refresh local page state
      const updatedEvents = events.map((ev) => 
        ev.id === id ? { ...ev, status: nextStatus as EventStatus } : ev
      );
      setEvents(updatedEvents);

      // Re-fetch analytics & logs in background
      api.getAdminAnalytics().then(setAnalytics);
      api.getAdminAuditLogs().then(setLogs);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to moderate target event.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (cents: number) => {
    return formatRupees(cents);
  };

  const formatDate = (isoStr: string) => {
    return formatDateIST(isoStr, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex h-[450px] flex-col items-center justify-center gap-4 relative z-10">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-[#e23744]/20 blur-xl animate-pulse" />
          <Loader2 className="h-10 w-10 animate-spin text-[#ff2a54] relative z-10" />
        </div>
        <span className="text-2xs font-extrabold text-slate-400 uppercase tracking-[0.25em] animate-pulse font-mono">
          Retrieving Platform Ledgers...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative z-10 animate-fade-in">
      {/* Page Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e23744]/10 border border-[#e23744]/20 py-1 px-3.5 text-3xs font-extrabold uppercase tracking-widest text-[#ff2a54]">
            <Lock className="h-3 w-3" /> System Gate Admin Controller
          </span>
          <h1 className="mt-3 text-2xl font-display font-black text-white tracking-tight leading-none">
            Platform Security Deck
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-3xl leading-relaxed">
            Audit high-volume transactions, approve/ban event listings, toggle organizer corporate certifications, and inspect historical sandbox transaction logs.
          </p>
        </div>
        <button
          onClick={loadAdminMetrics}
          className="rounded-xl border border-white/10 bg-[#14141b] px-5 py-3 text-xs font-black text-white hover:bg-white/10 transition active:scale-95 duration-150 cursor-pointer shadow-lg"
        >
          Refresh Registers
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-extrabold text-rose-300 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs font-extrabold text-emerald-300 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="mb-8 flex border-b border-white/5 overflow-x-auto pb-px gap-1">
        {([
          { id: "billing", label: "Ledger Dashboard", icon: DollarSign },
          { id: "moderation", label: "Moderation Queue", icon: ShieldAlert },
          { id: "organizers", label: "Certified Organizers", icon: UserCheck },
          { id: "audit", label: "Security Audit Logs", icon: Activity },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccess("");
                setError("");
              }}
              className={`flex items-center gap-2 border-b-2 py-3.5 px-4 text-2xs font-display font-extrabold uppercase tracking-widest transition cursor-pointer shrink-0 focus:outline-none ${
                isSelected
                  ? "border-[#e23744] text-[#ff2a54] bg-[#e23744]/5"
                  : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Rendering */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* TAB 1: Ledger & Platform Analytics */}
        {activeTab === "billing" && analytics && (
          <div className="space-y-6">
            {/* Bento statistics grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-550" />
                <div className="flex items-center justify-between">
                  <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">
                    Aggregate Gross Sales
                  </span>
                  <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3.5 text-2xl font-black text-white tracking-tight leading-none font-display">
                  {formatPrice(analytics.totalRevenue)}
                </div>
                <p className="text-[10px] text-emerald-400 mt-3 font-semibold">
                  ● Fully settled platform payments
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e23744]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-550" />
                <div className="flex items-center justify-between">
                  <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">
                    Total Admitted Seats
                  </span>
                  <div className="rounded-xl bg-[#e23744]/15 p-2 text-[#ff2a54]">
                    <Ticket className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3.5 text-2xl font-black text-white tracking-tight leading-none font-display">
                  {analytics.ticketsSoldCount} <span className="text-xs text-slate-400 font-bold">units</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  Across all published community events
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e23744]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-550" />
                <div className="flex items-center justify-between">
                  <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">
                    Onboarded Happenins
                  </span>
                  <div className="rounded-xl bg-[#e23744]/10 p-2 text-[#ff2a54]">
                    <Calendar className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3.5 text-2xl font-black text-white tracking-tight leading-none font-display">
                  {analytics.eventsCount} <span className="text-xs text-slate-400 font-bold">listed</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  Aggregate historical draft + live builds
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-550" />
                <div className="flex items-center justify-between">
                  <span className="text-3xs uppercase font-extrabold text-slate-400 tracking-wider">
                    Verified Host Profiles
                  </span>
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3.5 text-2xl font-black text-white tracking-tight leading-none font-display">
                  {analytics.organizersCount} <span className="text-xs text-slate-400 font-bold">profiles</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-medium">
                  Host companies with legal routing checks
                </p>
              </div>
            </div>

            {/* Platform Events status distribution splits */}
            <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 shadow-2xl">
              <h2 className="text-base font-black text-white mb-5 tracking-tight flex items-center gap-2 font-display">
                <Activity className="h-5 w-5 text-[#ff2a54] animate-pulse" />
                <span>Active Event Lifecycle Splits</span>
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Draft Stage", key: "DRAFT", color: "bg-[#14141b] border border-white/10 text-slate-300" },
                  { label: "Under Review Queue", key: "UNDER_REVIEW", color: "bg-amber-500/10 border border-amber-500/20 text-amber-300 animate-pulse font-semibold" },
                  { label: "Active Published", key: "PUBLISHED", color: "bg-[#e23744]/15 border border-[#e23744]/30 text-[#ff2a54]" },
                  { label: "Completed / Concluded", key: "COMPLETED", color: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" },
                  { label: "Cancelled Listings", key: "CANCELLED", color: "bg-rose-500/10 border border-rose-500/20 text-rose-300" },
                  { label: "Archived Events", key: "ARCHIVED", color: "bg-zinc-500/10 border border-zinc-500/20 text-zinc-300" },
                ].map((st) => {
                  const count = analytics.lifecycle[st.key] || 0;
                  return (
                    <div key={st.key} className="rounded-xl border border-white/10 bg-[#14141b] p-4 font-mono text-center">
                      <span className="block text-3xs uppercase font-extrabold text-slate-400 tracking-widest mb-2 font-sans">
                        {st.label}
                      </span>
                      <span className={`inline-block rounded-md px-3 py-1 font-extrabold text-xs leading-none ${st.color}`}>
                        {count} units
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sandbox instructions info cards */}
            <div className="rounded-2xl border border-dashed border-[#e23744]/30 bg-[#e23744]/5 p-5 flex items-start gap-4 text-left">
              <ShieldAlert className="h-5 w-5 text-[#ff2a54] mt-0.5 shrink-0 animate-bounce" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wide font-display">Platform Billing Securities</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                  Platform billing indexes and transaction states are managed securely inside localized PostgreSQL row filters. Access audits, changes inside host accounts, and verification changes trigger instant, signed event logs matching modern database structures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Moderation Deck (Ev Status Lifecycle) */}
        {activeTab === "moderation" && (
          <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 font-display">
                <ShieldAlert className="h-5 w-5 text-[#ff2a54]" />
                <span>Events Quality Moderation Deck</span>
              </h2>
              <span className="text-2xs font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-amber-400 tracking-widest rounded-lg">
                {events.filter(e => e.status === "UNDER_REVIEW").length} listings pending verification checks
              </span>
            </div>

            {events.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Calendar className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <span>No events registered in the database.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#14141b] border-b border-white/5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-6 py-4">Title & Slug</th>
                      <th className="px-6 py-4">Host Company</th>
                      <th className="px-6 py-4">Schedules</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Moderator Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-white/2 transition duration-150">
                        <td className="px-6 py-4">
                          <span className="block font-bold text-white hover:text-[#ff2a54] transition truncate max-w-[200px] font-display">
                            {ev.title}
                          </span>
                          <span className="block font-mono text-[9px] font-semibold text-[#ff2a54]/60 mt-1">
                            /{ev.slug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-semibold text-slate-300 font-sans">
                            {ev.organizerName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-semibold text-xs text-slate-300 whitespace-nowrap font-mono">
                            {formatDate(ev.startsAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block rounded px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-widest border ${
                              ev.status === "PUBLISHED"
                                ? "bg-[#e23744]/15 border-[#e23744]/30 text-[#ff2a54]"
                                : ev.status === "UNDER_REVIEW"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                                : ev.status === "CANCELLED"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            {ev.status === "UNDER_REVIEW" && (
                              <button
                                onClick={() => handleModerateEventStatus(ev.id, "PUBLISHED")}
                                disabled={!!actionLoading}
                                className="rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] px-3 py-2 text-3xs font-black uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition cursor-pointer disabled:opacity-50 active:scale-95 duration-150"
                              >
                                {actionLoading === `mod-${ev.id}` ? "Updating..." : "Approve Listing"}
                              </button>
                            )}
                            
                            {ev.status !== "CANCELLED" && ev.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleModerateEventStatus(ev.id, "CANCELLED")}
                                disabled={!!actionLoading}
                                className="rounded-xl bg-rose-600 px-3 py-2 text-3xs font-black uppercase tracking-wider text-white hover:bg-rose-500 transition cursor-pointer disabled:opacity-50 active:scale-95 duration-150"
                              >
                                {actionLoading === `mod-${ev.id}` ? "Processing..." : "Ban / Cancel"}
                              </button>
                            )}

                            {ev.status === "DRAFT" && (
                              <button
                                onClick={() => handleModerateEventStatus(ev.id, "PUBLISHED")}
                                disabled={!!actionLoading}
                                className="rounded-xl bg-[#14141b] border border-white/10 px-3 py-2 text-3xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/10 transition cursor-pointer disabled:opacity-50 active:scale-95 duration-150"
                              >
                                Publish Draft
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Organizer Verification */}
        {activeTab === "organizers" && (
          <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 text-left">
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 font-display">
                <UserCheck className="h-5 w-5 text-[#ff2a54]" />
                <span>Host Verification Console</span>
              </h2>
            </div>

            {organizers.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <span>No registered host profiles in database registers.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#14141b] border-b border-white/5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-6 py-4">Corporate Company</th>
                      <th className="px-6 py-4">Primary Representative</th>
                      <th className="px-6 py-4">Contact Coordinates</th>
                      <th className="px-6 py-4">Legal Verified Check</th>
                      <th className="px-6 py-4 text-right">Verification Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {organizers.map((org) => (
                      <tr key={org.id} className="hover:bg-white/2 transition duration-150">
                        <td className="px-6 py-4">
                          <span className="block font-bold text-white font-display">
                            {org.companyName}
                          </span>
                          {org.website && (
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold text-[#ff2a54] hover:text-white mt-1 transition"
                            >
                              <Globe className="h-3 w-3" /> {org.website}
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-semibold text-slate-300 font-sans">
                            {org.user?.fullName || "Representative Name"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-3xs text-slate-400 lowercase">
                          {org.user?.email || "host@email.com"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-3xs font-extrabold uppercase tracking-widest border ${
                              org.isVerified
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-white/2 border-white/5 text-slate-500"
                            }`}
                          >
                            ● {org.isVerified ? "Verified Corporate" : "Standard Host"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleVerifyOrganizer(org.id, org.isVerified)}
                            disabled={!!actionLoading}
                            className={`rounded-xl px-3.5 py-2 text-3xs font-black uppercase tracking-wider border transition cursor-pointer disabled:opacity-50 active:scale-95 duration-150 ${
                              org.isVerified
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                                : "bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] border-transparent text-white shadow-lg shadow-red-950/40"
                            }`}
                          >
                            {actionLoading === `verify-${org.id}`
                              ? "E-signing..."
                              : org.isVerified
                              ? "Revoke Verification"
                              : "Verify Corporate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Core Security logs */}
        {activeTab === "audit" && (
          <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 text-left">
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2 font-display">
                <Activity className="h-5 w-5 text-[#ff2a54] animate-pulse" />
                <span>Centralized Event Audit Log</span>
              </h2>
            </div>

            {logs.length === 0 ? (
              <div className="p-16 text-center text-slate-500">
                <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                <span>No security logs recorded in the ledger.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#14141b] border-b border-white/5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      <th className="px-6 py-4">Operator Email</th>
                      <th className="px-6 py-4">Action Event</th>
                      <th className="px-6 py-4">System Entity</th>
                      <th className="px-6 py-4 font-mono">Entity Link</th>
                      <th className="px-6 py-4 text-right">Scanned Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-3xs text-slate-400">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/1 transition duration-150">
                        <td className="px-6 py-4 text-xs font-semibold text-slate-300 uppercase tracking-tight font-sans">
                          {log.user ? (
                            <span className="block truncate max-w-[150px] font-bold text-white">
                              {log.user.fullName}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-extrabold font-sans">ANONYMOUS/SYSTEM</span>
                          )}
                          <span className="block text-[10px] font-medium text-slate-500 mt-1 lowercase font-mono">
                            {log.user?.email || "system_ledger@happenins.com"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#ff2a54] uppercase tracking-wider">
                          {log.entity}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-500 truncate max-w-[100px]">
                          {log.entityId || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-mono text-[11px] whitespace-nowrap font-medium">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
