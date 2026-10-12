import React from "react";
import { BookingDTO } from "../../types";
import { formatDateIST } from "../../lib/formatters";
import {
  Calendar,
  ClipboardList,
  Info,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import { BookingFilter, isEventPastOrCheckedIn } from "./helpers";

interface BookingListProps {
  bookings: BookingDTO[];
  filteredBookings: BookingDTO[];
  selectedBooking: BookingDTO | null;
  bookingFilter: BookingFilter;
  setBookingFilter: (f: BookingFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  upcomingCount: number;
  pastCount: number;
  cancelledCount: number;
  onSelect: (b: BookingDTO) => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  filteredBookings,
  selectedBooking,
  bookingFilter,
  setBookingFilter,
  searchQuery,
  setSearchQuery,
  upcomingCount,
  pastCount,
  cancelledCount,
  onSelect,
}) => {
  return (
      <div className="md:col-span-5 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-black text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#ff2a54]" />
              <span>My Passes</span>
            </h2>
            <span className="text-xs font-mono text-zinc-400">{filteredBookings.length} shown</span>
          </div>
    
          {/* Dropdown Filter for Bookings */}
          <div className="space-y-2">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-[#ff2a54] pointer-events-none" />
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value as BookingFilter)}
                className="w-full rounded-2xl border border-white/[0.08] bg-[#14141b] text-xs font-bold text-white pl-9 pr-8 py-2.5 focus:border-[#e23744] focus:outline-none cursor-pointer appearance-none shadow-sm"
              >
                <option value="upcoming">Upcoming & Active Passes ({upcomingCount})</option>
                <option value="past">Past & Checked-In Events ({pastCount})</option>
                <option value="cancelled">Cancelled & Transferred ({cancelledCount})</option>
                <option value="all">All Bookings ({bookings.length})</option>
              </select>
              <div className="absolute right-3 top-3 pointer-events-none text-zinc-400 text-xs">▼</div>
            </div>
    
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by event or invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#14141b] text-xs text-white pl-8 pr-3 py-2 placeholder:text-zinc-600 focus:outline-none focus:border-[#e23744]"
              />
            </div>
          </div>
        </div>
    
        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-zinc-400 bg-white/[0.01]">
              <Info className="h-6 w-6 text-zinc-500 mx-auto mb-2" />
              No {bookingFilter === "upcoming" ? "upcoming active" : bookingFilter === "past" ? "past checked-in" : ""} passes found in this category.
            </div>
          ) : (
            filteredBookings.map((b) => {
              const totalQty = b.items.reduce((acc, i) => acc + i.quantity, 0);
              const isPastOrScanned = isEventPastOrCheckedIn(b);
    
              return (
                <button
                  key={b.id}
                  onClick={() => onSelect(b)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all focus:outline-none focus:ring-0 cursor-pointer ${
                    selectedBooking?.id === b.id
                      ? "border-[#e23744] bg-[#e23744]/10 shadow-lg shadow-[#e23744]/20"
                      : "border-white/[0.06] bg-[#0c0c11] hover:border-white/[0.12] hover:bg-[#111116]"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                          b.scannedAt
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : b.status === "CONFIRMED"
                            ? "bg-[#e23744]/15 text-[#ff2a54] border-[#e23744]/25"
                            : b.status === "CANCELLED"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        {b.scannedAt ? "Checked In" : b.status}
                      </span>
                      {isPastOrScanned && !b.scannedAt && (
                        <span className="rounded px-1 py-0.5 text-[8px] font-bold uppercase text-slate-400 bg-white/5 border border-white/10">
                          Past
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      {b.invoiceNumber}
                    </span>
                  </div>
    
                  <h3 className="mt-2.5 text-sm font-bold text-white line-clamp-1 font-display">
                    {b.eventTitle}
                  </h3>
    
                  {b.verifiedCollegeEmail && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      <span className="truncate">{b.verifiedCollegeEmail}</span>
                    </div>
                  )}
    
                  <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {b.eventStartsAt
                          ? formatDateIST(b.eventStartsAt, { month: "short", day: "numeric" })
                          : formatDateIST(b.createdAt, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <span>{totalQty} ticket(s)</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
  );
};
