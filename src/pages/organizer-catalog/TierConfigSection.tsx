import React from "react";
import { TierDraft } from "./useEventForm";
import {
  Plus,
  Trash2
} from "lucide-react";
import { formatRupees } from "../../lib/formatters";

interface TierConfigSectionProps {
  tierName: string;
  setTierName: (v: string) => void;
  tierPrice: string;
  setTierPrice: (v: string) => void;
  tierCapacity: string;
  setTierCapacity: (v: string) => void;
  tierDescription: string;
  setTierDescription: (v: string) => void;
  tiers: TierDraft[];
  handleAddTier: (e: React.FormEvent) => void;
  handleRemoveTier: (idx: number) => void;
}

export const TierConfigSection: React.FC<TierConfigSectionProps> = ({
  tierName,
  setTierName,
  tierPrice,
  setTierPrice,
  tierCapacity,
  setTierCapacity,
  tierDescription,
  setTierDescription,
  tiers,
  handleAddTier,
  handleRemoveTier,
}) => {
  return (
                <div className="border-t border-white/[0.08] pt-5">
                  <h3 className="text-xs font-display font-black text-white uppercase tracking-wider mb-3">
                    Config Ticket Pricing Tiers
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-3 bg-[#14141b]/60 p-4 rounded-2xl border border-white/[0.08]">
                    <div className="md:col-span-2 text-left">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                        Tier Title
                      </label>
                      <input
                        type="text"
                        placeholder="General Entrance"
                        value={tierName}
                        onChange={(e) => setTierName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-3.5 py-2.5 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                        Price (₹)
                      </label>
                      <input
                        type="text"
                        placeholder="35.00"
                        value={tierPrice}
                        onChange={(e) => setTierPrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-3.5 py-2.5 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                        Capacity
                      </label>
                      <input
                        type="number"
                        placeholder="100"
                        value={tierCapacity}
                        onChange={(e) => setTierCapacity(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-3.5 py-2.5 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-4 text-left">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Tier Description / Exclusive Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Includes fast-track gate entry, complementary soft drinks, VIP front-row seating"
                      value={tierDescription}
                      onChange={(e) => setTierDescription(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="rounded-xl border border-[#e23744]/30 bg-[#e23744]/10 px-4 py-3 text-xs font-black uppercase tracking-wider text-rose-200 hover:bg-[#e23744]/20 transition flex items-center gap-1.5 cursor-pointer mb-5"
                  >
                    <Plus className="h-4 w-4 text-[#e23744]" />
                    <span>Insert Level Ticket Tier</span>
                  </button>

                  {/* Display active tiers levels */}
                  {tiers.length > 0 && (
                    <div className="mt-4 space-y-2 text-left">
                      {tiers.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs py-3 px-4 bg-[#14141b] border border-white/[0.08] rounded-xl">
                          <div className="space-y-1">
                            <span className="font-extrabold text-white">
                              {t.name} (Cap {t.capacity}) — {formatRupees(t.price)}
                            </span>
                            {t.description && (
                              <span className="block text-[10px] text-zinc-400 font-medium leading-relaxed">
                                {t.description}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(idx)}
                            className="text-rose-400 hover:text-rose-300 font-bold focus:outline-none self-center p-1 hover:bg-white/5 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
  );
};
