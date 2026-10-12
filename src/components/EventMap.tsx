import React from "react";
import { MapPin, Navigation, Share2 } from "lucide-react";

interface EventMapProps {
  venue: string;
  city?: string | null;
  title: string;
}

export const EventMap: React.FC<EventMapProps> = ({ venue, city, title }) => {
  const fullAddress = city ? `${venue}, ${city}` : venue;
  const encodedAddress = encodeURIComponent(fullAddress);
  
  // Construct a secure, fast, and fully responsive embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
  };

  const handleShareDirections = () => {
    if (navigator.share) {
      navigator.share({
        title: `Directions to ${title}`,
        text: `Check out the location of ${title} at ${fullAddress}`,
        url: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
      alert("Directions link copied to clipboard!");
    }
  };

  return (
    <div id="event-map-container" className="rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-display">
          <MapPin className="h-4.5 w-4.5 text-[#ff2a54]" />
          <span>Interactive Event Map</span>
        </h3>
        <span className="rounded-md bg-[#e23744]/15 border border-[#e23744]/30 px-2 py-0.5 text-[9.5px] font-bold text-[#ff2a54] uppercase tracking-wider">
          Live Location Grounding
        </span>
      </div>

      <div className="relative aspect-video w-full rounded-xl border border-white/10 overflow-hidden bg-[#060608] shadow-inner">
        <iframe
          title="Interactive Event Location Map"
          width="100%"
          height="100%"
          src={embedUrl}
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          className="border-0 rounded-xl"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{venue}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{city || "Metropolis Location"}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-directions"
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] text-white font-bold px-3.5 py-2 transition cursor-pointer shadow-lg shadow-red-950/40 active:scale-95 duration-150"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Directions</span>
          </button>
          <button
            id="btn-share-directions"
            onClick={handleShareDirections}
            className="flex items-center justify-center p-2 rounded-xl bg-[#14141b] hover:bg-white/10 text-slate-300 border border-white/10 transition cursor-pointer active:scale-95 duration-150"
            title="Share Location"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
