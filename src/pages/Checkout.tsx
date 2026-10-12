import React, { useState, useEffect } from "react";
import { BookingDTO, BookingSplitShareDTO, WalletDTO } from "../types";
import { api } from "../lib/api";
import { useFeatures } from "../context/FeaturesContext";
import { formatRupees } from "../lib/formatters";
import {
  Clock,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  Loader2,
  ArrowLeft,
  Users,
  CheckCircle,
  Copy,
  Share2,
  Check,
  Wallet,
  MessageSquare,
  Phone,
  Gift
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/errors";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

type RazorpayWindow = Window & {
  Razorpay?: new (options: object) => { open: () => void };
};

// Legacy UI reads a `status` field on split shares that is not part of the DTO.
type SplitShareView = BookingSplitShareDTO & { status?: string };

interface CheckoutProps {
  bookingId: string;
  onCancel: () => void;
  onCompleted: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ bookingId, onCancel, onCompleted }) => {
  const { user } = useAuth();
  const { isEnabled } = useFeatures();
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState("");

  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");

  // WhatsApp ticket confirmation state
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [whatsAppPhone, setWhatsAppPhone] = useState(user?.phone || "8767164611");

  const [copied, setCopied] = useState(false);
  const [sharePayLoadingId, setSharePayLoadingId] = useState<string | null>(null);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    setPromoError("");
    setPromoSuccess("");
    try {
      const updatedBooking = await api.applyPromo(bookingId, promoCode);
      setBooking(updatedBooking);
      setPromoSuccess("Promo code applied successfully!");
    } catch (err: unknown) {
      setPromoError(getErrorMessage(err) || "Failed to apply promo code.");
    } finally {
      setPromoLoading(false);
    }
  };

  const loadBookingAndWallet = async () => {
    try {
      const [bookingData, walletData] = await Promise.all([
        api.getBookingDetails(bookingId),
        api.getWallet().catch(() => null),
      ]);
      setBooking(bookingData);
      if (walletData) setWallet(walletData);
    } catch (err: unknown) {
      setError("Failed to load checkout details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWallet = async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const updated = await api.applyWalletToBooking(bookingId);
      setBooking(updated);
      const updatedWallet = await api.getWallet().catch(() => null);
      if (updatedWallet) setWallet(updatedWallet);
    } catch (err: unknown) {
      setWalletError(getErrorMessage(err) || "Failed to apply Happenins Wallet balance.");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleRemoveWallet = async () => {
    setWalletLoading(true);
    setWalletError("");
    try {
      const updated = await api.removeWalletFromBooking(bookingId);
      setBooking(updated);
      const updatedWallet = await api.getWallet().catch(() => null);
      if (updatedWallet) setWallet(updatedWallet);
    } catch (err: unknown) {
      setWalletError(getErrorMessage(err) || "Failed to remove Happenins Wallet deduction.");
    } finally {
      setWalletLoading(false);
    }
  };

  const handlePayFriendShare = async (shareId: string) => {
    setSharePayLoadingId(shareId);
    setError("");
    try {
      const mockTxId = `TX-SHARE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await api.confirmSplitSharePayment(bookingId, shareId, mockTxId, "SANDBOX_CARD_DEMO");
      // Reload booking to reflect the updated paid status
      await loadBookingAndWallet();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Failed to confirm split share payment.");
    } finally {
      setSharePayLoadingId(null);
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?payShareBookingId=${bookingId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    loadBookingAndWallet();
  }, [bookingId]);

  // Reservation countdown timer
  useEffect(() => {
    if (!booking) return;

    const timer = setInterval(() => {
      const difference = new Date(booking.reservedUntil).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(timer);
      } else {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const fillDemoValues = () => {
    setCardName(user?.fullName || "John Doe");
    setCardNumber("4111 •••• •••• 1111");
    setCardExpiry("12/28");
    setCardCvv("123");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as RazorpayWindow).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    if (!booking || !booking.razorpayOrderId) return;
    setPayLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load secure Razorpay payment assets.");
      setPayLoading(false);
      return;
    }

    const options = {
      key: booking.razorpayKeyId,
      amount: booking.totalAmount, // amount in paise/cents
      currency: "INR",
      name: "Happenins Tickets",
      description: `Reserve tickets for ${booking.eventTitle}`,
      order_id: booking.razorpayOrderId,
      handler: async function (response: RazorpayResponse) {
        setPayLoading(true);
        try {
          await api.confirmPayment(
            bookingId,
            response.razorpay_payment_id,
            "RAZORPAY",
            {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }
          );
          if (sendWhatsApp && whatsAppPhone && isEnabled("WHATSAPP_DELIVERY")) {
            api.sendWhatsAppConfirmation(bookingId, whatsAppPhone).catch(() => {});
          }
          onCompleted();
        } catch (err: unknown) {
          setError(getErrorMessage(err) || "Razorpay verification security failure.");
        } finally {
          setPayLoading(false);
        }
      },
      prefill: {
        name: cardName || user?.fullName || "Happenins Attendee",
        email: user?.email || "",
      },
      theme: {
        color: "#4f46e5",
      },
      modal: {
        ondismiss: function () {
          setPayLoading(false);
        }
      }
    };

    try {
      const rzp = new (window as RazorpayWindow).Razorpay!(options);
      rzp.open();
    } catch (err: unknown) {
      setError("Could not launch secure payment: " + getErrorMessage(err));
      setPayLoading(false);
    }
  };

  const handleCheckoutSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (timeLeft === "EXPIRED") {
      setError("Your reservation lock has expired. Please return and select your tickets again.");
      return;
    }

    // If remaining total is > 0 and Razorpay is active
    if (booking?.totalAmount && booking.totalAmount > 0 && booking?.razorpayOrderId) {
      await handleRazorpayCheckout();
      return;
    }

    setPayLoading(true);
    setError("");

    try {
      const mockTxId = booking?.totalAmount === 0
        ? `WALLET-100-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        : `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const paymentMethod = booking?.totalAmount === 0 ? "HAPPENINS_WALLET" : "DEMO_REPRESENTATIVE_CARD";
      await api.confirmPayment(bookingId, mockTxId, paymentMethod);

      if (sendWhatsApp && whatsAppPhone && isEnabled("WHATSAPP_DELIVERY")) {
        api.sendWhatsAppConfirmation(bookingId, whatsAppPhone).catch(() => {});
      }

      onCompleted();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Payment verification failed.");
    } finally {
      setPayLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return formatRupees(cents);
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e23744]" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-6 text-rose-400">
          {error}
        </div>
        <button onClick={onCancel} className="mt-4 text-[#ff2a54] font-bold hover:underline cursor-pointer">
          Return to Details
        </button>
      </div>
    );
  }

  const isWalletFullyCovered = Boolean(booking && booking.totalAmount === 0 && (booking.walletAmountApplied || 0) > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10">
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white focus:outline-none cursor-pointer transition duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Modify Passes & Selections</span>
      </button>

      {/* Grid containing reservation summ and mock-pay */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Core details Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl relative">
            <h1 className="text-xl font-display font-black text-white mb-4">
              Booking Reservation Summary
            </h1>

            {/* Expire check countdown */}
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-[#e23744]/10 border border-[#e23744]/20 p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#ff2a54] animate-pulse" />
                <span className="text-sm font-bold text-[#ff2a54] font-display">
                  Temporary Inventory Ticket Lock
                </span>
              </div>
              <span className="font-mono text-base font-black text-white bg-black/60 border border-[#e23744]/30 px-3 py-1 rounded-xl">
                {timeLeft === "EXPIRED" ? "TIMED OUT" : timeLeft}
              </span>
            </div>

            {/* Items row displays */}
            {booking && (
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest block">
                    Selected Event
                  </span>
                  <span className="text-base font-bold text-white block mt-1">
                    {booking.eventTitle}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Tickets Selected
                  </span>
                  {booking.items.map((it) => (
                    <div key={it.id} className="flex justify-between text-sm py-1 font-medium text-slate-300">
                      <span>
                        {it.tierName} <span className="text-xs text-slate-500 font-bold ml-1.5">x{it.quantity}</span>
                      </span>
                      <span className="font-bold text-white">{formatPrice(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Happenins Wallet Application Section */}
                {isEnabled("WALLET") && (
                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <span>Happenins Wallet</span>
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      Bal: {wallet ? formatRupees(wallet.balance) : "₹0.00"}
                    </span>
                  </div>

                  {booking.walletAmountApplied && booking.walletAmountApplied > 0 ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Happenins Wallet Applied</span>
                        </span>
                        <span className="font-black font-mono">
                          -{formatPrice(booking.walletAmountApplied)}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-400/80">
                        {booking.totalAmount === 0
                          ? "100% of this booking is covered by your Happenins Wallet balance."
                          : `Deducted ${formatPrice(booking.walletAmountApplied)} from your wallet. Remaining balance is payable at checkout.`}
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveWallet}
                        disabled={walletLoading}
                        className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer mt-1"
                      >
                        {walletLoading ? "Updating..." : "Remove Wallet Deduction"}
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/5 bg-white/2 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white">
                          Use Happenins Wallet Balance
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {wallet && wallet.balance > 0
                            ? `Apply ${formatRupees(wallet.balance)} available credit to reduce ticket price.`
                            : "No active refund wallet balance. Cancelled tickets credit here."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyWallet}
                        disabled={walletLoading || !wallet || wallet.balance <= 0}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        {walletLoading ? "Applying..." : "Apply Wallet"}
                      </button>
                    </div>
                  )}

                  {walletError && (
                    <p className="text-[11px] font-medium text-rose-400 mt-1.5">{walletError}</p>
                  )}
                </div>
                )}

                {/* Promo Code Input */}
                {isEnabled("PROMO_CODES") && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <span className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Promo Code / Discount Coupon
                  </span>
                  {booking.promoCode ? (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-emerald-300 text-xs font-medium">
                      <span>Promo code <strong className="font-mono bg-slate-950 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-400 uppercase">{booking.promoCode}</strong> is active! Saved {formatPrice(booking.discountAmount || 0)}.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoCode("");
                          setPromoSuccess("");
                          loadBookingAndWallet();
                        }}
                        className="text-[10px] font-bold text-rose-400 hover:underline cursor-pointer ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. EARLYBIRD20, LOCALGUEST"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs placeholder:text-slate-500 uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode}
                          className="district-btn-primary rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer active:scale-95 transition"
                        >
                          {promoLoading ? "Applying..." : "Apply"}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[11px] font-medium text-rose-400">{promoError}</p>
                      )}
                      {promoSuccess && (
                        <p className="text-[11px] font-medium text-emerald-400">{promoSuccess}</p>
                      )}
                    </div>
                  )}
                </div>
                )}

                {/* Deductions breakdown */}
                {booking.discountAmount && booking.discountAmount > 0 ? (
                  <div className="mt-4 border-t border-white/[0.06] pt-3 flex items-baseline justify-between text-emerald-400">
                    <span className="text-xs font-display font-bold uppercase tracking-wider">Coupon Savings</span>
                    <span className="text-sm font-bold">-{formatPrice(booking.discountAmount)}</span>
                  </div>
                ) : null}

                {booking.walletAmountApplied && booking.walletAmountApplied > 0 ? (
                  <div className="mt-2 flex items-baseline justify-between text-emerald-400">
                    <span className="text-xs font-display font-bold uppercase tracking-wider">Wallet Deduction</span>
                    <span className="text-sm font-bold">-{formatPrice(booking.walletAmountApplied)}</span>
                  </div>
                ) : null}

                <div className="mt-4 border-t border-white/[0.06] pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-zinc-300">Total Price Due</span>
                  <span className="text-xl font-display font-black text-white">
                    {formatPrice(booking.totalAmount)}
                  </span>
                </div>

                {/* WhatsApp Ticket Confirmation Callout */}
                {isEnabled("WHATSAPP_DELIVERY") && (
                <div className="mt-6 border-t border-white/5 pt-4 rounded-2xl bg-[#081711]/70 border border-emerald-500/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="rounded border-emerald-500/30 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                        <span>Send Ticket Confirmation on WhatsApp</span>
                      </span>
                    </label>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold text-emerald-400 border border-emerald-500/20 uppercase">
                      Official Line: 8767164611
                    </span>
                  </div>

                  {sendWhatsApp && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        WhatsApp Mobile Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400 font-mono">
                          +91
                        </span>
                        <input
                          type="text"
                          value={whatsAppPhone}
                          onChange={(e) => setWhatsAppPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="8767164611"
                          className="w-full bg-slate-950/80 rounded-xl border border-emerald-500/30 pl-11 pr-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                      <p className="text-[10px] text-emerald-300/80">
                        Your official ticket pass with venue details and QR token will be delivered via WhatsApp from <strong>+91 8767164611</strong>.
                      </p>
                    </div>
                  )}
                </div>
                )}

                {/* SPLIT BILLING DETAILS */}
                {booking.isSplitBooking && (
                  <div className="mt-6 border-t border-white/[0.06] pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-display font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="h-4 w-4.5 text-[#ff2a54]" />
                        <span>Shared Group Splitting Status</span>
                      </span>
                      <span className="rounded-full bg-[#e23744]/15 px-3 py-1 text-[10px] font-extrabold text-[#ff2a54] uppercase border border-[#e23744]/25">
                        {booking.splitShares?.filter((s: SplitShareView) => s.status === "PAID").length || 0} / {booking.splitShares?.length || 0} Paid
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      Each friend has their own portion. The main booking is confirmed instantly when all portions are paid in full.
                    </p>

                    <div className="space-y-3">
                      {booking.splitShares?.map((share: SplitShareView) => {
                        const isPaid = share.status === "PAID";
                        const isMe = user?.email === share.email;

                        return (
                          <div
                            key={share.id}
                            className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                              isPaid
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-white/[0.02] border-white/[0.06]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">
                                  {share.friendName}
                                </span>
                                {isMe && (
                                  <span className="rounded-lg bg-[#e23744]/20 px-2 py-0.5 text-[9px] font-bold text-[#ff2a54] uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-xs">
                                {share.email}
                              </p>
                              <p className="text-xs font-black text-[#ff2a54] mt-1">
                                Share Due: {formatPrice(share.amount)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle className="h-3 w-3" />
                                  PAID
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300 border border-amber-500/20 animate-pulse">
                                    <Clock className="h-3 w-3 animate-spin" />
                                    PENDING
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handlePayFriendShare(share.id)}
                                    disabled={sharePayLoadingId === share.id}
                                    className="district-btn-primary rounded-xl px-3.5 py-1.5 text-[10px] font-bold text-white disabled:opacity-50 cursor-pointer transition active:scale-95"
                                  >
                                    {sharePayLoadingId === share.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin text-white" />
                                    ) : (
                                      "Simulate Pay"
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Copiable Friend Invite Link Box */}
                    <div className="bg-white/[0.02] rounded-2xl p-4.5 border border-white/[0.06] space-y-3">
                      <div className="flex items-center gap-1.5 text-white font-display font-bold text-xs uppercase tracking-wide">
                        <Share2 className="h-4 w-4 text-[#ff2a54] animate-pulse" />
                        <span>Dynamic Share Payment Link</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        Copy this secure direct payment portal link and send it to your group friends so they can process their custom invoice.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${window.location.origin}?payShareBookingId=${bookingId}`}
                          className="flex-1 bg-[#14141b] rounded-xl border border-white/[0.08] px-3 py-1.5 text-[10px] font-mono text-zinc-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="district-btn-primary rounded-xl text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition"
                        >
                          {copied ? (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/1 p-5 flex items-start gap-3.5 shadow-xl">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Happenins Secure Gateway</p>
              <p className="text-xs mt-1 text-slate-400 leading-relaxed">
                Your ticket locks are safely secured within our isolated transaction pools. Complete checkout to finalize registration and generate verified gate-entry check-in signed QR passes.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Column */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-6 shadow-2xl relative">
            <h2 className="text-base font-display font-black text-white mb-4 flex items-center gap-2">
              {isWalletFullyCovered ? (
                <>
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <span>Wallet 100% Payment</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-[#ff2a54]" />
                  <span>{booking?.razorpayOrderId ? "Secure Gateway Checkout" : "Simulate Sandbox Checkout"}</span>
                </>
              )}
            </h2>

            {isWalletFullyCovered ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">100% Paid with Happenins Wallet</h3>
                    <p className="text-xs text-emerald-300/80 mt-1">
                      No additional payment card required. Your ticket order will be confirmed instantly using your wallet refund credits.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckoutSubmit()}
                  disabled={payLoading || timeLeft === "EXPIRED"}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition disabled:opacity-50"
                >
                  {payLoading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Confirm & Book with Happenins Wallet</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <>
                {booking?.razorpayOrderId && (
                  <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-300 leading-relaxed font-semibold">
                    🔒 Razorpay Production Key Connected
                    <p className="mt-1 text-zinc-400 font-normal">
                      Your ticket inventory has been safely locked and signed by the security module. Press the confirmation button below to launch the checkout portal.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-4 rounded-xl bg-rose-500/10 p-2.5 text-xs text-rose-300 font-medium border border-rose-500/20">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  {booking?.razorpayOrderId ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                          Billing Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>
                      
                      <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.08] text-xs text-zinc-300 font-medium leading-relaxed">
                        Order Reference: <strong className="font-mono text-white bg-black/60 px-2 py-0.5 rounded">{booking.razorpayOrderId}</strong>
                        <p className="mt-2 text-[11px] text-zinc-400 font-normal">
                          The transaction amount is processed in real currency. Make sure to complete the popup dialogue in the foreground.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                            Cardholder Full Name
                          </label>
                          <button
                            type="button"
                            onClick={fillDemoValues}
                            className="text-[10px] font-semibold text-[#ff2a54] hover:text-[#e23744] flex items-center gap-1 cursor-pointer focus:outline-none transition"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Auto-Fill Test Account</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="4111 •••• •••• 1111"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 font-mono">
                            Security CVV Code
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Complete checkout button */}
                  <button
                    type="submit"
                    disabled={payLoading || timeLeft === "EXPIRED"}
                    className="district-btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold text-white uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {payLoading ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>{booking?.razorpayOrderId ? "Launch Razorpay Checkout" : "Authorize & Confirm Payment"}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
