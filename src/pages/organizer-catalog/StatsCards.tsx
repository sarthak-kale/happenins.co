import React from "react";
import { OrganizerAnalytics } from "../../types";
import {
  Calendar,
  DollarSign,
  Ticket,
  Megaphone
} from "lucide-react";
import { formatRupees } from "../../lib/formatters";

interface StatsCardsProps {
  analytics: OrganizerAnalytics;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Stat card 1 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-5 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
              Aggregate Revenue
            </span>
            <span className="block text-lg font-black text-white mt-1 font-display">
              {formatRupees(analytics.totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Stat card 2 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-5 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e23744]/15 text-[#ff2a54] shrink-0 border border-[#e23744]/25">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
              Passes Sold
            </span>
            <span className="block text-lg font-black text-white mt-1 font-display">
              {analytics.ticketsSoldCount} <span className="text-xs text-zinc-400 font-medium">units</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stat card 3 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-5 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shrink-0 border border-amber-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
              Total Events
            </span>
            <span className="block text-lg font-black text-white mt-1 font-display">
              {analytics.totalEventsCount} <span className="text-xs text-zinc-400 font-medium">listed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stat card 4 */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-5 shadow-xl relative overflow-hidden group">
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/20">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
              Active Catalog
            </span>
            <span className="block text-lg font-black text-white mt-1 font-display">
              {analytics.activeEventsCount} <span className="text-xs text-zinc-400 font-medium">published</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
