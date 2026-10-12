import React, { useState, useEffect } from "react";
import { BookingDTO, TicketTransferDTO, WalletDTO } from "../types";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatRupees } from "../lib/formatters";
import { Ticket, Loader2, Wallet, Sparkles } from "lucide-react";
import { CancellationModal } from "../components/CancellationModal";
import { WhatsAppModal } from "../components/WhatsAppModal";
import { WalletModal } from "../components/WalletModal";
import {
  BookingFilter,
  isEventPastOrCheckedIn,
  getClaimUrl,
  handleShareWhatsApp,
} from "./tickets/helpers";
import { useDynamicQR } from "./tickets/useDynamicQR";
import { BookingList } from "./tickets/BookingList";
import { TicketPass } from "./tickets/TicketPass";
import { TransferModal } from "./tickets/TransferModal";
import { getErrorMessage } from "../lib/errors";

export const Tickets: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);

  // Dropdown / Filter state
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Happenins Wallet State
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Cancellation & WhatsApp Modal states
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);


  // Ticket Transfer Modal state
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferEmail, setTransferEmail] = useState<string>("");
  const [transferName, setTransferName] = useState<string>("");
  const [transferNote, setTransferNote] = useState<string>("");
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [transferError, setTransferError] = useState<string>("");
  const [transferSuccess, setTransferSuccess] = useState<string>("");
  const [createdTransfer, setCreatedTransfer] = useState<TicketTransferDTO | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);


  const loadMyTickets = async () => {
    if (authLoading) return;
    if (!user) {
      setBookings([]);
      setSelectedBooking(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [list, walletData] = await Promise.all([
        api.getMyBookings(),
        api.getWallet().catch(() => null),
      ]);
      setBookings(list);
      if (walletData) setWallet(walletData);
      if (list.length > 0) {
        // Default to first confirmed upcoming booking if available
        const upcomingConfirmed = list.find((b) => b.status === "CONFIRMED" && !isEventPastOrCheckedIn(b));
        setSelectedBooking(upcomingConfirmed || list[0]);
      } else {
        setSelectedBooking(null);
      }
    } catch (err: unknown) {
      setError("Failed to fetch your tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, [user, authLoading]);

  // Dynamic Rotating QR Code state
  const { qrCodeDataUrl, qrExpiresIn, refreshingQR, fetchDynamicToken } = useDynamicQR(selectedBooking);

  // Filter Bookings counts
  const upcomingCount = bookings.filter((b) => b.status === "CONFIRMED" && !isEventPastOrCheckedIn(b)).length;
  const pastCount = bookings.filter((b) => isEventPastOrCheckedIn(b) || (b.status === "CONFIRMED" && b.scannedAt !== null)).length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED" || b.transfers?.some((t) => t.status === "CLAIMED")).length;

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "upcoming") {
      if (!(b.status === "CONFIRMED" && !isEventPastOrCheckedIn(b))) return false;
    } else if (bookingFilter === "past") {
      if (!(isEventPastOrCheckedIn(b) || (b.status === "CONFIRMED" && b.scannedAt !== null))) return false;
    } else if (bookingFilter === "cancelled") {
      if (!(b.status === "CANCELLED" || b.transfers?.some((t) => t.status === "CLAIMED"))) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = b.eventTitle?.toLowerCase().includes(q);
      const invMatch = b.invoiceNumber?.toLowerCase().includes(q);
      return titleMatch || invMatch;
    }
    return true;
  });

  // When filter changes, select first available booking in the list
  useEffect(() => {
    if (filteredBookings.length > 0) {
      if (!selectedBooking || !filteredBookings.some((b) => b.id === selectedBooking.id)) {
        setSelectedBooking(filteredBookings[0]);
      }
    }
  }, [bookingFilter]);

  // Ticket Transfer Handlers
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    if (!transferEmail || !transferEmail.includes("@")) {
      setTransferError("Please enter a valid recipient email address.");
      return;
    }

    setTransferLoading(true);
    setTransferError("");
    setTransferSuccess("");

    try {
      const transfer = await api.createTicketTransfer(
        selectedBooking.id,
        transferEmail,
        transferName,
        transferNote
      );
      setCreatedTransfer(transfer);
      setTransferSuccess(`Ticket transfer invite created! Sent email to ${transferEmail}`);
      loadMyTickets();
    } catch (err: unknown) {
      setTransferError(getErrorMessage(err) || "Failed to create ticket transfer.");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCopyClaimLink = (code: string) => {
    const url = getClaimUrl(code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  const handleCancelTransfer = async (transferId: string) => {
    try {
      await api.cancelTicketTransfer(transferId);
      loadMyTickets();
      if (createdTransfer?.id === transferId) {
        setCreatedTransfer(null);
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err) || "Failed to cancel transfer.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#e23744]" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center bg-[#0c0c11] border border-white/[0.08] rounded-3xl shadow-2xl relative z-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e23744]/10 text-[#ff2a54] mx-auto mb-4 border border-[#e23744]/20">
          <Ticket className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-display font-black text-white">No Passes Booked Yet</h2>
        <p className="text-sm mt-2 text-zinc-400 leading-relaxed">
          Your passes dashboard is completely empty. Explore upcoming experiences to book live gigs, concerts, or meetups.
        </p>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 relative z-10 space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      {/* Happenins Wallet Balance Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c11] p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#e23744] to-[#ff2a54] p-0.5 shadow-lg shadow-[#e23744]/20 flex items-center justify-center text-white shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-mono">
                Happenins Wallet Balance
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                Auto-Applied on Checkout
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-white tracking-tight font-display">
                {wallet ? formatRupees(wallet.balance) : "₹0.00"}
              </span>
              <span className="text-[11px] text-zinc-400">
                (Refunds from cancellations stored safely for your next passes)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWalletModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#ff2a54]" />
            <span>Open Wallet & Activity</span>
          </button>
        </div>
      </div>

      {/* Structured tickets grid: Left list with Dropdown Filter, Right selected pass */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Left column list */}
        <BookingList
          bookings={bookings}
          filteredBookings={filteredBookings}
          selectedBooking={selectedBooking}
          bookingFilter={bookingFilter}
          setBookingFilter={setBookingFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          upcomingCount={upcomingCount}
          pastCount={pastCount}
          cancelledCount={cancelledCount}
          onSelect={(b) => {
            setSelectedBooking(b);
            setCreatedTransfer(null);
            setTransferSuccess("");
            setTransferError("");
          }}
        />

        {/* Right column: Selected digital ticket pass */}
        <TicketPass
          selectedBooking={selectedBooking}
          qrCodeDataUrl={qrCodeDataUrl}
          qrExpiresIn={qrExpiresIn}
          refreshingQR={refreshingQR}
          fetchDynamicToken={fetchDynamicToken}
          onOpenTransfer={() => {
            setShowTransferModal(true);
            setTransferEmail("");
            setTransferName("");
            setTransferNote("");
            setTransferError("");
            setTransferSuccess("");
            setCreatedTransfer(null);
          }}
          onOpenWhatsApp={() => setShowWhatsAppModal(true)}
          onOpenCancel={() => setShowCancelModal(true)}
          onCancelTransfer={handleCancelTransfer}
        />
      </div>

      {/* TICKET TRANSFER MODAL */}
      {showTransferModal && selectedBooking && (
        <TransferModal
          selectedBooking={selectedBooking}
          transferEmail={transferEmail}
          setTransferEmail={setTransferEmail}
          transferName={transferName}
          setTransferName={setTransferName}
          transferNote={transferNote}
          setTransferNote={setTransferNote}
          transferLoading={transferLoading}
          transferError={transferError}
          transferSuccess={transferSuccess}
          createdTransfer={createdTransfer}
          copiedLink={copiedLink}
          onClose={() => setShowTransferModal(false)}
          onSubmit={handleInitiateTransfer}
          onCopyClaimLink={handleCopyClaimLink}
          onShareWhatsApp={handleShareWhatsApp}
        />
      )}

      {/* HAPPENINS WALLET MODAL */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          loadMyTickets();
        }}
        onExploreEvents={() => {
          window.location.href = "/";
        }}
      />

      {/* CANCELLATION & POLICY REFUND MODAL */}
      {selectedBooking && (
        <CancellationModal
          booking={selectedBooking}
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancelled={({ walletBalance }) => {
            setShowCancelModal(false);
            setWallet((prev) => (prev ? { ...prev, balance: walletBalance } : null));
            loadMyTickets();
          }}
        />
      )}

      {/* WHATSAPP TICKET DISPATCH MODAL */}
      {selectedBooking && (
        <WhatsAppModal
          booking={selectedBooking}
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}
    </div>
  );
};
