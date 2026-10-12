import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { EventDTO, StaffScannerDTO, GateOverviewStatsDTO } from "../types";
import { X, Plus, Users, Copy, RefreshCw, DoorOpen, QrCode, AlertCircle, CheckCircle2, Printer, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { AddScannerPanel } from "./staff-scanner/AddScannerPanel";
import { RosterTab } from "./staff-scanner/RosterTab";
import { AnalyticsTab } from "./staff-scanner/AnalyticsTab";
import { HandoutsTab } from "./staff-scanner/HandoutsTab";
import { getErrorMessage } from "../lib/errors";
import { formatDateIST } from "../lib/formatters";

interface StaffScannerManagerModalProps {
  event: EventDTO;
  isOpen: boolean;
  onClose: () => void;
}

export const StaffScannerManagerModal: React.FC<StaffScannerManagerModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"roster" | "analytics" | "handouts">("roster");
  const [scanners, setScanners] = useState<StaffScannerDTO[]>([]);
  const [gateStats, setGateStats] = useState<GateOverviewStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [volunteerCount, setVolunteerCount] = useState<number>(1);
  const [singleStaffName, setSingleStaffName] = useState("");
  const [namePrefix, setNamePrefix] = useState("");
  const [selectedGate, setSelectedGate] = useState("General Gate - East");
  const [customGateInput, setCustomGateInput] = useState("");
  const [tierRestrictionMode, setTierRestrictionMode] = useState<"ALL" | "RESTRICTED">("ALL");
  const [selectedTierNames, setSelectedTierNames] = useState<string[]>([]);
  const [customPinInput, setCustomPinInput] = useState("");
  const [pinExpiryOption, setPinExpiryOption] = useState<"event_end" | "24h" | "none">("event_end");
  const [creating, setCreating] = useState(false);

  // Copied states
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Editing state
  const [editingScannerId, setEditingScannerId] = useState<string | null>(null);
  const [editGateName, setEditGateName] = useState("");
  const [editStaffName, setEditStaffName] = useState("");
  const [editTierRestriction, setEditTierRestriction] = useState<"ALL" | "RESTRICTED">("ALL");
  const [editSelectedTiers, setEditSelectedTiers] = useState<string[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError("");
      const [scannerList, stats] = await Promise.all([
        api.getStaffScanners(event.id),
        api.getGateOverviewStats(event.id).catch(() => null),
      ]);
      setScanners(scannerList);
      setGateStats(stats);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to load staff scanner PINs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event.id) {
      fetchStaffData();
    }
  }, [isOpen, event.id]);

  const handleCreateScanners = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccessMsg("");

    try {
      const finalGate = customGateInput.trim() || selectedGate;
      let expiresAt: string | undefined = undefined;

      if (pinExpiryOption === "event_end" && event.endsAt) {
        // 6 hours after event end
        expiresAt = new Date(new Date(event.endsAt).getTime() + 6 * 3600 * 1000).toISOString();
      } else if (pinExpiryOption === "24h") {
        expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      }

      const allowedTiers = tierRestrictionMode === "RESTRICTED" ? selectedTierNames : undefined;

      const res = await api.createStaffScanners(event.id, {
        count: volunteerCount,
        staffName: volunteerCount === 1 ? singleStaffName.trim() : undefined,
        namePrefix: volunteerCount > 1 ? namePrefix.trim() : undefined,
        gateName: finalGate,
        allowedTiers,
        expiresAt,
        customPin: volunteerCount === 1 && customPinInput.trim() ? customPinInput.trim() : undefined,
      });

      setSuccessMsg(res.message || `Successfully generated ${res.count} staff scanner PINs.`);
      setShowAddForm(false);
      // Reset form
      setSingleStaffName("");
      setNamePrefix("");
      setCustomPinInput("");
      setCustomGateInput("");
      setVolunteerCount(1);
      setSelectedTierNames([]);
      setTierRestrictionMode("ALL");

      await fetchStaffData();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to generate staff PINs.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (scanner: StaffScannerDTO) => {
    try {
      setUpdatingId(scanner.id);
      const updated = await api.updateStaffScanner(scanner.id, {
        isActive: !scanner.isActive,
      });
      setScanners((prev) => prev.map((s) => (s.id === scanner.id ? updated : s)));
      setSuccessMsg(`${scanner.staffName} PIN is now ${!scanner.isActive ? "Active" : "Disabled"}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to update staff PIN.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRegeneratePin = async (scanner: StaffScannerDTO) => {
    try {
      setUpdatingId(scanner.id);
      const updated = await api.updateStaffScanner(scanner.id, {
        regeneratePin: true,
      });
      setScanners((prev) => prev.map((s) => (s.id === scanner.id ? updated : s)));
      setSuccessMsg(`Generated new PIN ${updated.pin} for ${scanner.staffName}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to regenerate PIN.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteScanner = async (scanner: StaffScannerDTO) => {
    if (!window.confirm(`Are you sure you want to revoke PIN for ${scanner.staffName} (${scanner.gateName})?`)) {
      return;
    }
    try {
      setUpdatingId(scanner.id);
      await api.deleteStaffScanner(scanner.id);
      setScanners((prev) => prev.filter((s) => s.id !== scanner.id));
      setSuccessMsg(`Revoked staff PIN for ${scanner.staffName}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to delete scanner PIN.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveEdit = async (scannerId: string) => {
    try {
      setUpdatingId(scannerId);
      const allowedTiers = editTierRestriction === "RESTRICTED" ? editSelectedTiers : ["ALL"];
      const updated = await api.updateStaffScanner(scannerId, {
        staffName: editStaffName.trim(),
        gateName: editGateName.trim(),
        allowedTiers: editTierRestriction === "RESTRICTED" ? editSelectedTiers : undefined,
      });
      setScanners((prev) => prev.map((s) => (s.id === scannerId ? updated : s)));
      setEditingScannerId(null);
      setSuccessMsg("Scanner updated successfully.");
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to save edits.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyPin = (scanner: StaffScannerDTO) => {
    navigator.clipboard.writeText(scanner.pin);
    setCopiedPinId(scanner.id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  const handleCopyAllHandouts = () => {
    const text = scanners
      .map(
        (s, idx) =>
          `[Volunteer #${idx + 1}]\nName: ${s.staffName}\nAssigned Gate: ${s.gateName}\n6-Digit Staff PIN: ${s.pin}\nScanner Link: ${window.location.origin}/scanner\nTiers Allowed: ${s.allowedTierNames && s.allowedTierNames.length > 0 ? s.allowedTierNames.join(", ") : "All Passes"}\n`
      )
      .join("\n--------------------\n\n");

    navigator.clipboard.writeText(
      `HAPPENINS EVENT STAFF PASSES\nEvent: ${event.title}\nDate: ${formatDateIST(event.startsAt, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}\nVenue: ${event.venue || "Venue"}\n\n${text}`
    );
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0c0c11] text-white shadow-2xl overflow-hidden my-8"
      >
        {/* Header with Event Identity */}
        <div className="border-b border-white/10 p-6 sm:p-8 bg-[#14141b] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#e23744] to-[#ff2a54] flex items-center justify-center text-white shadow-lg shadow-red-950/40 shrink-0">
              <DoorOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff2a54] font-mono bg-[#e23744]/10 px-2.5 py-0.5 rounded-md border border-[#e23744]/20">
                  Staff & Gate Management
                </span>
                <span className="text-xs text-slate-400 font-sans">• Strict Financial Privacy Mode</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                {event.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>📍 {event.venue || "Main Venue"}</span>
                <span>🗓 {formatDateIST(event.startsAt, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                <span className="text-emerald-400 font-semibold">
                  👥 {scanners.length} Volunteer PIN{scanners.length === 1 ? "" : "s"} Configured
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/scanner"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <QrCode className="h-4 w-4 text-[#ff2a54]" />
              <span>Open Scanner</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Tab Controls & Add Action */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[#14141b] p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "roster"
                  ? "bg-[#e23744] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Volunteer Roster ({scanners.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-[#e23744] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <DoorOpen className="h-4 w-4" />
              <span>Gate Breakdown & Traffic</span>
            </button>
            <button
              onClick={() => setActiveTab("handouts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "handouts"
                  ? "bg-[#e23744] text-white shadow-md shadow-red-950/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Printer className="h-4 w-4" />
              <span>Print / Copy PIN Cards</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStaffData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
              title="Refresh staff status"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition active:scale-95 duration-150 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{showAddForm ? "Close Generator" : "Add Volunteer PINs"}</span>
            </button>
          </div>
        </div>

        {/* ADD VOLUNTEERS GENERATOR PANEL */}
        <AddScannerPanel
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          volunteerCount={volunteerCount}
          setVolunteerCount={setVolunteerCount}
          singleStaffName={singleStaffName}
          setSingleStaffName={setSingleStaffName}
          namePrefix={namePrefix}
          setNamePrefix={setNamePrefix}
          selectedGate={selectedGate}
          setSelectedGate={setSelectedGate}
          customGateInput={customGateInput}
          setCustomGateInput={setCustomGateInput}
          tierRestrictionMode={tierRestrictionMode}
          setTierRestrictionMode={setTierRestrictionMode}
          selectedTierNames={selectedTierNames}
          setSelectedTierNames={setSelectedTierNames}
          customPinInput={customPinInput}
          setCustomPinInput={setCustomPinInput}
          pinExpiryOption={pinExpiryOption}
          setPinExpiryOption={setPinExpiryOption}
          creating={creating}
          handleCreateScanners={handleCreateScanners}
          event={event}
        />

        {/* TAB 1: VOLUNTEER ROSTER TABLE */}
        {activeTab === "roster" && (
          <RosterTab
            loading={loading}
            scanners={scanners}
            setShowAddForm={setShowAddForm}
            handleCopyAllHandouts={handleCopyAllHandouts}
            copiedAll={copiedAll}
            editingScannerId={editingScannerId}
            editStaffName={editStaffName}
            setEditStaffName={setEditStaffName}
            editGateName={editGateName}
            setEditGateName={setEditGateName}
            setEditTierRestriction={setEditTierRestriction}
            setEditSelectedTiers={setEditSelectedTiers}
            setEditingScannerId={setEditingScannerId}
            handleCopyPin={handleCopyPin}
            copiedPinId={copiedPinId}
            handleToggleActive={handleToggleActive}
            updatingId={updatingId}
            handleSaveEdit={handleSaveEdit}
            handleRegeneratePin={handleRegeneratePin}
            handleDeleteScanner={handleDeleteScanner}
          />
        )}

        {/* TAB 2: GATE BREAKDOWN & TRAFFIC */}
        {activeTab === "analytics" && (
          <AnalyticsTab gateStats={gateStats} scanners={scanners} />
        )}

        {/* TAB 3: PRINT / COPY PIN HANDOUTS */}
        {activeTab === "handouts" && (
          <HandoutsTab handleCopyAllHandouts={handleCopyAllHandouts} copiedAll={copiedAll} scanners={scanners} handleCopyPin={handleCopyPin} copiedPinId={copiedPinId} />
        )}
      </motion.div>
    </div>
  );
};
