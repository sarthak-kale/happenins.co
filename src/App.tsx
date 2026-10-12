import React, { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FeaturesProvider, useFeatures } from "./context/FeaturesContext";
import { Navigation } from "./components/Navigation";
import { EventDTO } from "./types";
import { api } from "./lib/api";
import { Sparkles, Heart, ShieldAlert, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LogoIcon, LogoFull } from "./components/Logo";
import { AppLaunchScreen } from "./components/AppLaunchScreen";
import { getErrorMessage } from "./lib/errors";

// Each page is its own chunk: visitors download only the screen they open
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const EventDetails = lazy(() => import("./pages/EventDetails").then((m) => ({ default: m.EventDetails })));
const Checkout = lazy(() => import("./pages/Checkout").then((m) => ({ default: m.Checkout })));
const Tickets = lazy(() => import("./pages/Tickets").then((m) => ({ default: m.Tickets })));
const OrganizerCatalog = lazy(() => import("./pages/OrganizerCatalog").then((m) => ({ default: m.OrganizerCatalog })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const ScannerConsole = lazy(() => import("./pages/ScannerConsole").then((m) => ({ default: m.ScannerConsole })));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings").then((m) => ({ default: m.ProfileSettings })));
const Login = lazy(() => import("./pages/Login").then((m) => ({ default: m.Login })));
const ClaimTicket = lazy(() => import("./pages/ClaimTicket").then((m) => ({ default: m.ClaimTicket })));
const VentureVault = lazy(() => import("./pages/VentureVault").then((m) => ({ default: m.VentureVault })));
const VenturePassView = lazy(() => import("./pages/VenturePassView").then((m) => ({ default: m.VenturePassView })));

const OAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (!code) {
          throw new Error("No authorization code was returned from Google.");
        }

        // Call backend to exchange code using the same redirect URI
        const redirectUri = `${window.location.origin}/auth/callback`;
        const data = await api.exchangeGoogleCode(code, redirectUri);

        // Session cookies are HttpOnly; only a non-sensitive completion signal is shared with the opener
        localStorage.setItem("happenins_oauth_done", String(Date.now()));

        setStatus("success");
        setTimeout(() => {
          // Post message to opener, parent, top window
          const payload = { type: "OAUTH_AUTH_SUCCESS" };
          try { if (window.opener) window.opener.postMessage(payload, window.location.origin); } catch (e) {}
          try { if (window.parent && window.parent !== window) window.parent.postMessage(payload, window.location.origin); } catch (e) {}
          try { if (window.top && window.top !== window) window.top.postMessage(payload, window.location.origin); } catch (e) {}
          
          try {
            window.close();
          } catch (e) {}

          // Fallback redirect if window didn't close
          setTimeout(() => {
            window.location.href = "/";
          }, 400);
        }, 800);
      } catch (err: unknown) {
        console.error("Google OAuth Handshake Code Exchange error:", err);
        setStatus("error");
        setErrorMsg(getErrorMessage(err) || "An authentication error occurred.");
      }
    };

    exchangeCode();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#060608] p-6 text-center font-sans">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0c0c11] p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-[#e23744]/15 border border-[#e23744]/30 flex items-center justify-center text-[#ff2a54] font-black text-xl shadow-inner animate-pulse">
            H
          </div>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Verifying Credentials</h2>
            <div className="flex justify-center py-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54]" />
            </div>
            <p className="text-xs text-zinc-400">
              Communicating securely with Google services. Please do not close this window.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-400">Authentication Successful!</h2>
            <p className="text-xs text-zinc-400">
              Handshake complete. This window is closing automatically.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-rose-500">Verification Failed</h2>
            <div className="rounded-lg bg-rose-950/40 p-3 text-xs text-rose-300 text-left border border-rose-500/30">
              {errorMsg}
            </div>
            <button
              onClick={() => window.close()}
              className="district-btn-primary w-full py-2.5 text-xs font-bold text-white uppercase tracking-wider transition cursor-pointer"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { isEnabled } = useFeatures();
  const [currentView, setView] = useState<string>("home");
  const [selectedEvent, setSelectedEvent] = useState<EventDTO | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [resetTokenData, setResetTokenData] = useState<{ token?: string; otp?: string; email?: string } | null>(null);
  const [showConsent, setShowConsent] = useState<boolean>(() => {
    return localStorage.getItem("happenins-consent-accepted") !== "true";
  });
  const [showSplash, setShowSplash] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<"terms" | "privacy">("terms");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payShareBookingId = params.get("payShareBookingId");
    if (payShareBookingId) {
      setPendingBookingId(payShareBookingId);
      setView("checkout");
      // Clean up URL query parameters so it does not persist on subsequent reloads
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const viewParam = params.get("view");
    const tokenParam = params.get("token") || params.get("resetToken");
    const otpParam = params.get("otp");
    const emailParam = params.get("email");

    if (
      window.location.pathname === "/reset-password" ||
      window.location.pathname.startsWith("/reset-password") ||
      viewParam === "reset-password" ||
      viewParam === "reset_password" ||
      tokenParam ||
      otpParam
    ) {
      setResetTokenData({
        token: tokenParam || undefined,
        otp: otpParam || undefined,
        email: emailParam || undefined,
      });
      setView("reset-password");
    }

    if (
      window.location.pathname === "/venture" ||
      window.location.pathname === "/venture-vault" ||
      viewParam === "venture"
    ) {
      setView("venture");
    }
  }, []);

  // Check if this window context is handling the Google OAuth callback redirect
  if (window.location.pathname === "/auth/callback" || window.location.pathname === "/auth/callback/") {
    return <OAuthCallback />;
  }

  // Check if attendee opened a Venture Vault Pass link
  const venturePassMatch = window.location.pathname.match(/\/(?:venture-pass|vpass)\/([A-Za-z0-9_-]+)/);
  if (venturePassMatch) {
    const token = venturePassMatch[1];
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#060608] flex items-center justify-center text-white"><Loader2 className="h-8 w-8 animate-spin text-[#ff2a54]" /></div>}>
        <VenturePassView token={token} initialRound={3} />
      </Suspense>
    );
  }

  // Check if user opened a Ticket Transfer claim link
  const claimCodeMatch = window.location.pathname.match(/\/claim-ticket\/([A-Za-z0-9-]+)/);
  if (claimCodeMatch) {
    const code = claimCodeMatch[1];
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navigation currentView="claim" setView={() => { window.location.href = "/"; }} onSearch={() => {}} />
        <ClaimTicket
          transferCode={code}
          onClaimedSuccess={() => {
            window.location.href = "/";
          }}
        />
      </div>
    );
  }

  const handleAcceptConsent = () => {
    localStorage.setItem("happenins-consent-accepted", "true");
    setShowConsent(false);
  };

  const handleSelectEvent = (event: EventDTO) => {
    setSelectedEvent(event);
    setView("event-details");
  };

  const handleReserved = (bookingId: string) => {
    setPendingBookingId(bookingId);
    setView("checkout");
  };

  const handleCheckoutCompleted = () => {
    setPendingBookingId(null);
    setView("my-tickets");
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "home":
        return <Home onSelectEvent={handleSelectEvent} />;
      case "login":
        return <Login onSuccess={() => setView("home")} initialMode="login" />;
      case "register":
        return <Login onSuccess={() => setView("home")} initialMode="register" />;
      case "reset-password":
        return (
          <Login
            onSuccess={() => setView("home")}
            initialMode="reset_password"
            initialResetData={resetTokenData || undefined}
            onNavigateToLogin={() => setView("login")}
          />
        );
      case "event-details":
        if (!selectedEvent) {
          setView("home");
          return null;
        }
        return (
          <EventDetails
            event={selectedEvent}
            onBack={() => setView("home")}
            onReserved={handleReserved}
          />
        );
      case "checkout":
        if (!pendingBookingId) {
          setView("home");
          return null;
        }
        return (
          <Checkout
            bookingId={pendingBookingId}
            onCancel={() => setView("event-details")}
            onCompleted={handleCheckoutCompleted}
          />
        );
      case "my-tickets":
        if (!user) {
          return <Login onSuccess={() => setView("my-tickets")} initialMode="login" />;
        }
        return <Tickets />;
      case "settings":
        if (!user) {
          return <Login onSuccess={() => setView("settings")} initialMode="login" />;
        }
        return <ProfileSettings />;
      case "organizer-dashboard":
      case "onboard-organizer":
        if (!user) {
          return <Login onSuccess={() => setView(currentView)} initialMode="login" />;
        }
        if (user.role === "ADMIN") {
          return <AdminDashboard />;
        }
        return (
          <OrganizerCatalog
            onNavigateToScanner={() => setView("scan")}
            onNavigateToVenture={() => setView("venture")}
          />
        );
      case "scan":
        if (!isEnabled("STAFF_SCANNERS")) {
          return (
            <div className="mx-auto max-w-md px-4 py-16 text-center">
              <div className="rounded-3xl border border-white/10 bg-[#0a0a20]/60 p-8 backdrop-blur-xl">
                <h2 className="text-lg font-display font-bold text-white">Gate scanning is not enabled</h2>
                <p className="text-xs mt-2 text-slate-400 leading-relaxed">Ticket scanner access is currently switched off.</p>
              </div>
            </div>
          );
        }
        return <ScannerConsole onNavigateToOrganizer={() => setView("organizer-dashboard")} onNavigateToLogin={() => setView("login")} />;
      case "venture":
        if (authLoading) {
          return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54] mb-3" />
              <span className="text-xs font-mono text-zinc-400">Authenticating Access...</span>
            </div>
          );
        }
        if (!user || user.email?.toLowerCase() !== "pacific2306@gmail.com") {
          return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center font-sans">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
                <ShieldAlert className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold font-display text-white">404 - Page Not Found</h2>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm leading-relaxed">
                The requested URL was not found on this server.
              </p>
              <button
                onClick={() => setView("home")}
                className="district-btn-primary mt-6 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          );
        }
        return <VentureVault />;
      default:
        return <Home onSelectEvent={handleSelectEvent} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <AppLaunchScreen
          key="launch"
          isAppReady={!authLoading}
          onComplete={() => setShowSplash(false)}
        />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-[#060608] text-zinc-100 flex flex-col font-sans selection:bg-[#e23744]/30 selection:text-white relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e23744]/5 rounded-full blur-[140px] pointer-events-none z-0" />
          <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#ff2a54]/4 rounded-full blur-[160px] pointer-events-none z-0" />

          {/* Sticky Premium navigation headers */}
          <Navigation
            currentView={currentView}
            setView={(v) => {
              setView(v);
              // clear stale context when moving to home
              if (v === "home") {
                setSelectedEvent(null);
                setPendingBookingId(null);
              }
            }}
            onSearch={() => {}}
          />

          {/* Primary view content segment */}
          <main className="flex-1 animate-fade-in relative z-10 pb-20 md:pb-0">
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-[#ff2a54]" />
                </div>
              }
            >
              {renderActiveView()}
            </Suspense>
          </main>

          {/* Standard structural page footer */}
          <footer className="border-t border-white/5 bg-[#0c0c11]/80 backdrop-blur-md py-8 text-center text-xs text-zinc-400 font-medium relative z-10 mb-14 md:mb-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="flex items-center gap-1">
                <span>Made with</span>
                <Heart className="h-3.5 w-3.5 text-[#e23744] fill-[#e23744]" />
                <span>for Local Communities worldwide. © {new Date().getFullYear()} Happenins.</span>
              </p>
              <div className="flex gap-4">
                <button onClick={() => setView("home")} className="hover:text-[#ff2a54] transition cursor-pointer">
                  Explore Catalog
                </button>
                <span className="text-white/10">|</span>
                <button onClick={() => setView("scan")} className="hover:text-[#ff2a54] transition cursor-pointer">
                  Security Gate Scanner
                </button>
              </div>
            </div>
          </footer>

          {/* Floating Terms & Conditions Banner */}
          {showConsent && (
            <div className="fixed bottom-4 inset-x-4 z-50 bg-[#0c0c11]/95 backdrop-blur-xl text-white shadow-2xl rounded-2xl p-4 sm:p-5 border border-white/10 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#e23744]/15 border border-[#e23744]/30 p-2.5 text-[#ff2a54] shrink-0 mt-0.5">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">Consent for a Safe Event Community</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                      We value your security and privacy. By interacting with the Happenins ticket marketplace, you consent to our <strong>Terms of Service</strong>, <strong>Cookie Usage Policies</strong>, and <strong>Centralized Audit Logs</strong>. These systems prevent clone-attacks, double-ticket check-ins, and ensure direct booking integrity.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                  <button 
                    onClick={() => setShowTermsModal(true)} 
                    className="text-xs font-bold text-zinc-400 hover:text-white underline py-2 px-3 transition cursor-pointer"
                  >
                    Read Terms & Conditions
                  </button>
                  <button
                    onClick={handleAcceptConsent}
                    className="district-btn-primary rounded-xl px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg cursor-pointer transition active:scale-95"
                  >
                    Accept & Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Custom terms & conditions modal */}
          {showTermsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="rounded-3xl max-w-3xl w-full border border-white/10 bg-[#0c0c11] shadow-2xl text-left text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#e23744]/10 border border-[#e23744]/20 rounded-xl text-[#ff2a54]">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-black text-white">Happenins Legal Gateway</h3>
                      <p className="text-xs text-zinc-400">Review terms of service and user privacy guarantees</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="rounded-xl p-2 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-white/5 bg-[#14141b]/60 p-1.5 gap-1.5">
                  <button
                    onClick={() => setTermsModalTab("terms")}
                    className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl ${
                      termsModalTab === "terms"
                        ? "bg-[#e23744] text-white shadow-lg shadow-[#e23744]/20 font-black"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Terms of Service
                  </button>
                  <button
                    onClick={() => setTermsModalTab("privacy")}
                    className={`flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl ${
                      termsModalTab === "privacy"
                        ? "bg-[#e23744] text-white shadow-lg shadow-[#e23744]/20 font-black"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Privacy Policy
                  </button>
                </div>

                {/* Scrollable Content Container */}
                <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300 font-medium leading-relaxed max-h-[50vh] scrollbar-thin scrollbar-thumb-white/10">
                  {termsModalTab === "terms" ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">1. Acceptance of Terms</h4>
                        <p className="text-xs text-zinc-400">
                          By accessing, registering, or checking in tickets through the Happenins ticket marketplace, you unconditionally agree to comply with and be legally bound by these Terms of Service. If you do not agree, you are restricted from utilizing the platform for bookings or verified organizer listings.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">2. Ticket Hold Reservations & Limits</h4>
                        <p className="text-xs text-zinc-400">
                          To assure equal opportunity for restricted capacity community meetups, live rock concerts, or strategic summits, ticket holds are locked for a maximum of 10 minutes upon initial checkout reservation. If a checkout is not fully settled with authorized payment details within 10 minutes, the hold expires and tickets are instantly released back to the general public catalog.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">3. Cryptographic Anti-Fraud Signatures</h4>
                        <p className="text-xs text-zinc-400">
                          Every single Happenins digital ticket contains a cryptographically sealed, unique QR hash code generated at order finalization. Attempts to clone, duplicate, or alter these QR codes will trigger instant security exceptions on the scanning gate consoles. Happenins holds zero liability for duplicate scan failures stemming from secondary market purchases or screen-sharing of QR codes.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">4. Split Booking Shares Policy</h4>
                        <p className="text-xs text-zinc-400">
                          If an attendee initiates a split ticket purchase, they act as the Primary Booking Holder. All assigned invitees must register their billing accounts and clear their pending split balances before the designated expiry window. Unsettled shares will result in either complete booking cancellation or forfeiture of selected slots without refund.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">5. Organizer and Event Compliance</h4>
                        <p className="text-xs text-zinc-400">
                          Event Organizers warrant that all descriptions, schedules, maps, and safety advisories listed on the Happenins portal are truthful and accurate. Happenins reserve absolute authority to freeze, lock, or erase listings that deviate from professional compliance, contain unauthorized content, or present public hazards.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">6. Cancellations, Reschedules, and Refunds</h4>
                        <p className="text-xs text-zinc-400">
                          Refund guidelines are independently managed by the direct Organizer of the event. Under standard conditions, cancellations requested more than 7 days prior to event start may be eligible for standard processing refunds. Transaction processing and platform gate commissions are strictly non-refundable.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">1. Scope of Data Collection</h4>
                        <p className="text-xs text-zinc-400">
                          Happenins collects essential information required to deliver, secure, and verify event credentials. This encompasses your direct registration data (legal name, secure login email, profile indicators), device logs (session tokens, regional IP logs), ticket receipt history, and cryptographic gate-scan validation logs.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">2. Purpose of Processing & Security Analytics</h4>
                        <p className="text-xs text-zinc-400">
                          We process your data exclusively to generate dynamic entry QR codes, process secure payouts, enforce the fair 10-minute capacity locking loops, prevent unauthorized ticket duplication, and offer organizer dashboard telemetry. We do not engage in background behavioral profiling or third-party ad brokers.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">3. Cookie & Local Persistence Policies</h4>
                        <p className="text-xs text-zinc-400">
                          Happenins utilizes secure local storage keys (`happenins-consent-accepted`) solely to manage active user profiles, and store visual theme options. No persistent third-party tracking pixels or behavioral cookies are injected into your client application.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">4. Explicit Data Sharing Controls</h4>
                        <p className="text-xs text-zinc-400">
                          To authorize check-in gate credentials, your name and purchase confirmation are shared securely with the verified Organizer of the specific event you booked. This sharing is legally restricted to gate validation operations and check-in rosters.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">5. Cryptographic Verification Gate Storage</h4>
                        <p className="text-xs text-zinc-400">
                          To protect physical events, scanning logs (timestamp, scan status, verified operator) are securely stored in our centralized cloud database. These logs prevent double-claims, credential theft, and audit integrity breaches on live venues.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-bold mb-1.5 text-base">6. Your Rights and Profiling Purges</h4>
                        <p className="text-xs text-zinc-400">
                          Under GDPR, CCPA, and CPRA, you retain complete authority to access, transfer, correct, or fully delete your digital profile and booking receipts from our active cloud databases. Requests for total data deletion can be instantly initiated by filing profile purge forms in the account settings panel.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-white/5 bg-[#060608]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Happenins Gateways Secure Protocol v2.4.0
                  </span>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="district-btn-primary w-full sm:w-auto px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer transition text-center"
                  >
                    I Understand & Consent
                  </button>
                </div>

              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <FeaturesProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </FeaturesProvider>
  );
}
