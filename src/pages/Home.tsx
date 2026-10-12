import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  ArrowRight,
  Ticket,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Music,
  Tv,
  Cpu,
  Activity,
  Tag,
  ShieldCheck,
  Lock,
  Building2,
  Clock,
  Mail,
  Info,
  X
} from "lucide-react";

import { EventDTO } from "../types";
import { api } from "../lib/api";
import { EventCard } from "../components/EventCard";
import { formatDateIST } from "../lib/formatters";

interface HomeProps {
  onSelectEvent: (event: EventDTO) => void;
}

interface VenturePublicPreviewData {
  id?: string;
  title: string;
  description?: string;
  masterBannerUrl?: string | null;
  bannerUrl?: string | null;
  subEvents: Array<{
    id?: string;
    roundNumber: number;
    title: string;
    bannerUrl?: string | null;
    scheduledTime?: string | null;
    status?: string;
    description?: string;
    startsAt?: string;
  }>;
  delegationInfo?: {
    totalTeams: number;
    delegatesPerTeam: number;
    totalDelegates: number;
    isRestricted: boolean;
    supportEmail: string;
  };
  supportEmail?: string;
  guidelines?: {
    totalTeams: number;
    teamFormat: string;
    reportingVenue: string;
    supportEmail: string;
  };
}

export const Home: React.FC<HomeProps> = ({ onSelectEvent }) => {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [venturePreview, setVenturePreview] = useState<VenturePublicPreviewData | null>(null);
  const [showSummitModal, setShowSummitModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    { label: "All", icon: Flame },
    { label: "Concerts", icon: Music },
    { label: "Theater & Arts", icon: Tv },
    { label: "Festivals", icon: Sparkles },
    { label: "Tech Meetups", icon: Cpu },
    { label: "Fitness & Health", icon: Activity },
  ];

  const cities = [
    "All",
    "Nagpur",
    "Mumbai",
    "Bengaluru",
    "Delhi NCR",
    "Pune",
    "Metropolis",
    "Cityville",
    "San Francisco",
    "New York",
  ];

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getEvents({
        category: category === "All" ? undefined : category,
        city: city === "All" ? undefined : city,
        search: search || undefined,
      });

      // Strict filter: only events that have not passed
      const upcomingEvents = (data.events || []).filter((e) => {
        const endTime = new Date(e.endsAt).getTime();
        return !isNaN(endTime) ? endTime >= Date.now() : true;
      });

      setEvents(upcomingEvents);
    } catch {
      setError("Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [category, city]);

  useEffect(() => {
    api.getVenturePublicPreview()
      .then((data) => {
        if (data) setVenturePreview(data);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  // Featured spotlight events (top 4 upcoming)
  const spotlightEvents = events.slice(0, 4);

  // Unified spotlight slides: Venture Vault Summit as Slide 0 + top upcoming experiences
  const slides: Array<
    | { type: "venture"; data: VenturePublicPreviewData; id: string }
    | { type: "event"; data: EventDTO; id: string }
  > = [];

  if (venturePreview) {
    slides.push({
      type: "venture",
      data: venturePreview,
      id: "venture-vault-spotlight",
    });
  }

  spotlightEvents.forEach((ev) => {
    slides.push({
      type: "event",
      data: ev,
      id: ev.id,
    });
  });

  // Auto rotate banner every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlide];

  return (
    <div className="relative min-h-screen text-zinc-100 bg-[#060608] pb-24">

      {/* ================= DISTRICT FEATURED SPOTLIGHT CAROUSEL ================= */}
      <section className="relative z-10 px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="h-[360px] sm:h-[420px] rounded-3xl bg-[#0e0e14] border border-white/[0.06] flex items-center justify-center animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : slides.length > 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c11] shadow-2xl group">
            {/* Slide item */}
            <div className="relative h-[380px] sm:h-[440px] md:h-[480px] w-full overflow-hidden">
              <AnimatePresence mode="wait">
                {activeSlide && activeSlide.type === "venture" ? (
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={
                        activeSlide.data.masterBannerUrl ||
                        activeSlide.data.bannerUrl ||
                        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80"
                      }
                      alt={activeSlide.data.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Dark cinematic overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/90 via-[#060608]/40 to-transparent" />

                    {/* Spotlight content block */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 md:p-12 max-w-3xl text-left">
                      {/* Top Kickers */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#e23744] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-md">
                          <Flame className="h-3 w-3 fill-white" />
                          Featured University Summit
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-1 text-[10px] font-bold uppercase">
                          <Lock className="h-3 w-3 text-amber-400" />
                          50 Accredited Teams • Closed Delegation
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                          <MapPin className="h-3 w-3 text-zinc-400" />
                          Campus Grand Auditorium
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white line-clamp-2 drop-shadow-md">
                        {activeSlide.data.title}
                      </h1>

                      {/* Description */}
                      <p className="mt-2 text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">
                        {activeSlide.data.description || "Exclusive 3-Stage Elite Delegation Summit & Innovation Competition. Pass credentials released progressively per round."}
                      </p>

                      {/* CTA row */}
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => setShowSummitModal(true)}
                          className="district-btn-primary rounded-xl px-6 py-3 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                        >
                          <span>View Summit Briefing</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 font-mono">
                          <Calendar className="h-4 w-4 text-[#ff2a54]" />
                          <span className="font-semibold">
                            3 Progressive Stages
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : activeSlide && activeSlide.type === "event" ? (
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={
                        activeSlide.data.bannerUrl ||
                        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80"
                      }
                      alt={activeSlide.data.title}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Dark cinematic overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060608]/90 via-[#060608]/40 to-transparent" />

                    {/* Spotlight content block */}
                    <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 md:p-12 max-w-3xl">
                      {/* Top Kickers */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#e23744] text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-md">
                          <Flame className="h-3 w-3 fill-white" />
                          Featured Spotlight
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-zinc-300 uppercase">
                          <Tag className="h-3 w-3 text-zinc-400" />
                          {activeSlide.data.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[10px] font-bold text-zinc-300">
                          <MapPin className="h-3 w-3 text-zinc-400" />
                          {activeSlide.data.city || "Live Venue"}
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white line-clamp-2 drop-shadow-md">
                        {activeSlide.data.title}
                      </h1>

                      {/* Date & description */}
                      <p className="mt-2 text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">
                        {activeSlide.data.description}
                      </p>

                      {/* CTA & Pricing row */}
                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => onSelectEvent(activeSlide.data)}
                          className="district-btn-primary rounded-xl px-6 py-3 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                        >
                          <span>Book Experience</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-black/50 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                          <Calendar className="h-4 w-4 text-[#ff2a54]" />
                          <span className="font-semibold">
                            {formatDateIST(activeSlide.data.startsAt, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Slider Controls */}
              {slides.length > 1 && (
                <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                        currentSlide === idx ? "w-8 bg-[#e23744]" : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentSlide((prev) =>
                          prev === 0 ? slides.length - 1 : prev - 1
                        )
                      }
                      className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlide((prev) => (prev + 1) % slides.length)
                      }
                      className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-white hover:bg-white/20 transition cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* ================= FEATURED UNIVERSITY SUMMIT SHOWCASE (VENTURE VAULT) ================= */}
      {spotlightEvents.length > 0 && venturePreview && (
        <section className="relative z-20 px-4 sm:px-6 pt-6 max-w-7xl mx-auto">
          <div className="rounded-3xl border border-[#ff2a54]/30 bg-gradient-to-r from-[#0c0c11] via-[#151522] to-[#0c0c11] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e23744]/8 rounded-full blur-[140px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {venturePreview.masterBannerUrl && (
                  <div className="h-28 w-44 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0 shadow-lg group-hover:scale-[1.02] transition duration-300">
                    <img
                      src={venturePreview.masterBannerUrl}
                      alt={venturePreview.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff2a54] bg-[#e23744]/15 border border-[#e23744]/30 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-[#ff2a54]" />
                      Featured University Summit
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="h-3 w-3 text-amber-400" />
                      50 Accredited Teams • Closed Delegation
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white mt-2 tracking-tight">
                    {venturePreview.title}
                  </h2>
                  <p className="text-xs text-zinc-300 mt-1.5 max-w-2xl line-clamp-2 leading-relaxed">
                    {venturePreview.description || "Exclusive 3-Stage Elite Delegation Summit & Innovation Competition. Pre-registered university candidate passes are dispatched directly via email."}
                  </p>

                  {/* Sub-events timeline pills */}
                  <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                    {(venturePreview.subEvents || []).map((sub) => (
                      <span
                        key={sub.roundNumber}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff2a54]" />
                        <span className="font-bold text-white">R{sub.roundNumber}:</span>
                        <span>{sub.title.split(":")[1]?.trim() || sub.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSummitModal(true)}
                  className="district-btn-primary px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-[#e23744]/25 flex items-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <Info className="h-4 w-4" />
                  <span>View Summit Briefing</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= QUICK CATEGORY RAIL WITH FLOATING LAYOUTID PILL ================= */}
      <section className="relative z-20 px-4 sm:px-6 pt-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.label)}
                className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shrink-0 cursor-pointer transition-colors duration-200 outline-none select-none"
              >
                {isActive ? (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 rounded-xl bg-white shadow-lg shadow-white/10"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : (
                  <div className="absolute inset-0 rounded-xl bg-[#111116] border border-white/[0.08] hover:border-white/20 hover:bg-[#16161d] transition-colors" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 transition-colors duration-200 ${isActive ? "text-[#e23744]" : "text-zinc-400"}`} />
                  <span className={`transition-colors duration-200 ${isActive ? "text-black font-extrabold" : "text-zinc-300"}`}>{cat.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>


            {/* Submit CTA */}
            <button
              type="submit"
              className="district-btn-primary rounded-xl px-6 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

  
        {/* Loading state */}
        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#e23744]" />
              <p className="text-xs text-zinc-400 font-medium">Loading live experiences...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center">
            <h3 className="text-sm font-bold text-red-400">{error}</h3>
            <button
              onClick={loadEvents}
              className="mt-3 text-xs text-white underline cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : events.length === 0 && !(venturePreview && (category === "All" || category === "Tech Meetups") && (!search || venturePreview.title.toLowerCase().includes(search.toLowerCase()) || "venture vault".includes(search.toLowerCase()))) ? (
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-white/[0.05] flex items-center justify-center text-zinc-400 mb-4">
              <Ticket className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-white">
              No Events Found
            </h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
              We couldn't find any experiences matching "{search || category}" in {city}. Try selecting All Cities or a different category.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setCity("All");
                setSearch("");
              }}
              className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/10 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {/* Premier Venture Vault Summit Card */}
            {venturePreview && (category === "All" || category === "Tech Meetups") && (!search || venturePreview.title.toLowerCase().includes(search.toLowerCase()) || "venture vault".includes(search.toLowerCase())) && (
              <div
                onClick={() => setShowSummitModal(true)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d12] hover:border-[#ff2a54]/40 shadow-xl hover:shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(226,55,68,0.22)] transition-all cursor-pointer select-none"
              >
                {/* Poster / Banner image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={
                      venturePreview.masterBannerUrl ||
                      venturePreview.bannerUrl ||
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={venturePreview.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent" />

                  {/* Summit Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#e23744] text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-md">
                      <Flame className="h-3 w-3 fill-white" />
                      University Summit
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      <Lock className="h-2.5 w-2.5 text-amber-400" />
                      Closed Delegation
                    </span>
                  </div>

                  {/* Stage indicator pill */}
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono font-bold text-white border border-white/10">
                    3 Progressive Stages
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#ff2a54] uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>50 Accredited Teams</span>
                  </div>

                  <h3 className="mt-1 text-lg font-display font-black text-white group-hover:text-[#ff2a54] transition-colors line-clamp-1">
                    {venturePreview.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {venturePreview.description || "Exclusive 3-Stage Elite Delegation Summit & Innovation Competition. Pass credentials released progressively per round."}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Campus Grand Auditorium</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>View Briefing</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= SUMMIT BRIEFING & ACCREDITATION MODAL ================= */}
      <AnimatePresence>
        {showSummitModal && venturePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-3xl my-auto rounded-3xl border border-white/10 bg-[#0c0c12] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Banner / Header */}
              <div className="relative h-48 sm:h-64 w-full bg-gradient-to-br from-zinc-900 to-black shrink-0 overflow-hidden">
                {(venturePreview.masterBannerUrl || venturePreview.bannerUrl) ? (
                  <img
                    src={venturePreview.masterBannerUrl || venturePreview.bannerUrl}
                    alt={venturePreview.title}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#111118]">
                    <Sparkles className="h-16 w-16 text-zinc-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/60 to-transparent" />

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowSummitModal(false)}
                  className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white hover:bg-black/80 flex items-center justify-center transition cursor-pointer z-10"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Header Badges & Title */}
                <div className="absolute bottom-4 left-5 right-5">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#ff2a54] bg-[#e23744]/20 border border-[#e23744]/40 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-[#ff2a54]" />
                      Official University Summit
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-amber-400" />
                      Closed Delegation Only
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-white tracking-tight">
                    {venturePreview.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 text-xs sm:text-sm leading-relaxed custom-scrollbar">
                {/* Description */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold mb-1.5">
                    Summit Overview
                  </h4>
                  <p className="text-zinc-200">
                    {venturePreview.description ||
                      "Venture Vault is an exclusive 3-Stage University Innovation & Entrepreneurship delegation summit designed to assess venture viability, financial pitch mastery, and executive leadership under competition conditions."}
                  </p>
                </div>

                {/* Multi-Round Milestone Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                      3-Stage Competition Schedule
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Sequential Elimination Format
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {(venturePreview.subEvents || []).map((sub) => (
                      <div
                        key={sub.roundNumber}
                        className="rounded-2xl border border-white/[0.08] bg-[#14141c] p-3.5 flex flex-col justify-between"
                      >
                        <div>
                          {sub.bannerUrl && (
                            <img
                              src={sub.bannerUrl}
                              alt={sub.title}
                              className="w-full h-24 rounded-xl object-cover mb-2.5 border border-white/5"
                            />
                          )}
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="h-2 w-2 rounded-full bg-[#ff2a54]" />
                            <span className="text-[10px] font-mono font-bold text-[#ff2a54] uppercase tracking-wider">
                              Round {sub.roundNumber}
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs sm:text-sm line-clamp-2">
                            {sub.title}
                          </h5>
                          {sub.description && (
                            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                              {sub.description}
                            </p>
                          )}
                        </div>

                        {(sub.scheduledTime || sub.startsAt) && (
                          <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            <span>
                              {sub.scheduledTime
                                ? (sub.scheduledTime.toUpperCase().includes("IST") ? sub.scheduledTime : `${sub.scheduledTime} (IST)`)
                                : formatDateIST(sub.startsAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restricted Access / Institutional Notice Box */}
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-amber-300 text-xs sm:text-sm">
                      Candidate Accreditation & Pass Verification Notice
                    </h5>
                    <p className="text-[11px] sm:text-xs text-amber-200/80 leading-relaxed">
                      This summit operates under strict closed-delegation protocol. Public ticket sales and on-spot registrations are strictly disabled. All 50 accredited candidate teams have received dynamic entry QR credentials and cryptographic tokens via official university email dispatch.
                    </p>
                  </div>
                </div>

                {/* Support & Secretariat Helpdesk */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#111117] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-[#ff2a54] shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium text-zinc-300">
                        Accredited Delegate Support / Replacement Pass
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        Secretariat: {venturePreview.delegationInfo?.supportEmail || venturePreview.supportEmail || "happenins.co.in@gmail.com"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`mailto:${venturePreview.delegationInfo?.supportEmail || venturePreview.supportEmail || "happenins.co.in@gmail.com"}?subject=Venture%20Vault%20Summit%20Delegate%20Inquiry`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-[11px] font-bold transition border border-white/10 shrink-0"
                  >
                    <span>Contact Helpdesk</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0c0c12] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSummitModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Close Briefing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};