import React from "react";
import { PosterStudio } from "./PosterStudio";
import { SeatingSettings } from "./SeatingSettings";
import { AccessPolicySection } from "./AccessPolicySection";
import { TierConfigSection } from "./TierConfigSection";
import { useFeatures } from "../../context/FeaturesContext";
import { EventFormState } from "./useEventForm";
import {
  Loader2,
  X
} from "lucide-react";
import { motion } from "motion/react";

interface CreateEventModalProps {
  form: EventFormState;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ form, onClose, onSubmit }) => {
  const { isEnabled } = useFeatures();
  const {
    editingEventId,
    title, setTitle,
    description, setDescription,
    category, setCategory,
    locationType, setLocationType,
    venue, setVenue,
    city, setCity,
    startsAt, setStartsAt,
    endsAt, setEndsAt,
    bannerUrl, setBannerUrl,
    hasSeatingPlan, setHasSeatingPlan,
    seatingRows, setSeatingRows,
    seatingCols, setSeatingCols,
    tierName, setTierName,
    tierPrice, setTierPrice,
    tierCapacity, setTierCapacity,
    tierDescription, setTierDescription,
    tiers,
    policyType, setPolicyType,
    allowedDomains,
    customDomainInput, setCustomDomainInput,
    requireVerifiedEmail, setRequireVerifiedEmail,
    allowFreeTickets, setAllowFreeTickets,
    customRestrictionMessage, setCustomRestrictionMessage,
    institutions,
    posterSourceTab, setPosterSourceTab,
    isDraggingPoster, setIsDraggingPoster,
    posterUploading,
    posterUploadError,
    fileInputRef,
    createLoading,
    handleProcessPosterFile,
    handleAddTier,
    handleRemoveTier,
    handleAddDomain,
    handleRemoveDomain,
    toggleInstitutionChip,
  } = form;

  return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0c0c11] border border-white/[0.08] shadow-2xl overflow-hidden my-8 relative"
            >
              <div className="absolute -inset-24 rounded-full bg-[#e23744]/5 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between bg-[#14141b] border-b border-white/[0.08] p-5 relative z-10">
                <h2 className="text-base font-display font-black text-white tracking-tight">
                  {editingEventId ? "Edit Event Details" : "Create Community Event"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full p-1.5 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto relative z-10 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Event Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Beethoven Violin Concerts"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Category Type
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 focus:border-[#e23744]/50 focus:outline-none"
                    >
                      <option value="Concerts" className="bg-[#14141b] text-white">Concerts</option>
                      <option value="Theater & Arts" className="bg-[#14141b] text-white">Theater & Arts</option>
                      <option value="Festivals" className="bg-[#14141b] text-white">Festivals</option>
                      <option value="Tech Meetups" className="bg-[#14141b] text-white">Tech Meetups</option>
                      <option value="Fitness & Health" className="bg-[#14141b] text-white">Fitness & Health</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                    Description Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Complete specifications of schedules, guests, programs, guidelines..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white p-4 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Hosting Format
                    </label>
                    <select
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value as "VENUE" | "ONLINE")}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 focus:border-[#e23744]/50 focus:outline-none"
                    >
                      <option value="VENUE" className="bg-[#14141b] text-white">In-Person Venue</option>
                      <option value="ONLINE" className="bg-[#14141b] text-white">Virtual Livestream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      City Location
                    </label>
                    <input
                      type="text"
                      required={locationType === "VENUE"}
                      disabled={locationType === "ONLINE"}
                      placeholder="Metropolis"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none disabled:bg-zinc-900/50 disabled:text-zinc-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Specific Venue / Platform Link
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={locationType === "VENUE" ? "Arts Center Hall B" : "Zoom Event Url Link"}
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Starts At Schedule (Local Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 focus:border-[#e23744]/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                      Ends At Schedule (Local Time)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-4 py-3 focus:border-[#e23744]/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Event Poster / Banner Cover Image Studio */}
                <PosterStudio
                  posterSourceTab={posterSourceTab}
                  setPosterSourceTab={setPosterSourceTab}
                  posterUploadError={posterUploadError}
                  fileInputRef={fileInputRef}
                  handleProcessPosterFile={handleProcessPosterFile}
                  isDraggingPoster={isDraggingPoster}
                  setIsDraggingPoster={setIsDraggingPoster}
                  posterUploading={posterUploading}
                  bannerUrl={bannerUrl}
                  setBannerUrl={setBannerUrl}
                />

                {isEnabled("SEATING_PLANS") && <SeatingSettings
                  hasSeatingPlan={hasSeatingPlan}
                  setHasSeatingPlan={setHasSeatingPlan}
                  seatingRows={seatingRows}
                  setSeatingRows={setSeatingRows}
                  seatingCols={seatingCols}
                  setSeatingCols={setSeatingCols}
                />}

                {isEnabled("INSTITUTION_ACCESS") && <AccessPolicySection
                  policyType={policyType}
                  setPolicyType={setPolicyType}
                  institutions={institutions}
                  allowedDomains={allowedDomains}
                  toggleInstitutionChip={toggleInstitutionChip}
                  customDomainInput={customDomainInput}
                  setCustomDomainInput={setCustomDomainInput}
                  handleAddDomain={handleAddDomain}
                  handleRemoveDomain={handleRemoveDomain}
                  allowFreeTickets={allowFreeTickets}
                  setAllowFreeTickets={setAllowFreeTickets}
                  requireVerifiedEmail={requireVerifiedEmail}
                  setRequireVerifiedEmail={setRequireVerifiedEmail}
                  customRestrictionMessage={customRestrictionMessage}
                  setCustomRestrictionMessage={setCustomRestrictionMessage}
                />}

                <TierConfigSection
                  tierName={tierName}
                  setTierName={setTierName}
                  tierPrice={tierPrice}
                  setTierPrice={setTierPrice}
                  tierCapacity={tierCapacity}
                  setTierCapacity={setTierCapacity}
                  tierDescription={tierDescription}
                  setTierDescription={setTierDescription}
                  tiers={tiers}
                  handleAddTier={handleAddTier}
                  handleRemoveTier={handleRemoveTier}
                />

                {/* Submit draft event */}
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#d12e3b] hover:to-[#eb244a] py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#e23744]/25 active:scale-98 transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                  ) : editingEventId ? (
                    "Save Event Changes"
                  ) : (
                    "Submit Draft Event Specification"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
  );
};
