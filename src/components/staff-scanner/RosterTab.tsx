import React from "react";
import { StaffScannerDTO } from "../../types";
import { X, Plus, Copy, Check, Trash2, RefreshCw, DoorOpen, Loader2 } from "lucide-react";

interface RosterTabProps {
  setShowAddForm: (v: boolean) => void;
  scanners: StaffScannerDTO[];
  loading: boolean;
  copiedPinId: string | null;
  copiedAll: boolean;
  editingScannerId: string | null;
  setEditingScannerId: (v: string | null) => void;
  editGateName: string;
  setEditGateName: (v: string) => void;
  editStaffName: string;
  setEditStaffName: (v: string) => void;
  setEditTierRestriction: (v: "ALL" | "RESTRICTED") => void;
  setEditSelectedTiers: React.Dispatch<React.SetStateAction<string[]>>;
  updatingId: string | null;
  handleToggleActive: (s: StaffScannerDTO) => void;
  handleRegeneratePin: (s: StaffScannerDTO) => void;
  handleDeleteScanner: (s: StaffScannerDTO) => void;
  handleSaveEdit: (id: string) => void;
  handleCopyPin: (s: StaffScannerDTO) => void;
  handleCopyAllHandouts: () => void;
}

export const RosterTab: React.FC<RosterTabProps> = ({
  setShowAddForm,
  scanners,
  loading,
  copiedPinId,
  copiedAll,
  editingScannerId,
  setEditingScannerId,
  editGateName,
  setEditGateName,
  editStaffName,
  setEditStaffName,
  setEditTierRestriction,
  setEditSelectedTiers,
  updatingId,
  handleToggleActive,
  handleRegeneratePin,
  handleDeleteScanner,
  handleSaveEdit,
  handleCopyPin,
  handleCopyAllHandouts,
}) => {
  return (
    <div className="p-6 sm:p-8">
      {loading && scanners.length === 0 ? (
        <div className="py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54] mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading volunteer staff registry...</p>
        </div>
      ) : scanners.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/2 p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#e23744]/10 border border-[#e23744]/20 text-[#ff2a54] flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="h-8 w-8" />
          </div>
          <h3 className="text-base font-display font-bold text-white">No Volunteer Staff Accounts Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Generate 6-digit staff PINs so volunteers can log into the scanner app at specific entrance gates (e.g. VIP Gate vs General Gate) with zero access to your event revenues.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] text-xs font-bold text-white shadow-lg shadow-red-950/40 transition active:scale-95 duration-150 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate First Volunteer PIN</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <span className="font-bold text-white">{scanners.length}</span> volunteer scanner{scanners.length === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAllHandouts}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition cursor-pointer"
              >
                {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedAll ? "Copied All PINs!" : "Copy All PINs"}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#14141b]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  <th className="py-3.5 px-4">Volunteer & Gate</th>
                  <th className="py-3.5 px-4">6-Digit PIN</th>
                  <th className="py-3.5 px-4">Gate Access Policy</th>
                  <th className="py-3.5 px-4 text-center">Admitted Count</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scanners.map((scanner) => {
                  const isEditing = editingScannerId === scanner.id;
                  const isVIP = scanner.gateName.toLowerCase().includes("vip");

                  return (
                    <tr
                      key={scanner.id}
                      className={`hover:bg-white/2 transition ${!scanner.isActive ? "opacity-50" : ""}`}
                    >
                      {/* Volunteer & Gate */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editStaffName}
                              onChange={(e) => setEditStaffName(e.target.value)}
                              className="w-full rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={editGateName}
                              onChange={(e) => setEditGateName(e.target.value)}
                              className="w-full rounded-lg border border-white/20 bg-slate-900 px-2 py-1 text-xs text-white"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{scanner.staffName}</span>
                              {isVIP && (
                                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono">
                                  VIP Gate
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-2xs">
                              <DoorOpen className="h-3 w-3 text-[#ff2a54]" />
                              <span className="text-white font-medium">{scanner.gateName}</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 6-Digit PIN */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            {scanner.pin}
                          </span>
                          <button
                            onClick={() => handleCopyPin(scanner)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                            title="Copy PIN"
                          >
                            {copiedPinId === scanner.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Gate Access Policy */}
                      <td className="py-4 px-4">
                        {scanner.allowedTierNames && scanner.allowedTierNames.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                              {scanner.allowedTierNames.length} Tier{scanner.allowedTierNames.length > 1 ? "s" : ""} Only
                            </span>
                            <p className="text-[10px] text-slate-400 truncate max-w-[160px]" title={scanner.allowedTierNames.join(", ")}>
                              {scanner.allowedTierNames.join(", ")}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                            All Passes
                          </span>
                        )}
                      </td>

                      {/* Admitted Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono text-sm font-black text-white bg-white/5 px-2.5 py-1 rounded-lg">
                          {scanner.scansCount}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="py-4 px-4 text-2xs text-slate-400 font-mono">
                        {scanner.lastScannedAt ? (
                          <div>
                            <span className="text-slate-300 block">
                              {new Date(scanner.lastScannedAt).toLocaleTimeString()}
                            </span>
                            <span className="text-slate-400">
                              {new Date(scanner.lastScannedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">No scans yet</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(scanner)}
                          disabled={updatingId === scanner.id}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider font-mono transition ${
                            scanner.isActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                          }`}
                        >
                          {scanner.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(scanner.id)}
                              disabled={updatingId === scanner.id}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save changes"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingScannerId(null)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleRegeneratePin(scanner)}
                              disabled={updatingId === scanner.id}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                              title="Regenerate new 6-digit PIN"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${updatingId === scanner.id ? "animate-spin" : ""}`} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingScannerId(scanner.id);
                                setEditStaffName(scanner.staffName);
                                setEditGateName(scanner.gateName);
                                setEditTierRestriction(scanner.allowedTierNames && scanner.allowedTierNames.length > 0 ? "RESTRICTED" : "ALL");
                                setEditSelectedTiers(scanner.allowedTierNames || []);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-[11px] font-semibold px-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteScanner(scanner)}
                              disabled={updatingId === scanner.id}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Revoke PIN"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
