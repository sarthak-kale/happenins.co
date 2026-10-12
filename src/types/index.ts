export type UserRole = "USER" | "ORGANIZER" | "ADMIN";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  isEmailVerified?: boolean;
  phone?: string;
}

export type EventStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "PUBLISHED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type BookingStatus =
  | "RESERVED"
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED";

export type InstitutionType =
  | "COLLEGE"
  | "UNIVERSITY"
  | "SCHOOL"
  | "COMPANY"
  | "ORGANIZATION"
  | "OTHER";

export type EventPolicyType = "PUBLIC" | "INSTITUTION_ONLY" | "INVITE_ONLY";

export interface InstitutionDomainDTO {
  id: string;
  institutionId: string;
  domain: string;
  isVerified: boolean;
  createdAt: string;
}

export interface InstitutionDTO {
  id: string;
  name: string;
  slug: string;
  type: InstitutionType;
  logoUrl: string | null;
  primaryDomain: string;
  isVerified: boolean;
  domains: InstitutionDomainDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface EventAccessPolicyDTO {
  id: string;
  eventId: string;
  policyType: EventPolicyType;
  allowedDomains: string[];
  requireVerifiedEmail: boolean;
  allowFreeTickets: boolean;
  customRestrictionMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventEligibilityDTO {
  eligible: boolean;
  userEmail: string | null;
  userDomain: string | null;
  policyType: EventPolicyType;
  allowedDomains: string[];
  requireVerifiedEmail: boolean;
  matchedInstitution?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    primaryDomain: string;
  } | null;
  reason?: string | null;
}

export interface EventDTO {
  id: string;
  organizerId: string;
  organizerName: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  bannerUrl: string | null;
  locationType: "VENUE" | "ONLINE";
  venue: string | null;
  city: string | null;
  status: EventStatus;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  ticketTiers: TicketTierDTO[];
  hasSeatingPlan?: boolean;
  seatingRows?: number;
  seatingCols?: number;
  accessPolicy?: EventAccessPolicyDTO | null;
}

export interface TicketTierDTO {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number; // in cents
  capacity: number;
  reserved: number;
  sold: number;
}

export interface BookingDTO {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  status: BookingStatus;
  invoiceNumber: string;
  reservedUntil: string;
  totalAmount: number; // in cents
  discountAmount?: number; // in cents
  promoCodeId?: string | null;
  promoCode?: string | null;
  eventStartsAt?: string | null;
  eventEndsAt?: string | null;
  eventVenue?: string | null;
  createdAt: string;
  items: BookingItemDTO[];
  payments: PaymentDTO[];
  qrHash?: string;
  scannedAt?: string | null;
  razorpayOrderId?: string;
  razorpayKeyId?: string;
  isSplitBooking?: boolean;
  splitTotalShares?: number;
  splitShares?: BookingSplitShareDTO[];
  transfers?: TicketTransferDTO[];
  walletAmountApplied?: number;
  cancellationFee?: number;
  refundAmount?: number;
  cancelledAt?: string | null;
  cancelledReason?: string | null;
  cancellationReason?: string | null;
  verifiedCollegeEmail?: string | null;
}

export interface WalletTransactionDTO {
  id: string;
  walletId: string;
  type: "CREDIT" | "DEBIT";
  reason: "TICKET_CANCELLATION" | "TICKET_PURCHASE" | "PROMO_BONUS" | "ADMIN_ADJUSTMENT";
  category?: string;
  amount: number; // in cents/paise
  balanceAfter: number; // in cents/paise
  description?: string | null;
  bookingId?: string | null;
  referenceId?: string | null;
  createdAt: string;
}

export interface WalletDTO {
  id: string;
  userId: string;
  balance: number; // in cents/paise
  createdAt: string;
  updatedAt: string;
  transactions: WalletTransactionDTO[];
}

export interface CancellationPreviewDTO {
  canCancel: boolean;
  tier: "STANDARD_TIER" | "MID_TIER" | "LAST_MINUTE_TIER" | "NON_REFUNDABLE" | "FREE_TICKET";
  feePercentage: number;
  refundPercentage: number;
  originalAmount: number; // in paise
  cancellationFee: number; // in paise
  refundAmount: number; // in paise
  hoursUntilEvent: number;
  policySummary: string;
  reason?: string;
  cancellationFeePercentage?: number;
  totalAmountPaid?: number;
  tierDescription?: string;
  policyExplanation?: string;
}

export interface WhatsAppNotificationDTO {
  senderNumber: string;
  senderNumberFormatted: string;
  toPhoneNumber: string;
  message: string;
  directUrl: string;
  type: "TICKET_CONFIRMATION" | "BOOKING_CANCELLATION" | "WALLET_REFUND";
  timestamp: string;
}

export interface BookingItemDTO {
  id: string;
  ticketTierId: string;
  tierName: string;
  price: number;
  quantity: number;
  subtotal: number;
  seatNumbers?: string | null;
}

export interface PaymentDTO {
  id: string;
  transactionId: string;
  amount: number;
  method: string;
  createdAt: string;
}

export interface PromoCodeDTO {
  id: string;
  code: string;
  eventId: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export interface OrganizerAnalytics {
  totalRevenue: number; // cents
  ticketsSoldCount: number;
  ticketsReservedCount: number;
  totalEventsCount: number;
  activeEventsCount: number;
  tierBreakdown: {
    name: string;
    sold: number;
    revenue: number;
  }[];
  salesOverTime: {
    date: string;
    ticketsSold: number;
    revenue: number;
  }[];
  categoryRevenue?: {
    category: string;
    revenue: number;
  }[];
  checkInRatio?: {
    checkedIn: number;
    pending: number;
    total: number;
    percentage: number;
  };
}

export interface EventOverviewAnalyticsDTO {
  event: {
    id: string;
    title: string;
    slug: string;
    category: string;
    status: EventStatus;
    locationType: "VENUE" | "ONLINE";
    venue?: string | null;
    city?: string | null;
    startsAt: string;
    endsAt: string;
    bannerUrl?: string | null;
    hasSeatingPlan?: boolean;
    isPassed: boolean;
  };
  metrics: {
    totalRevenue: number;
    ticketsSold: number;
    ticketsReserved: number;
    totalCapacity: number;
    ticketsRemaining: number;
    overallOccupancyRate: number;
  };
  tierBreakdown: Array<{
    id: string;
    name: string;
    description?: string | null;
    price: number;
    capacity: number;
    sold: number;
    reserved: number;
    remaining: number;
    revenue: number;
    occupancyRate: number;
  }>;
  checkInRatio: {
    checkedIn: number;
    pending: number;
    total: number;
    percentage: number;
  };
  seatingStats?: {
    totalSeats: number;
    soldSeats: number;
    heldSeats: number;
    availableSeats: number;
    configuredSeatsCount: number;
  } | null;
  promoCodes: Array<{
    id: string;
    code: string;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    usedCount: number;
    maxUses: number | null;
    expiresAt: string | null;
  }>;
  attendeeRoster: Array<{
    bookingId: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    passCode?: string;
    ticketsCount: number;
    tierNames: string;
    totalAmount: number;
    hasCheckedIn: boolean;
    createdAt: string;
  }>;
}

export interface AdminAnalytics {
  totalRevenue: number;
  ticketsSoldCount: number;
  eventsCount: number;
  organizersCount: number;
  lifecycle: Record<string, number>;
}

export interface AdminOrganizerProfile {
  id: string;
  userId: string;
  companyName: string;
  logoUrl: string | null;
  website: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
}

export interface AdminAuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  } | null;
}

export interface ReviewDTO {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BookingSplitShareDTO {
  id: string;
  bookingId: string;
  friendName: string;
  email: string;
  amount: number; // in cents
  isPaid: boolean;
  paymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface TicketTransferDTO {
  id: string;
  bookingId: string;
  ticketId?: string | null;
  eventTitle: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName?: string | null;
  transferCode: string;
  status: "PENDING" | "CLAIMED" | "CANCELLED" | "EXPIRED";
  claimedByUserId?: string | null;
  claimedAt?: string | null;
  note?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface TicketDTO {
  id: string;
  ticketNumber: string;
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventVenue: string | null;
  eventStartsAt: string;
  eventEndsAt: string;
  tierId: string;
  tierName: string;
  price: number;
  ownerUserId: string;
  ownerName?: string;
  ownerEmail?: string;
  seatNumber?: string | null;
  status: "RESERVED" | "CONFIRMED" | "CANCELLED" | "REFUNDED" | "TRANSFERRED";
  qrToken?: string | null;
  scannedAt?: string | null;
  scannedByUserId?: string | null;
  verifiedCollegeEmail?: string | null;
  createdAt: string;
}

export interface InstitutionOtpSendRequest {
  eventId: string;
  collegeEmail: string;
}

export interface InstitutionOtpSendResponse {
  success: boolean;
  message: string;
  collegeEmail: string;
  expiresAt: string;
  debugOtp?: string;
  institutionName?: string;
}

export interface InstitutionOtpVerifyRequest {
  eventId: string;
  collegeEmail: string;
  otp: string;
}

export interface InstitutionOtpVerifyResponse {
  success: boolean;
  message: string;
  verificationToken: string;
  verifiedCollegeEmail: string;
}

export interface InstitutionOtpStatusResponse {
  isVerified: boolean;
  verifiedCollegeEmail?: string | null;
  institutionName?: string | null;
  verifiedAt?: string | null;
}

export interface EventSeatDTO {
  id: string;
  eventId: string;
  seatLabel: string;
  status: "AVAILABLE" | "HELD" | "SOLD";
  bookingId?: string | null;
  heldUntil?: string | null;
}

export interface StaffScannerDTO {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  eventVenue: string | null;
  eventStartsAt: string;
  eventEndsAt: string;
  staffName: string;
  pin: string;
  gateName: string;
  allowedTiers: string; // "ALL" or JSON stringified array of tier names
  allowedTierNames?: string[];
  isActive: boolean;
  expiresAt: string | null;
  scansCount: number;
  lastScannedAt: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface VentureStaffScannerDTO {
  id: string;
  ventureEventId: string;
  staffName: string;
  pin: string;
  gateName: string;
  isActive: boolean;
  scansCount: number;
  lastScannedAt: string | null;
  expiresAt: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface StaffScannerSession {
  staffScannerId: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  eventVenue: string | null;
  eventStartsAt: string;
  eventEndsAt: string;
  staffName: string;
  gateName: string;
  allowedTiers: string;
  allowedTierNames: string[];
  token: string;
  expiresAt: string | null;
  isVenture?: boolean;
}

export interface GateScanResultDTO {
  success: boolean;
  message: string;
  gateName: string;
  scannerType: "STAFF_PIN" | "ORGANIZER" | "ADMIN";
  staffName?: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    tierName: string;
    seatNumber?: string | null;
    ownerName?: string;
    eventTitle: string;
    status: string;
    scannedAt?: string | null;
  };
  warning?: string;
  scannedAt: string;
  gateScansCount?: number;
}

export interface GateBreakdownStats {
  gateName: string;
  scansCount: number;
  activeScannersCount: number;
  lastScannedAt: string | null;
  staffMembers: Array<{
    id: string;
    staffName: string;
    pin: string;
    scansCount: number;
    isActive: boolean;
    lastScannedAt: string | null;
  }>;
}

export interface GateOverviewStatsDTO {
  eventId: string;
  eventTitle: string;
  totalEventTicketsSold: number;
  totalAdmittedCount: number;
  pendingCount: number;
  overallAdmittanceRate: number;
  gates: GateBreakdownStats[];
}

export interface QueueStatusDTO {
  status: "ADMITTED" | "QUEUED";
  admissionToken?: string;
  expiresAt?: string;
  queuePosition?: number;
  totalInQueue?: number;
  estimatedWaitSeconds?: number;
  activeSessions?: number;
  maxCapacity?: number;
}


export interface SimulatedEmailDTO {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

/** Public transfer details returned by GET /transfers/:code */
export interface TransferDetailsDTO {
  id: string;
  bookingId: string;
  eventTitle: string;
  eventBannerUrl: string | null;
  eventStartsAt: string | null;
  eventVenue: string | null;
  tierName: string;
  quantity: number;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string | null;
  transferCode: string;
  status: TicketTransferDTO["status"];
  claimedByUserId?: string | null;
  claimedAt: string | null;
  note: string | null;
  expiresAt: string;
  createdAt: string;
}
