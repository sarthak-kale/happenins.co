import React from "react";
import { EventDTO } from "../../types";
import { formatRupees } from "../../lib/formatters";
import { useFeatures } from "../../context/FeaturesContext";
import { Calendar, Sparkles, Loader2, Users, Lock, Plus, Minus } from "lucide-react";

interface TicketPanelProps {
  event: EventDTO;
  formattedDate: string;
  quantities: { [tierId: string]: number };
  handleQuantityChange: (tierId: string, delta: number, maxAvailable: number) => void;
  selectedCount: number;
  subtotal: number;
  mainShare: number;
  friendShare: number;
  isSplitBooking: boolean;
  setIsSplitBooking: (v: boolean) => void;
  friends: Array<{ name: string; email: string }>;
  friendName: string;
  setFriendName: (v: string) => void;
  friendEmail: string;
  setFriendEmail: (v: string) => void;
  handleAddFriend: (e: React.FormEvent) => void;
  handleRemoveFriend: (email: string) => void;
  handleBookNow: () => void;
  bookingLoading: boolean;
  institutionOtpVerified: boolean;
}

export const TicketPanel: React.FC<TicketPanelProps> = ({
  event,
  formattedDate,
  quantities,
  handleQuantityChange,
  selectedCount,
  subtotal,
  mainShare,
  friendShare,
  isSplitBooking,
  setIsSplitBooking,
  friends,
  friendName,
  setFriendName,
  friendEmail,
  setFriendEmail,
  handleAddFriend,
  handleRemoveFriend,
  handleBookNow,
  bookingLoading,
  institutionOtpVerified,
}) => {
  const { isEnabled } = useFeatures();
  const formatPrice = (cents: number) => {
    return formatRupees(cents);
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl relative">
      <h2 className="text-md font-display font-black text-white mb-4 flex items-center gap-2">
        <Sparkles className="h-4.5 w-4.5 text-[#ff2a54]" />
        <span>Select Passes</span>
      </h2>

      {/* Date Details card */}
      <div className="mb-6 rounded-2xl bg-white/[0.02] p-4 text-zinc-300 text-xs font-medium flex items-start gap-2.5 border border-white/[0.06]">
        <Calendar className="h-4 w-4 text-[#ff2a54] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-white font-display">Schedule Details</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{formattedDate}</p>
        </div>
      </div>

      {/* Tiers list row */}
      <div className="space-y-3.5">
        {event.ticketTiers.map((tier) => {
          const maxAvailable = tier.capacity - (tier.sold + tier.reserved);
          const isTierSoldOut = maxAvailable <= 0;
          const quantity = quantities[tier.id] || 0;

          return (
            <div
              key={tier.id}
              className={`rounded-2xl border p-4 transition-all duration-300 ${
                quantity > 0
                  ? "border-[#e23744]/40 bg-[#e23744]/10 shadow-lg"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-white text-xs leading-tight">{tier.name}</p>
                  {tier.description && (
                    <p className="mt-1 text-zinc-400 text-[10px] leading-tight line-clamp-2">
                      {tier.description}
                    </p>
                  )}
                  <span className="mt-2.5 inline-block text-xs font-extrabold text-[#ff2a54] bg-[#e23744]/15 border border-[#e23744]/25 px-2.5 py-0.5 rounded-lg">
                    {formatPrice(tier.price)}
                  </span>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 shrink-0">
                  {isTierSoldOut ? (
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold text-rose-400 uppercase border border-rose-500/20">
                      Sold Out
                    </span>
                  ) : event.hasSeatingPlan ? (
                    <span className="rounded-lg bg-[#e23744]/15 px-2.5 py-1 text-[10px] font-extrabold text-[#ff2a54] border border-[#e23744]/25">
                      {quantity} Selected
                    </span>
                  ) : (
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] shadow-sm overflow-hidden select-none">
                      <button
                        onClick={() => handleQuantityChange(tier.id, -1, maxAvailable)}
                        className="px-2.5 py-1.5 hover:bg-white/[0.08] text-zinc-400 hover:text-white transition active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(tier.id, 1, maxAvailable)}
                        className="px-2.5 py-1.5 hover:bg-white/[0.08] text-zinc-400 hover:text-white transition active:scale-95 focus:outline-none cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Calculations */}
      <div className="mt-6 border-t border-white/[0.06] pt-5 space-y-4">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
          <span>Selected Passes</span>
          <span className="text-white">{selectedCount} Passes</span>
        </div>

        {/* GROUP RESERVATIONS SPLIT BOOKING TOGGLE */}
        {selectedCount > 0 && isEnabled("SPLIT_BOOKING") && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-display font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5 select-none cursor-pointer">
                <Users className="h-4 w-4 text-[#ff2a54]" />
                <span>Split Payment with Friends</span>
              </label>
              <input
                type="checkbox"
                id="checkbox-split-pay"
                checked={isSplitBooking}
                onChange={(e) => setIsSplitBooking(e.target.checked)}
                className="rounded border-white/10 text-[#e23744] bg-white/[0.04] focus:ring-[#e23744] h-4 w-4 cursor-pointer accent-[#e23744]"
              />
            </div>

            {isSplitBooking && (
              <div className="space-y-3.5 pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  Share a dynamic payment checkout link with friends. Friends have until the reservation lock expires to pay for their ticket shares.
                </p>

                {/* Add friends list */}
                <div className="space-y-1.5">
                  {friends.map((friend) => (
                    <div
                      key={friend.email}
                      className="flex items-center justify-between gap-2 bg-white/[0.03] rounded-xl border border-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-zinc-300"
                    >
                      <span className="truncate">{friend.name} ({friend.email})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFriend(friend.email)}
                        className="text-rose-400 hover:text-rose-350 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Friend invite input subform */}
                <form onSubmit={handleAddFriend} className="flex flex-col gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Friend's Full Name"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full bg-[#14141b] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744]"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      required
                      placeholder="Friend's Email Address"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="flex-1 bg-[#14141b] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744]"
                    />
                    <button
                      type="submit"
                      className="district-btn-primary text-white font-bold text-[11px] px-3.5 py-2 rounded-xl cursor-pointer active:scale-95 transition"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Split cost breakdown preview */}
                <div className="bg-[#e23744]/10 rounded-xl p-3 border border-[#e23744]/20 text-[11px] font-bold text-[#ff2a54] space-y-1">
                  <div className="flex justify-between">
                    <span>Your Share:</span>
                    <span>{formatPrice(mainShare)}</span>
                  </div>
                  <div className="flex justify-between font-normal text-zinc-400">
                    <span>Friends Shares ({friends.length}):</span>
                    <span>
                      {friends.length > 0
                        ? `${friends.length} x ${formatPrice(friendShare)}`
                        : formatRupees(0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-baseline justify-between pt-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Total Price</span>
          <span className="text-xl font-display font-black text-white">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Checkout validation lock buttons */}
        <button
          onClick={handleBookNow}
          id="btn-checkout-proceed"
          disabled={bookingLoading || selectedCount === 0}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
            isEnabled("INSTITUTION_ACCESS") && event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC" && !institutionOtpVerified
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40"
              : "district-btn-primary"
          }`}
        >
          {bookingLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : isEnabled("INSTITUTION_ACCESS") && event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC" && !institutionOtpVerified ? (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Verify College Email OTP to Continue</span>
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" />
              <span>Proceed to Secure Checkout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
