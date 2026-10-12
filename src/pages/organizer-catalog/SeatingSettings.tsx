import React from "react";
import { motion } from "motion/react";

interface SeatingSettingsProps {
  hasSeatingPlan: boolean;
  setHasSeatingPlan: (v: boolean) => void;
  seatingRows: number;
  setSeatingRows: (v: number) => void;
  seatingCols: number;
  setSeatingCols: (v: number) => void;
}

export const SeatingSettings: React.FC<SeatingSettingsProps> = ({
  hasSeatingPlan,
  setHasSeatingPlan,
  seatingRows,
  setSeatingRows,
  seatingCols,
  setSeatingCols,
}) => {
  return (
                <div className="bg-[#0c0c11] rounded-2xl p-5 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                        Interactive Venue Seating
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-sans">
                        Allow ticket buyers to choose specific auditorium seating layout maps.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasSeatingPlan}
                        onChange={(e) => setHasSeatingPlan(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#e23744] peer-checked:after:bg-white"></div>
                    </label>
                  </div>

                  {hasSeatingPlan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="grid grid-cols-2 gap-4 mt-5 pt-3 border-t border-white/[0.08]"
                    >
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                          Auditorium Rows (1-20)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={seatingRows}
                          onChange={(e) => setSeatingRows(parseInt(e.target.value, 10) || 10)}
                          className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-2.5 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                          Auditorium Columns (1-20)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={seatingCols}
                          onChange={(e) => setSeatingCols(parseInt(e.target.value, 10) || 10)}
                          className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-2.5 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
  );
};
