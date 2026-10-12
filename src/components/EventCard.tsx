import React, { useRef, useState, useCallback } from "react";
import { EventDTO } from "../types";
import { Calendar, MapPin, ArrowRight, Building, Zap } from "lucide-react";
import { formatRupees, formatDateIST } from "../lib/formatters";

interface EventCardProps {
  event: EventDTO;
  onSelect: (event: EventDTO) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5; // -0.5 to 0.5
    const yPct = mouseY / height - 0.5; // -0.5 to 0.5

    // Subtle, high-end 3D tilt (max ~10 degrees)
    setRotateX(-yPct * 10);
    setRotateY(xPct * 10);

    // Specular light position in percentage
    setSheenPos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  }, []);

  const lowestPrice = event.ticketTiers.reduce((min, tier) => {
    return tier.price < min ? tier.price : min;
  }, event.ticketTiers[0]?.price || 0);

  const formattedDate = formatDateIST(event.startsAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Calculate capacity and demand
  const totalCapacity = event.ticketTiers.reduce((acc, t) => acc + t.capacity, 0);
  const totalSold = event.ticketTiers.reduce((acc, t) => acc + t.sold, 0);
  const totalReserved = event.ticketTiers.reduce((acc, t) => acc + t.reserved, 0);
  const totalAvailable = totalCapacity - (totalSold + totalReserved);

  const isSoldOut = totalAvailable <= 0;
  const isFastFilling = !isSoldOut && totalCapacity > 0 && totalAvailable / totalCapacity <= 0.35;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(event)}
      style={{
        transform: isHovered
          ? `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale3d(1.015, 1.015, 1.015)`
          : "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)",
        transition: isHovered
          ? "transform 0.1s cubic-bezier(0.2, 0, 0.3, 1), box-shadow 0.25s ease"
          : "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.45s ease",
        transformStyle: "preserve-3d",
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d12] hover:border-white/20 shadow-xl hover:shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(226,55,68,0.18)] transition-all cursor-pointer select-none"
    >
      {/* Dynamic Specular Light Glare Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle 300px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.12), transparent 70%)`,
          mixBlendMode: "overlay",
        }}
      />

      {/* Dynamic Cursor-Tracking Ambient Rim Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-2xl"
        style={{
          opacity: isHovered ? 0.7 : 0,
          background: `radial-gradient(circle 220px at ${sheenPos.x}% ${sheenPos.y}%, rgba(226, 55, 68, 0.25), transparent 75%)`,
        }}
      />

      {/* Event banner cover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <img
          src={event.bannerUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"}
          alt={event.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80") {
              target.src = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80";
            }
          }}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient dark vignette at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-black/30 pointer-events-none" />

        {/* Floating Category & Restriction tags */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 items-center z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-200 border border-white/10 shadow-sm">
            {event.category}
          </span>
          {event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-0.5 text-[9px] font-black uppercase text-black border border-amber-300/30 shadow-sm backdrop-blur-md">
              <Building className="h-3 w-3" />
              Restricted
            </span>
          )}
        </div>

        {/* Status indicator: Sold out or Fast filling or units left */}
        <div className="absolute right-3 top-3 z-10">
          {isSoldOut ? (
            <span className="inline-flex items-center rounded-md bg-[#e23744] px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md">
              Sold Out
            </span>
          ) : isFastFilling ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
              <Zap className="h-3 w-3 fill-black" />
              Filling Fast
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-white/10">
              {totalAvailable} Passes Left
            </span>
          )}
        </div>
      </div>

      {/* Main card details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-1 flex-col">
          {/* Scheduling date kicker */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#ff2a54] uppercase tracking-wide">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="mt-2 text-base font-display font-extrabold text-white line-clamp-1 group-hover:text-zinc-200 transition-colors">
            {event.title}
          </h3>

          <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Starting Price dock */}
        <div className="mt-4 border-t border-white/[0.06] pt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span className="truncate max-w-[130px] font-medium text-zinc-300">
              {event.city || event.venue || "Live Venue"}
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Starts At
            </span>
            <span className="text-sm font-extrabold text-white">
              {formatRupees(lowestPrice)}
            </span>
          </div>
        </div>

        {/* District Action CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(event);
          }}
          className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/[0.05] group-hover:bg-[#e23744] py-2.5 text-xs font-bold text-zinc-200 group-hover:text-white transition-all duration-250 border border-white/[0.08] group-hover:border-[#e23744] cursor-pointer"
        >
          <span>{isSoldOut ? "View Details" : "Book Tickets"}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
