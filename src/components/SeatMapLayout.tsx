import React, { useState, useEffect } from "react";
import { TicketTierDTO } from "../types";
import { Clock, Info, ShieldAlert } from "lucide-react";

interface SeatMapLayoutProps {
  rows: number;
  cols: number;
  ticketTiers: TicketTierDTO[];
  occupiedSeats: string[];
  selectedSeats: string[];
  onSeatSelect: (seatId: string, price: number, tierId: string) => void;
  maxSelection?: number;
}

export const SeatMapLayout: React.FC<SeatMapLayoutProps> = ({
  rows = 10,
  cols = 10,
  ticketTiers,
  occupiedSeats = [],
  selectedSeats = [],
  onSeatSelect,
  maxSelection = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes hold
  const [hoveredSeat, setHoveredSeat] = useState<{ id: string; tierName: string; price: number } | null>(null);

  // Sorting tiers to map rows dynamically: High-tier rows at the front, Standard at the back
  const sortedTiers = [...ticketTiers].sort((a, b) => b.price - a.price);

  const getTierForAbsoluteRow = (rowIndex: number): TicketTierDTO => {
    if (sortedTiers.length === 0) {
      return { id: "default", name: "Standard", price: 2000, capacity: 100, sold: 0, reserved: 0, eventId: "", description: "" };
    }
    if (sortedTiers.length === 1) return sortedTiers[0];
    if (sortedTiers.length === 2) {
      if (rowIndex < Math.ceil(rows * 0.3)) return sortedTiers[0]; // Top 30% are VIP
      return sortedTiers[1];
    }
    // 3 or more tiers
    const vipCutoff = Math.max(1, Math.ceil(rows * 0.2));
    const premiumCutoff = Math.max(2, Math.ceil(rows * 0.5));
    if (rowIndex < vipCutoff) return sortedTiers[0]; // VIP
    if (rowIndex < premiumCutoff) return sortedTiers[1]; // Premium
    return sortedTiers[sortedTiers.length - 1]; // Standard/Executive
  };

  const getRowLabel = (index: number) => {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  };

  // Timer countdown logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // SVG grid sizing parameters
  const seatWidth = 32;
  const seatHeight = 32;
  const seatGap = 10;
  const rowLabelWidth = 35;
  const paddingX = 20;
  const paddingY = 40;

  const totalWidth = rowLabelWidth * 2 + cols * seatWidth + (cols - 1) * seatGap + paddingX * 2;
  const totalHeight = rows * seatHeight + (rows - 1) * seatGap + paddingY * 2;

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141b] border border-white/10 rounded-2xl p-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Info className="h-4 w-4 text-[#ff2a54]" />
            <span>Interactive Vector Seating Chart</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-1">
            Choose exact seats on the live map below. Selected seats will be held securely for 10 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[#e23744]/15 border border-[#e23744]/30 px-3.5 py-1 text-xs font-bold text-[#ff2a54] select-none shrink-0 self-start sm:self-center">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>Seat Lock Hold Time: {formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* SVG Canvas Seating Map Container */}
      <div className="relative border border-white/10 rounded-2xl bg-[#060608] shadow-inner overflow-hidden flex flex-col items-center justify-center p-6 min-h-[400px]">
        {/* Stage graphic at top */}
        <div className="w-full text-center mb-8 max-w-md">
          <div className="relative h-5 w-full bg-[#14141b] border border-white/10 rounded-b-xl shadow-lg flex items-center justify-center">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 select-none">
              STAGE DIRECTION / SCREEN
            </span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#e23744] shadow-[0_0_8px_#e23744]"></div>
          </div>
        </div>

        {/* Hovered Seat Overlay Tooltip */}
        <div className="h-6 mb-4 text-center">
          {hoveredSeat ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14141b] border border-white/10 px-3 py-1 text-[11px] font-bold text-white">
              Seat <strong className="text-[#ff2a54] font-black">{hoveredSeat.id}</strong> ({hoveredSeat.tierName} • {formatPrice(hoveredSeat.price)})
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider select-none">
              Hover over a seat to view details
            </span>
          )}
        </div>

        {/* Responsive SVG */}
        <div className="w-full overflow-auto max-h-[600px] flex justify-center">
          <svg
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            className="max-w-full select-none"
          >
            {/* Draw Rows */}
            {Array.from({ length: rows }).map((_, rIdx) => {
              const rowLabel = getRowLabel(rIdx);
              const tier = getTierForAbsoluteRow(rIdx);
              const y = paddingY + rIdx * (seatHeight + seatGap);

              // Row labels left and right
              return (
                <g key={rowLabel}>
                  <text
                    x={paddingX + rowLabelWidth / 2}
                    y={y + seatHeight / 2 + 4}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-slate-500 uppercase font-sans"
                  >
                    {rowLabel}
                  </text>

                  {/* Seats in this row */}
                  {Array.from({ length: cols }).map((_, cIdx) => {
                    const colNum = cIdx + 1;
                    const seatId = `${rowLabel}-${colNum}`;
                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    const x = paddingX + rowLabelWidth + cIdx * (seatWidth + seatGap);

                    // Colors based on tier & status
                    let fill = "#1e1e28"; // Standard Seat Dark
                    let stroke = "#323242";
                    let textFill = "#ffffff";

                    if (tier.name.toUpperCase().includes("VIP")) {
                      fill = "#d97706"; // Amber Gold
                      stroke = "#b45309";
                    } else if (tier.name.toUpperCase().includes("PREMIUM")) {
                      fill = "#e23744"; // District Crimson
                      stroke = "#c81e30";
                    }

                    if (isOccupied) {
                      fill = "#14141b"; // Inactive Dark
                      stroke = "#22222c";
                      textFill = "#475569";
                    } else if (isSelected) {
                      fill = "#10b981"; // Emerald Green
                      stroke = "#047857";
                      textFill = "#ffffff";
                    }

                    return (
                      <g
                        key={seatId}
                        className={`transition-all duration-150 ${isOccupied ? "cursor-not-allowed" : "cursor-pointer"}`}
                        onClick={() => {
                          if (!isOccupied) {
                            if (!isSelected && selectedSeats.length >= maxSelection) {
                              return;
                            }
                            onSeatSelect(seatId, tier.price, tier.id);
                          }
                        }}
                        onMouseEnter={() => {
                          if (!isOccupied) {
                            setHoveredSeat({
                              id: seatId,
                              tierName: tier.name,
                              price: tier.price,
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredSeat(null)}
                      >
                        {/* Seat Base rectangle */}
                        <rect
                          x={x}
                          y={y}
                          width={seatWidth}
                          height={seatHeight - 6}
                          rx={6}
                          ry={6}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={1.5}
                          className="transition-colors duration-150"
                        />
                        {/* Cushion seat accent */}
                        <rect
                          x={x + 3}
                          y={y + seatHeight - 12}
                          width={seatWidth - 6}
                          height={8}
                          rx={2}
                          ry={2}
                          fill={isSelected ? "#047857" : isOccupied ? "#22222c" : stroke}
                          opacity={0.8}
                        />
                        {/* Seat Inner Text/Num */}
                        <text
                          x={x + seatWidth / 2}
                          y={y + 16}
                          textAnchor="middle"
                          fill={textFill}
                          className="text-[9px] font-black pointer-events-none"
                        >
                          {colNum}
                        </text>
                      </g>
                    );
                  })}

                  {/* Row Label Right */}
                  <text
                    x={totalWidth - paddingX - rowLabelWidth / 2}
                    y={y + seatHeight / 2 + 4}
                    textAnchor="middle"
                    className="text-[11px] font-extrabold fill-slate-500 uppercase font-sans"
                  >
                    {rowLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Grid Selection Limit Warning */}
      {selectedSeats.length >= maxSelection && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 text-xs text-amber-300 font-semibold leading-normal">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>You have reached the maximum seat limit allocation of {maxSelection} per reservation.</span>
        </div>
      )}
    </div>
  );
};
