import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api, VentureStatusDTO } from "../lib/api";
import { EventDTO, OrganizerAnalytics, EventOverviewAnalyticsDTO } from "../types";
import {
  LayoutDashboard,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Sparkles,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useFeatures } from "../context/FeaturesContext";
import { StaffScannerManagerModal } from "../components/StaffScannerManagerModal";
import { useEventForm } from "./organizer-catalog/useEventForm";
import { OnboardingView } from "./organizer-catalog/OnboardingView";
import { StatsCards } from "./organizer-catalog/StatsCards";
import { AnalyticsCharts } from "./organizer-catalog/AnalyticsCharts";
import { EventCatalogTable, CatalogTab } from "./organizer-catalog/EventCatalogTable";
import { CreateEventModal } from "./organizer-catalog/CreateEventModal";
import { EventAnalyticsModal } from "./organizer-catalog/EventAnalyticsModal";
import { DeleteConfirmModal } from "./organizer-catalog/DeleteConfirmModal";
import { getErrorMessage } from "../lib/errors";
import { getISTDateString } from "../lib/formatters";

interface OrganizerCatalogProps {
  onNavigateToScanner?: () => void;
  onNavigateToVenture?: () => void;
}

export const OrganizerCatalog: React.FC<OrganizerCatalogProps> = ({ onNavigateToScanner, onNavigateToVenture }) => {
  const { user, onboard } = useAuth();
  const { isEnabled } = useFeatures();


  // Onboarding States
  const [onboardCompanyName, setOnboardCompanyName] = useState("");
  const [onboardWebsite, setOnboardWebsite] = useState("");
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");

  // Portal States
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [analytics, setAnalytics] = useState<OrganizerAnalytics | null>(null);
  const [ventureStatus, setVentureStatus] = useState<VentureStatusDTO | null>(null);
  const [exportingVenture, setExportingVenture] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("all");

  // Per-Event Analytics Modal State
  const [selectedEventForAnalytics, setSelectedEventForAnalytics] = useState<EventDTO | null>(null);
  const [eventAnalyticsData, setEventAnalyticsData] = useState<EventOverviewAnalyticsDTO | null>(null);
  const [analyticsModalLoading, setAnalyticsModalLoading] = useState(false);
  const [analyticsModalError, setAnalyticsModalError] = useState("");
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [copiedRosterCode, setCopiedRosterCode] = useState<string | null>(null);

  // Multi-Staff Scanner & Gate Separation Modal State
  const [selectedEventForStaffScanners, setSelectedEventForStaffScanners] = useState<EventDTO | null>(null);
  const [showStaffScannersModal, setShowStaffScannersModal] = useState(false);

  // Event Deletion Confirmation State
  const [eventToDelete, setEventToDelete] = useState<EventDTO | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Creation / Editing State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const form = useEventForm();
  const {
    editingEventId,
    tiers,
    policyType,
    allowedDomains,
    title,
    description,
    category,
    locationType,
    venue,
    city,
    startsAt,
    endsAt,
    bannerUrl,
    hasSeatingPlan,
    seatingRows,
    seatingCols,
    requireVerifiedEmail,
    allowFreeTickets,
    customRestrictionMessage,
    resetForm,
    setCreateLoading,
  } = form;

  const handleOpenCreateModal = async () => {
    resetForm();
    setShowCreateModal(true);
    await form.loadInstitutions();
  };

  const handleOpenEditModal = async (ev: EventDTO) => {
    form.fillFromEvent(ev);
    setShowCreateModal(true);
    await form.loadInstitutions();
  };

  const loadOrganizerData = async () => {
    if (!user || user.role !== "ORGANIZER") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [eventsList, stats] = await Promise.all([
        api.getOrganizerEvents(),
        api.getOrganizerAnalytics(),
      ]);
      setEvents(eventsList);
      setAnalytics(stats);

      if (user?.email?.toLowerCase() === "pacific2306@gmail.com") {
        try {
          const vs = await api.getVentureStatus();
          setVentureStatus(vs);
        } catch (_) {}
      }
    } catch (err: unknown) {
      setError("Failed to fetch organizer panel data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportVenture = async () => {
    try {
      setExportingVenture(true);
      await api.exportVentureLedger();
    } catch (err: unknown) {
      setError("Failed to export attendance ledger: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setExportingVenture(false);
    }
  };

  useEffect(() => {
    loadOrganizerData();
  }, [user]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError("");
    setOnboardLoading(true);

    try {
      await onboard(onboardCompanyName, onboardWebsite || undefined);
    } catch (err: unknown) {
      setOnboardError(getErrorMessage(err) || "Onboarding failed.");
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tiers.length === 0) {
      setError("Please add at least 1 ticket tier capacity before submitting.");
      return;
    }

    if (policyType === "INSTITUTION_ONLY" && allowedDomains.length === 0) {
      setError("For Institution-Restricted events, please specify at least one allowed domain (e.g., rbunagpur.in).");
      return;
    }

    setCreateLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description,
        category,
        locationType,
        venue: locationType === "VENUE" ? venue : "Zoom Live Stream",
        city: locationType === "VENUE" ? city : undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        bannerUrl: bannerUrl || undefined,
        ticketTiers: tiers,
        hasSeatingPlan,
        seatingRows: hasSeatingPlan ? seatingRows : undefined,
        seatingCols: hasSeatingPlan ? seatingCols : undefined,
        accessPolicy: {
          policyType,
          allowedDomains,
          requireVerifiedEmail,
          allowFreeTickets,
          customRestrictionMessage: customRestrictionMessage.trim() || undefined,
        },
      };

      if (editingEventId) {
        await api.updateEvent(editingEventId, payload);
      } else {
        await api.createEvent(payload);
      }

      setShowCreateModal(false);
      resetForm();
      loadOrganizerData();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || (editingEventId ? "Failed to update event." : "Failed to create draft event."));
    } finally {
      setCreateLoading(false);
    }
  };

  const triggerPublish = async (id: string) => {
    try {
      await api.updateLifecycle(id, "publish");
      loadOrganizerData();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Publish failed.");
    }
  };

  const triggerCancel = async (id: string) => {
    try {
      await api.updateLifecycle(id, "cancel");
      loadOrganizerData();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Cancel failed.");
    }
  };

  const handleExporterCSV = async (eventId: string, eventTitle: string) => {
    try {
      const csvContent = await api.downloadRosterCSV(eventId);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `attendance_roster_${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${getISTDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      setError("Failed to download roster CSV.");
    }
  };

  const handleViewAnalytics = async (event: EventDTO) => {
    setSelectedEventForAnalytics(event);
    setShowAnalyticsModal(true);
    setAnalyticsModalLoading(true);
    setAnalyticsModalError("");
    setEventAnalyticsData(null);

    try {
      const data = await api.getEventOrganizerAnalytics(event.id);
      setEventAnalyticsData(data);
    } catch (err: unknown) {
      setAnalyticsModalError(getErrorMessage(err) || "Failed to load detailed analytics for this event.");
    } finally {
      setAnalyticsModalLoading(false);
    }
  };

  const handlePromptDelete = (event: EventDTO) => {
    setEventToDelete(event);
    setDeleteError("");
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      await api.deleteEvent(eventToDelete.id);
      setShowDeleteConfirmModal(false);
      if (showAnalyticsModal && selectedEventForAnalytics?.id === eventToDelete.id) {
        setShowAnalyticsModal(false);
      }
      setEventToDelete(null);
      setSuccessToast(`Event "${eventToDelete.title}" has been deleted from your dashboard.`);
      setTimeout(() => setSuccessToast(""), 5000);
      loadOrganizerData();
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err) || "Failed to delete event.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 1. Rendering Onboarding view if user is not ORGANIZER
  if (user && user.role !== "ORGANIZER" && !isEnabled("ORGANIZER_ONBOARDING")) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-8 shadow-2xl">
          <h2 className="text-lg font-display font-black text-white">Organizer accounts are not available</h2>
          <p className="text-xs mt-2 text-zinc-400 leading-relaxed">Becoming an event organizer is currently switched off. Please check back later.</p>
        </div>
      </div>
    );
  }
  if (user && user.role !== "ORGANIZER") {
    return (
      <OnboardingView
        onboardCompanyName={onboardCompanyName}
        setOnboardCompanyName={setOnboardCompanyName}
        onboardWebsite={onboardWebsite}
        setOnboardWebsite={setOnboardWebsite}
        onboardLoading={onboardLoading}
        onboardError={onboardError}
        handleOnboardSubmit={handleOnboardSubmit}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative z-10 animate-fade-in">
      {/* Exposes success alerts */}
      {successToast && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-extrabold text-emerald-300 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Exposes error alerts */}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs font-extrabold text-rose-300 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Head section */}
      <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-center border-b border-white/[0.06] pb-6">
        <div>
          <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-[#ff2a54]" />
            <span>Organizer Management Portal</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-medium max-w-2xl leading-relaxed">
            Monitor sales velocity, configure dynamic pricing tiers, publish event listings, and verify attendee rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToScanner && isEnabled("STAFF_SCANNERS") && (
            <button
              onClick={onNavigateToScanner}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-emerald-300 hover:bg-emerald-500/20 transition active:scale-95 duration-150 cursor-pointer shadow-lg shadow-emerald-950/30"
            >
              <QrCode className="h-4 w-4 text-emerald-400" />
              <span>Open Gate Scanner</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="district-btn-primary flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-xs uppercase tracking-wider transition active:scale-95 duration-150 cursor-pointer shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#e23744]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Venture Vault Master Delegation Summit Showcase (Strictly for pacific2306@gmail.com) */}
          {user?.email?.toLowerCase() === "pacific2306@gmail.com" && ventureStatus && (
            <div className="rounded-3xl border border-[#ff2a54]/30 bg-gradient-to-r from-[#0c0c11] via-[#14141b] to-[#0c0c11] p-6 sm:p-7 shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#e23744]/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  {ventureStatus.event.masterBannerUrl && (
                    <div className="h-24 w-36 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 hidden sm:block">
                      <img src={ventureStatus.event.masterBannerUrl} alt="Venture Vault Master" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff2a54] bg-[#e23744]/15 border border-[#e23744]/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-[#ff2a54]" />
                        Exclusive Private Delegation Summit
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        Multi-SMTP Active
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1.5 tracking-tight">
                      {ventureStatus.event.title || "Venture Vault 2026"}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xl line-clamp-2 leading-relaxed">
                      {ventureStatus.event.description || "Exclusive 3-Stage Elite Delegation Summit & Innovation Competition with 50 pre-registered teams."}
                    </p>

                    {/* Quick Metrics Bar */}
                    <div className="flex items-center gap-4 mt-3 flex-wrap text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">Teams:</span>
                        <span className="font-bold text-white">{ventureStatus.stats?.totalTeams || 0} / 50</span>
                      </div>
                      <span className="text-zinc-700">•</span>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">Candidates:</span>
                        <span className="font-bold text-white">{ventureStatus.stats?.totalMembers || 0}</span>
                      </div>
                      <span className="text-zinc-700">•</span>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">R1 Admitted:</span>
                        <span className="font-bold">{ventureStatus.stats?.round1.checkedIn || 0}</span>
                      </div>
                      <span className="text-zinc-700">•</span>
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">R2 Admitted:</span>
                        <span className="font-bold">{ventureStatus.stats?.round2.checkedIn || 0}</span>
                      </div>
                      <span className="text-zinc-700">•</span>
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <span className="text-zinc-500 font-bold uppercase text-[10px]">R3 Admitted:</span>
                        <span className="font-bold">{ventureStatus.stats?.round3.checkedIn || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                  <button
                    onClick={handleExportVenture}
                    disabled={exportingVenture}
                    className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Download Real-Time Attendance Ledger (.xlsx)"
                  >
                    {exportingVenture ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff2a54]" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{exportingVenture ? "Exporting..." : "Export Ledger"}</span>
                  </button>

                  <a
                    href="/scanner"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold font-mono text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Scanner</span>
                  </a>

                  {onNavigateToVenture ? (
                    <button
                      onClick={onNavigateToVenture}
                      className="district-btn-primary px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shadow-lg shadow-[#e23744]/25 cursor-pointer"
                    >
                      <span>Launch Command Center</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <a
                      href="/venture-vault"
                      className="district-btn-primary px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 shadow-lg shadow-[#e23744]/25 cursor-pointer"
                    >
                      <span>Launch Command Center</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Real-time stats row */}
          {analytics && <StatsCards analytics={analytics} />}

          {/* Recharts Analytics & Sales Dashboard */}
          {analytics && <AnalyticsCharts analytics={analytics} />}

          <EventCatalogTable
            events={events}
            catalogTab={catalogTab}
            setCatalogTab={setCatalogTab}
            onNavigateToScanner={onNavigateToScanner}
            onOpenStaffScanners={(ev) => {
              setSelectedEventForStaffScanners(ev);
              setShowStaffScannersModal(true);
            }}
            handleViewAnalytics={handleViewAnalytics}
            handleOpenEditModal={handleOpenEditModal}
            triggerPublish={triggerPublish}
            triggerCancel={triggerCancel}
            handleExporterCSV={handleExporterCSV}
            handlePromptDelete={handlePromptDelete}
          />
        </div>
      )}

      {/* Draft Creating modal backdrop overlays */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal
            form={form}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateEvent}
          />
        )}

        {/* 2. Event Detailed Overview & Analytics Modal (Organizer Only) */}
        {showAnalyticsModal && selectedEventForAnalytics && (
          <EventAnalyticsModal
            selectedEventForAnalytics={selectedEventForAnalytics}
            eventAnalyticsData={eventAnalyticsData}
            analyticsModalLoading={analyticsModalLoading}
            analyticsModalError={analyticsModalError}
            copiedRosterCode={copiedRosterCode}
            setCopiedRosterCode={setCopiedRosterCode}
            setShowAnalyticsModal={setShowAnalyticsModal}
            handleViewAnalytics={handleViewAnalytics}
            handleExporterCSV={handleExporterCSV}
            handlePromptDelete={handlePromptDelete}
            handleOpenEditModal={handleOpenEditModal}
          />
        )}

        {/* 3. Event Permanent Deletion Confirmation Modal */}
        {showDeleteConfirmModal && eventToDelete && (
          <DeleteConfirmModal
            eventToDelete={eventToDelete}
            deleteError={deleteError}
            deleteLoading={deleteLoading}
            onCancel={() => {
              setShowDeleteConfirmModal(false);
              setEventToDelete(null);
            }}
            handleConfirmDelete={handleConfirmDelete}
          />
        )}
      </AnimatePresence>

      {/* Multi-Staff Scanner & Gate Separation Modal */}
      {selectedEventForStaffScanners && isEnabled("STAFF_SCANNERS") && (
        <StaffScannerManagerModal
          event={selectedEventForStaffScanners}
          isOpen={showStaffScannersModal}
          onClose={() => {
            setShowStaffScannersModal(false);
            setSelectedEventForStaffScanners(null);
          }}
        />
      )}
    </div>
  );
};
