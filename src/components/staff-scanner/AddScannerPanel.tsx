import React from "react";
import { EventDTO } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { KeyRound, Sparkles, Loader2 } from "lucide-react";
import { GATE_PRESETS } from "./constants";

interface AddScannerPanelProps {
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  volunteerCount: number;
  setVolunteerCount: (v: number) => void;
  singleStaffName: string;
  setSingleStaffName: (v: string) => void;
  namePrefix: string;
  setNamePrefix: (v: string) => void;
  selectedGate: string;
  setSelectedGate: (v: string) => void;
  customGateInput: string;
  setCustomGateInput: (v: string) => void;
  tierRestrictionMode: "ALL" | "RESTRICTED";
  setTierRestrictionMode: (v: "ALL" | "RESTRICTED") => void;
  selectedTierNames: string[];
  setSelectedTierNames: React.Dispatch<React.SetStateAction<string[]>>;
  customPinInput: string;
  setCustomPinInput: (v: string) => void;
  pinExpiryOption: "event_end" | "24h" | "none";
  setPinExpiryOption: (v: "event_end" | "24h" | "none") => void;
  creating: boolean;
  handleCreateScanners: (e: React.FormEvent) => void;
  event: EventDTO;
}

export const AddScannerPanel: React.FC<AddScannerPanelProps> = ({
  showAddForm,
  setShowAddForm,
  volunteerCount,
  setVolunteerCount,
  singleStaffName,
  setSingleStaffName,
  namePrefix,
  setNamePrefix,
  selectedGate,
  setSelectedGate,
  customGateInput,
  setCustomGateInput,
  tierRestrictionMode,
  setTierRestrictionMode,
  selectedTierNames,
  setSelectedTierNames,
  customPinInput,
  setCustomPinInput,
  pinExpiryOption,
  setPinExpiryOption,
  creating,
  handleCreateScanners,
  event,
}) => {
  return (
    <AnimatePresence>
      {showAddForm && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden border-b border-white/10 bg-[#14141b]/80"
        >
          <form onSubmit={handleCreateScanners} className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#ff2a54]" />
                  <span>Volunteer Scanner PIN Generator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate individual or batch 6-digit staff PINs with assigned gates and optional tier enforcement.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#ff2a54] bg-[#e23744]/10 px-3 py-1 rounded-full border border-[#e23744]/20">
                No Financial Access
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1: Decide How Many Volunteers */}
              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 font-mono">
                  1. Number of Volunteers
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setVolunteerCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        volunteerCount === num
                          ? "bg-[#e23744] border-[#e23744] text-white shadow-md shadow-red-950/40"
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Custom Count:</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={volunteerCount}
                    onChange={(e) => setVolunteerCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-20 rounded-xl border border-white/10 bg-[#060608] px-3 py-1.5 text-xs text-white text-center font-bold font-mono focus:border-[#e23744] focus:outline-none"
                  />
                  <span className="text-2xs text-slate-400">(Max 50)</span>
                </div>

                {volunteerCount === 1 ? (
                  <div className="mt-2">
                    <label className="block text-2xs text-slate-400 mb-1">Volunteer Name / Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex (VIP Usher)"
                      value={singleStaffName}
                      onChange={(e) => setSingleStaffName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-[#e23744] focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="mt-2">
                    <label className="block text-2xs text-slate-400 mb-1">Name Prefix for Batch</label>
                    <input
                      type="text"
                      placeholder="e.g. East Gate Team"
                      value={namePrefix}
                      onChange={(e) => setNamePrefix(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-[#e23744] focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Will name: "{namePrefix || "Volunteer"} #1", "#2", ... "#{volunteerCount}"
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Gate Assignment */}
              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 font-mono">
                  2. Assigned Entrance Gate
                </label>
                <select
                  value={selectedGate}
                  onChange={(e) => {
                    setSelectedGate(e.target.value);
                    setCustomGateInput("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2.5 text-xs text-white focus:border-[#e23744] focus:outline-none"
                >
                  {GATE_PRESETS.map((gate) => (
                    <option key={gate} value={gate}>
                      {gate}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-2xs text-slate-400 mb-1">Or Type Custom Gate Name</label>
                  <input
                    type="text"
                    placeholder="e.g. West Balcony Gate 4"
                    value={customGateInput}
                    onChange={(e) => setCustomGateInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-[#e23744] focus:outline-none"
                  />
                </div>

                {volunteerCount === 1 && (
                  <div>
                    <label className="block text-2xs text-slate-400 mb-1">Custom 6-Digit PIN (Optional)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Auto-generated if empty"
                      value={customPinInput}
                      onChange={(e) => setCustomPinInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white font-mono placeholder:text-slate-600 tracking-wider focus:border-[#e23744] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: Gate Separation & Tier Restriction */}
              <div className="space-y-3">
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 font-mono">
                  3. Tier Access Policy (Gate Separation)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTierRestrictionMode("ALL")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      tierRestrictionMode === "ALL"
                        ? "bg-[#e23744] border-[#e23744] text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    All Passes Allowed
                  </button>
                  <button
                    type="button"
                    onClick={() => setTierRestrictionMode("RESTRICTED")}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      tierRestrictionMode === "RESTRICTED"
                        ? "bg-amber-600 border-amber-400 text-white"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    Restricted Passes
                  </button>
                </div>

                {tierRestrictionMode === "RESTRICTED" ? (
                  <div className="p-3 rounded-xl bg-[#060608] border border-amber-500/30 space-y-2">
                    <span className="text-[10px] font-bold text-amber-300 block uppercase font-mono">
                      Select Allowed Tiers for this Gate:
                    </span>
                    {event.ticketTiers && event.ticketTiers.length > 0 ? (
                      event.ticketTiers.map((tier) => {
                        const isChecked = selectedTierNames.includes(tier.name);
                        return (
                          <label
                            key={tier.id || tier.name}
                            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTierNames([...selectedTierNames, tier.name]);
                                } else {
                                  setSelectedTierNames(selectedTierNames.filter((t) => t !== tier.name));
                                }
                              }}
                              className="rounded text-[#e23744] focus:ring-0 bg-[#14141b] border-white/20"
                            />
                            <span>{tier.name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <span className="text-2xs text-slate-400">General Passes only</span>
                    )}
                    <p className="text-[10px] text-amber-200/80 leading-tight">
                      Attendees holding other pass types will be denied at this gate and directed to standard gates.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This scanner will accept all valid ticket tiers for this event (VIP, General, Early Bird, etc.).
                  </p>
                )}

                <div>
                  <label className="block text-2xs text-slate-400 mb-1">PIN Expiration</label>
                  <select
                    value={pinExpiryOption}
                    onChange={(e) => setPinExpiryOption(e.target.value as "event_end" | "24h" | "none")}
                    className="w-full rounded-xl border border-white/10 bg-[#060608] px-3 py-2 text-xs text-white focus:border-[#e23744] focus:outline-none"
                  >
                    <option value="event_end">Auto-expire 6 hrs after event ends</option>
                    <option value="24h">Expires in 24 hours</option>
                    <option value="none">Never expires (Until manually revoked)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/40 transition active:scale-95 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Generating PINs...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Generate {volunteerCount} Staff PIN{volunteerCount > 1 ? "s" : ""}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
