import React from "react";
import { StaffScannerDTO, GateOverviewStatsDTO } from "../../types";
import { DoorOpen } from "lucide-react";

interface AnalyticsTabProps {
  scanners: StaffScannerDTO[];
  gateStats: GateOverviewStatsDTO | null;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  scanners,
  gateStats,
}) => {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Total Admitted</span>
          <p className="text-2xl font-display font-black text-white mt-1">
            {gateStats?.totalAdmittedCount || 0}
          </p>
          <span className="text-2xs text-emerald-400 font-semibold">
            {gateStats?.overallAdmittanceRate || 0}% of tickets checked in
          </span>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Pending Entrance</span>
          <p className="text-2xl font-display font-black text-white mt-1">
            {gateStats?.pendingCount || 0}
          </p>
          <span className="text-2xs text-slate-400">Expected attendees remaining</span>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Active Gates</span>
          <p className="text-2xl font-display font-black text-white mt-1">
            {gateStats?.gates.length || 0}
          </p>
          <span className="text-2xs text-[#ff2a54] font-semibold">Configured entrance points</span>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Active Volunteers</span>
          <p className="text-2xl font-display font-black text-white mt-1">
            {scanners.filter((s) => s.isActive).length}
          </p>
          <span className="text-2xs text-emerald-400 font-semibold">Live scanners ready</span>
        </div>
      </div>

      {/* Gates Cards Breakdown */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-white">Live Admittance by Entrance Gate</h4>

        {gateStats && gateStats.gates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gateStats.gates.map((gate) => {
              const isVIP = gate.gateName.toLowerCase().includes("vip");
              const percent =
                gateStats.totalAdmittedCount > 0
                  ? Math.round((gate.scansCount / gateStats.totalAdmittedCount) * 100)
                  : 0;

              return (
                <div
                  key={gate.gateName}
                  className="p-5 rounded-2xl border border-white/10 bg-[#14141b] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isVIP ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-[#e23744]/20 text-[#ff2a54] border border-[#e23744]/30"
                        }`}
                      >
                        <DoorOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{gate.gateName}</span>
                          {isVIP && (
                            <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                              VIP
                            </span>
                          )}
                        </h5>
                        <span className="text-2xs text-slate-400">
                          {gate.activeScannersCount} active scanner{gate.activeScannersCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-display font-black text-white font-mono">
                        {gate.scansCount}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {percent}% of entries
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isVIP ? "bg-gradient-to-r from-amber-500 to-yellow-400" : "bg-gradient-to-r from-[#e23744] to-[#ff2a54]"
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  {/* Staff assigned */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Volunteers Assigned:</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {gate.staffMembers.map((sm) => (
                        <span
                          key={sm.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-2xs text-slate-300"
                        >
                          <span>{sm.staffName}</span>
                          <span className="font-mono text-emerald-400 font-bold">({sm.scansCount})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5 text-center text-xs text-slate-400">
            No gate entries recorded yet. Traffic data will update live as volunteers scan tickets.
          </div>
        )}
      </div>
    </div>
  );
};
