import React from "react";
import { Star, CheckCircle, Send, MessageSquare, User, Loader2 } from "lucide-react";

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatarUrl?: string | null;
  createdAt: string;
}

interface ReviewsSectionProps {
  reviews: ReviewItem[];
  ratingsAverage: number;
  ratingsCount: number;
  isEligibleToReview: boolean;
  reviewSuccess: boolean;
  reviewError: string;
  userRating: number;
  setUserRating: (v: number) => void;
  userComment: string;
  setUserComment: (v: string) => void;
  submittingReview: boolean;
  handleReviewSubmit: (e: React.FormEvent) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  ratingsAverage,
  ratingsCount,
  isEligibleToReview,
  reviewSuccess,
  reviewError,
  userRating,
  setUserRating,
  userComment,
  setUserComment,
  submittingReview,
  handleReviewSubmit,
}) => {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 md:p-8 shadow-2xl relative space-y-6">
      <h3 className="text-sm font-display font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.06] pb-4">
        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        <span>Community Sentiment & Verified Reviews</span>
      </h3>

      {/* Scorecard block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white/[0.02] border border-white/[0.06] p-5 rounded-2xl text-zinc-200">
        <div className="text-center md:border-r border-white/[0.06] py-2">
          <p className="text-4xl font-display font-black text-white">
            {ratingsAverage > 0 ? ratingsAverage : "N/A"}
          </p>
          <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4.5 w-4.5 ${
                  i < Math.round(ratingsAverage) ? "fill-amber-400 text-amber-400" : "text-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 mt-2 font-semibold">
            Based on {ratingsCount} Verified Buyers
          </p>
        </div>

        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 w-12 text-right">{stars} Star</span>
                <div className="flex-1 bg-white/[0.05] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#e23744] h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-400 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* If eligible verified buyer checked in - unlock feedback review box */}
      {isEligibleToReview && (
        <div className="border border-white/[0.08] bg-white/[0.02] rounded-2xl p-5 mt-4 space-y-4">
          <div>
            <h4 className="text-xs font-display font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Unlocked: Verified Attendee Review</span>
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              You have checked in at the event's Security Gate Scanner. Help others by sharing your honest experience!
            </p>
          </div>

          {reviewSuccess ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-300 font-bold">
              Thank you! Your feedback review has been posted successfully.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewError && (
                <div className="rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-300 font-bold border border-rose-500/20">
                  {reviewError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Your Rating:
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const starVal = idx + 1;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setUserRating(starVal)}
                        className="text-amber-400 hover:scale-110 active:scale-95 transition cursor-pointer"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            starVal <= userRating ? "fill-amber-400 text-amber-400" : "text-zinc-700"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your experience... How was the sound system, performance, atmosphere, and amenities?"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full glass-input rounded-xl p-3.5 text-xs bg-[#14141b] border border-white/[0.08] text-white placeholder-zinc-500 focus:border-[#e23744]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="district-btn-primary flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {submittingReview ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Publish Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* List Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            <MessageSquare className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
            No community reviews have been posted for this event yet.
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="border-b border-white/[0.06] last:border-0 pb-5 last:pb-0 pt-2 flex items-start gap-4">
              <div className="h-9 w-9 rounded-full bg-white/[0.04] flex items-center justify-center text-zinc-300 shrink-0 uppercase border border-white/[0.08] overflow-hidden">
                {rev.userAvatarUrl ? (
                  <img src={rev.userAvatarUrl} alt={rev.userName} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white">{rev.userName}</p>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black text-emerald-400 uppercase border border-emerald-500/20">
                      <CheckCircle className="h-2.5 w-2.5" />
                      Verified Buyer
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating ? "fill-amber-400 text-amber-400" : "text-white/10"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed italic">{rev.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
