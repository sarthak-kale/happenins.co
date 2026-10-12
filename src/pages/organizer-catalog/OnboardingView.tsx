import React from "react";
import {
  LayoutDashboard,
  Loader2
} from "lucide-react";

interface OnboardingViewProps {
  onboardCompanyName: string;
  setOnboardCompanyName: (v: string) => void;
  onboardWebsite: string;
  setOnboardWebsite: (v: string) => void;
  onboardLoading: boolean;
  onboardError: string;
  handleOnboardSubmit: (e: React.FormEvent) => void | Promise<void>;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onboardCompanyName,
  setOnboardCompanyName,
  onboardWebsite,
  setOnboardWebsite,
  onboardLoading,
  onboardError,
  handleOnboardSubmit,
}) => {
    return (
      <div className="mx-auto max-w-md px-4 py-16 relative z-10 animate-fade-in">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c11] p-8 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-24 rounded-full bg-[#e23744]/5 blur-3xl" />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e23744]/10 border border-[#e23744]/20 text-[#e23744] mx-auto mb-5 relative z-10">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-display font-black text-white tracking-tight relative z-10">Become an Organizer</h2>
          <p className="text-xs text-zinc-400 mt-2 mb-6 leading-relaxed relative z-10">
            Create high-quality events, manage ticket inventory, verify check-in passes, monitor revenue calculations, and download attendee rosters.
          </p>

          {onboardError && (
            <div className="mb-4 rounded-xl bg-rose-500/5 p-3 text-2xs font-extrabold text-rose-300 border border-rose-500/20 relative z-10">
              {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left relative z-10">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                Company / Organization Name
              </label>
              <input
                type="text"
                required
                placeholder="Metropolis Arts Group"
                value={onboardCompanyName}
                onChange={(e) => setOnboardCompanyName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-500 focus:border-[#e23744]/50 focus:outline-none focus:ring-1 focus:ring-[#e23744]/30 transition-all font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                Website Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://metropolisarts.com"
                value={onboardWebsite}
                onChange={(e) => setOnboardWebsite(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-500 focus:border-[#e23744]/50 focus:outline-none focus:ring-1 focus:ring-[#e23744]/30 transition-all font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={onboardLoading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e23744]/25 active:scale-98 transition duration-150 disabled:opacity-50 cursor-pointer"
            >
              {onboardLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                "Launch Organizer Portal"
              )}
            </button>
          </form>
        </div>
      </div>
    );
};
