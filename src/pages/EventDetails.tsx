import React, { useState, useEffect } from "react";
import { EventDTO, TicketTierDTO, BookingDTO, EventEligibilityDTO } from "../types";
import { useAuth } from "../context/AuthContext";
import { formatRupees, formatDateIST } from "../lib/formatters";
import { MapPin, Tag, ArrowLeft, Clock, Building } from "lucide-react";
import { api } from "../lib/api";
import { EventMap } from "../components/EventMap";
import { SeatMapLayout } from "../components/SeatMapLayout";
import { InstitutionOtpVerification } from "../components/InstitutionOtpVerification";
import { VirtualWaitingRoomModal } from "../components/VirtualWaitingRoomModal";
import { useFeatures } from "../context/FeaturesContext";
import { ReviewsSection, ReviewItem } from "./event-details/ReviewsSection";
import { TicketPanel } from "./event-details/TicketPanel";
import { getErrorMessage, getErrorStatus } from "../lib/errors";

interface EventDetailsProps {
  event: EventDTO;
  onBack: () => void;
  onReserved: (bookingId: string) => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onBack, onReserved }) => {
  const { user, loading: authLoading } = useAuth();
  const { isEnabled } = useFeatures();
  const reviewsOn = isEnabled("REVIEWS");
  const institutionOn = isEnabled("INSTITUTION_ACCESS");
  const [quantities, setQuantities] = useState<{ [tierId: string]: number }>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // Interactive Seating Plan states
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes hold lock

  // Verified Buyer Reviews states
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [ratingsAverage, setRatingsAverage] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [isEligibleToReview, setIsEligibleToReview] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Institution Access Eligibility & OTP states
  const [eligibility, setEligibility] = useState<EventEligibilityDTO | null>(null);
  const [institutionOtpVerified, setInstitutionOtpVerified] = useState(false);
  const [verifiedCollegeEmail, setVerifiedCollegeEmail] = useState<string | null>(null);
  const [institutionVerificationToken, setInstitutionVerificationToken] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>(null);

  // Virtual Waiting Room (District / BookMyShow Superpower) states
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [admissionToken, setAdmissionToken] = useState<string | null>(null);

  // Group Reservations states
  const [isSplitBooking, setIsSplitBooking] = useState(false);
  const [friends, setFriends] = useState<Array<{ name: string; email: string }>>([]);
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  const sortedTiers = [...event.ticketTiers].sort((a, b) => b.price - a.price);

  const getTierForRowIndex = (rowIndex: number): TicketTierDTO => {
    if (sortedTiers.length === 1) return sortedTiers[0];
    if (sortedTiers.length === 2) {
      if (rowIndex < 3) return sortedTiers[0];
      return sortedTiers[1];
    }
    if (rowIndex < 2) return sortedTiers[0]; // Highest tier, e.g. VIP
    if (rowIndex < 5) return sortedTiers[1]; // Middle tier, e.g. Premium
    return sortedTiers[sortedTiers.length - 1]; // Lowest tier, e.g. Standard
  };

  const getRowLabel = (index: number) => {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  };

  const loadData = async () => {
    try {
      const elig = await api.checkEventEligibility(event.id);
      setEligibility(elig);
    } catch {
      // Event eligibility fallback
    }

    if (reviewsOn) try {
      const reviewList = await api.getReviews(event.id);
      setReviews(reviewList);
      if (reviewList.length > 0) {
        const sum = reviewList.reduce((acc: number, r: ReviewItem) => acc + r.rating, 0);
        setRatingsAverage(parseFloat((sum / reviewList.length).toFixed(1)));
        setRatingsCount(reviewList.length);
      }
    } catch {
      // Reviews fallback
    }

    if (event.hasSeatingPlan) {
      try {
        const occupied = await api.getOccupiedSeats(event.id);
        setOccupiedSeats(occupied);
      } catch {
        // Seating fallback
      }
    }

    if (user && !authLoading) {
      if (institutionOn && event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC") {
        try {
          const otpStatus = await api.getInstitutionOtpStatus(event.id);
          if (otpStatus?.isVerified && otpStatus?.verifiedCollegeEmail) {
            setInstitutionOtpVerified(true);
            setVerifiedCollegeEmail(otpStatus.verifiedCollegeEmail);
            setInstitutionName(otpStatus.institutionName || null);
          }
        } catch {
          // ignore
        }
      }

      if (!reviewsOn) {
        setIsEligibleToReview(false);
      } else try {
        const reviewElig = await api.checkReviewEligibility(event.id);
        if (reviewElig?.hasReviewed) {
          setReviewSuccess(true);
          setIsEligibleToReview(false);
        } else {
          setIsEligibleToReview(!!reviewElig?.eligible);
        }
      } catch {
        setIsEligibleToReview(false);
      }
    } else {
      setIsEligibleToReview(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [event.id, user, authLoading]);

  // Seating plan hold lock timer count
  useEffect(() => {
    if (!event.hasSeatingPlan) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(timer);
  }, [event.hasSeatingPlan]);

  const handleSeatClick = (rowIndex: number, colNum: number) => {
    const rowChar = getRowLabel(rowIndex);
    const seatId = `${rowChar}-${colNum}`;
    if (occupiedSeats.includes(seatId)) return;

    let nextSelected = [...selectedSeats];
    if (nextSelected.includes(seatId)) {
      nextSelected = nextSelected.filter((s) => s !== seatId);
    } else {
      if (nextSelected.length >= 10) {
        setError("You can select a maximum of 10 seats per booking.");
        return;
      }
      nextSelected.push(seatId);
    }
    setSelectedSeats(nextSelected);

    // Sync quantities based on chosen seating rows
    const newQuantities: { [tierId: string]: number } = {};
    for (const seat of nextSelected) {
      const rowCharOfSeat = seat.split("-")[0];
      const rIdx = rowCharOfSeat.charCodeAt(0) - 65;
      const assignedTier = getTierForRowIndex(rIdx);
      newQuantities[assignedTier.id] = (newQuantities[assignedTier.id] || 0) + 1;
    }
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (tierId: string, delta: number, maxAvailable: number) => {
    if (event.hasSeatingPlan) {
      setError("Please select seats directly from the auditorium visual layout below.");
      return;
    }
    const current = quantities[tierId] || 0;
    const next = current + delta;
    if (next >= 0 && next <= maxAvailable && next <= 10) {
      setQuantities({ ...quantities, [tierId]: next });
    }
  };

  const getSubtotal = () => {
    return event.ticketTiers.reduce((acc, tier) => {
      const qty = quantities[tier.id] || 0;
      return acc + qty * tier.price;
    }, 0);
  };

  const getSelectedCount = () => {
    return (Object.values(quantities) as number[]).reduce((acc, q) => acc + q, 0);
  };

  // Split-share calculation
  const getSharesList = () => {
    const totalCents = getSubtotal();
    const count = friends.length + 1;
    const shareCents = Math.round(totalCents / count);
    return {
      mainShare: shareCents,
      friendShare: shareCents,
    };
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendEmail.trim()) return;
    if (friends.some((f) => f.email === friendEmail.trim())) {
      setError("This email address is already added.");
      return;
    }
    setFriends([...friends, { name: friendName.trim(), email: friendEmail.trim() }]);
    setFriendName("");
    setFriendEmail("");
  };

  const handleRemoveFriend = (email: string) => {
    setFriends(friends.filter((f) => f.email !== email));
  };

  const handleBookNow = async () => {
    if (!user) {
      setError("Please log in or register above to buy tickets.");
      return;
    }

    const items = Object.entries(quantities)
      .filter(([_, q]) => (q as number) > 0)
      .map(([tierId, q]) => ({
        ticketTierId: tierId,
        quantity: q as number,
        seatNumbers: event.hasSeatingPlan
          ? selectedSeats
              .filter((s) => {
                const rChar = s.split("-")[0];
                const rIdx = rChar.charCodeAt(0) - 65;
                return getTierForRowIndex(rIdx).id === tierId;
              })
              .join(",")
          : undefined,
      }));

    if (items.length === 0) {
      setError("Please select at least 1 ticket or seat to book.");
      return;
    }

    const isInstitutionEvent = institutionOn && event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC";
    if (isInstitutionEvent && !institutionOtpVerified) {
      setError("Please complete official college email ID OTP verification below to unlock institutional tickets.");
      const elem = document.getElementById("institution-otp-section");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const executeReservation = async (tokenToUse?: string) => {
      setBookingLoading(true);
      setError("");

      try {
        let splitSharesPayload = undefined;
        if (isSplitBooking && friends.length > 0) {
          const { friendShare } = getSharesList();
          splitSharesPayload = friends.map((f) => ({
            friendName: f.name,
            email: f.email,
            amount: friendShare,
          }));
        }

        const activeToken = tokenToUse || admissionToken || undefined;
        const booking = await api.reserveTickets(
          event.id,
          items,
          isSplitBooking,
          splitSharesPayload,
          institutionOtpVerified
            ? {
                verificationToken: institutionVerificationToken || undefined,
                collegeEmail: verifiedCollegeEmail || undefined,
              }
            : undefined,
          activeToken
        );
        onReserved(booking.id);
      } catch (err: unknown) {
        if (
          isEnabled("WAITING_ROOM") && (
            getErrorMessage(err)?.includes("QUEUE_REQUIRED") ||
            getErrorMessage(err)?.includes("Virtual Waiting Room") ||
            getErrorStatus(err) === 429
          )
        ) {
          setShowWaitingRoom(true);
        } else {
          setError(getErrorMessage(err) || "Failed to make reservation.");
        }
      } finally {
        setBookingLoading(false);
      }
    };

    // First attempt reservation with fast-pass
    await executeReservation();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess(false);
    setSubmittingReview(true);

    try {
      await api.createReview(event.id, userRating, userComment.trim());
      setUserComment("");
      setReviewSuccess(true);
      loadData();
    } catch (err: unknown) {
      setReviewError(getErrorMessage(err) || "Failed to post review feedback.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (cents: number) => {
    return formatRupees(cents);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formattedDate = formatDateIST(event.startsAt, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative z-10">
      {/* Back button */}
      <button
        onClick={onBack}
        id="btn-return-browse"
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white focus:outline-none cursor-pointer transition duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Browse</span>
      </button>

      {error && (
        <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-300">
          {error}
        </div>
      )}

      {/* Main details grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Banner with Description & Seating chart */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-900 border border-white/5 shadow-2xl">
            <img
              src={event.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"}
              alt={event.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80") {
                  target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";
                }
              }}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 md:p-8 shadow-2xl relative">
            <h1 className="text-3xl font-display font-black tracking-tight text-white sm:text-4xl">
              {event.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-zinc-300 text-sm border-b border-white/[0.06] pb-5">
              <span className="inline-flex items-center gap-1.5 text-zinc-200 font-semibold bg-white/[0.04] border border-white/[0.08] px-3.5 py-1 rounded-full text-xs font-display">
                <Tag className="h-3.5 w-3.5 text-zinc-400" />
                {event.category}
              </span>

              {event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC" && (
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/25 px-3.5 py-1 rounded-full text-xs font-mono">
                  <Building className="h-3.5 w-3.5 text-amber-400" />
                  INSTITUTION RESTRICTED
                </span>
              )}

              <span className="flex items-center gap-1.5 font-medium text-xs text-zinc-300">
                <MapPin className="h-4 w-4 text-[#ff2a54] shrink-0" />
                <span>
                  {event.locationType === "VENUE"
                    ? `${event.venue}, ${event.city}`
                    : "Virtual Livestream Only"}
                </span>
              </span>
            </div>

            {/* Institution Access & College Email OTP Verification */}
            {institutionOn && event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC" && (
              <div className="mt-6">
                <InstitutionOtpVerification
                  eventId={event.id}
                  eventTitle={event.title}
                  allowedDomains={event.accessPolicy.allowedDomains || []}
                  isVerified={institutionOtpVerified}
                  verifiedCollegeEmail={verifiedCollegeEmail}
                  institutionName={institutionName}
                  onVerified={(data) => {
                    setInstitutionOtpVerified(true);
                    setVerifiedCollegeEmail(data.verifiedCollegeEmail);
                    setInstitutionVerificationToken(data.verificationToken);
                    setError("");
                  }}
                  onResetVerification={() => {
                    setInstitutionOtpVerified(false);
                    setVerifiedCollegeEmail(null);
                    setInstitutionVerificationToken(null);
                  }}
                />
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-xs font-display font-bold uppercase text-zinc-400 tracking-wider font-mono">
                Event Description
              </h2>
              <p className="mt-2.5 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* INTERACTIVE VENUE SEATING LAYOUT */}
          {event.hasSeatingPlan && (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 md:p-8 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#ff2a54]" />
                  <span>Choose Your Seats</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                  <Clock className="h-3 w-3 animate-pulse" />
                  Hold Clock: {formatTime(timeLeft)}
                </span>
              </div>
              <SeatMapLayout
                rows={event.seatingRows || 10}
                cols={event.seatingCols || 10}
                ticketTiers={event.ticketTiers}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={(seatId) => {
                  const parts = seatId.split("-");
                  const rowChar = parts[0];
                  const colNum = parseInt(parts[1], 10);
                  const rowIndex = rowChar.charCodeAt(0) - 65;
                  handleSeatClick(rowIndex, colNum);
                }}
                maxSelection={10}
              />
              {selectedSeats.length > 0 && (
                <div className="mt-5 border-t border-white/[0.06] pt-4 text-xs font-medium text-zinc-300 flex items-center gap-2">
                  <span>Selected Seats:</span>{" "}
                  <span className="font-extrabold text-[#ff2a54] bg-[#e23744]/10 border border-[#e23744]/20 px-3 py-1 rounded-xl font-display">
                    {selectedSeats.join(", ")}
                  </span>
                </div>
              )}
            </div>
          )}

          {event.locationType === "VENUE" && (
            <EventMap venue={event.venue} city={event.city || null} title={event.title} />
          )}

          {/* VERIFIED-BUYER REVIEWS & COMMUNITY RATINGS */}
          {reviewsOn && <ReviewsSection
            reviews={reviews}
            ratingsAverage={ratingsAverage}
            ratingsCount={ratingsCount}
            isEligibleToReview={isEligibleToReview}
            reviewSuccess={reviewSuccess}
            reviewError={reviewError}
            userRating={userRating}
            setUserRating={setUserRating}
            userComment={userComment}
            setUserComment={setUserComment}
            submittingReview={submittingReview}
            handleReviewSubmit={handleReviewSubmit}
          />}
        </div>

        {/* Tickets, Pricing & Collaborative Split Bill panel */}
        <div className="space-y-6">
          <TicketPanel
            event={event}
            formattedDate={formattedDate}
            quantities={quantities}
            handleQuantityChange={handleQuantityChange}
            selectedCount={getSelectedCount()}
            subtotal={getSubtotal()}
            mainShare={getSharesList().mainShare}
            friendShare={getSharesList().friendShare}
            isSplitBooking={isSplitBooking}
            setIsSplitBooking={setIsSplitBooking}
            friends={friends}
            friendName={friendName}
            setFriendName={setFriendName}
            friendEmail={friendEmail}
            setFriendEmail={setFriendEmail}
            handleAddFriend={handleAddFriend}
            handleRemoveFriend={handleRemoveFriend}
            handleBookNow={handleBookNow}
            bookingLoading={bookingLoading}
            institutionOtpVerified={institutionOtpVerified}
          />
        </div>
      </div>

      {/* District / BookMyShow Virtual Waiting Room Modal */}
      {showWaitingRoom && (
        <VirtualWaitingRoomModal
          eventId={event.id}
          eventTitle={event.title}
          bannerUrl={event.bannerUrl}
          onAdmitted={(token) => {
            setAdmissionToken(token);
            setShowWaitingRoom(false);
            handleBookNow();
          }}
          onCancel={() => {
            setShowWaitingRoom(false);
          }}
        />
      )}
    </div>
  );
};
