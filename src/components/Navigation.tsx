import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Ticket,
  LayoutDashboard,
  UserCheck,
  LogOut,
  Loader2,
  LogIn,
  User,
  Home,
  ChevronRight,
  Sparkles,
  Settings,
  Shield,
  Menu
} from "lucide-react";
import { LogoFull } from "./Logo";
import { useFeatures } from "../context/FeaturesContext";

interface NavigationProps {
  currentView: string;
  setView: (view: string) => void;
  onSearch: (text: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, onSearch }) => {
  const { user, loading, logout } = useAuth();
  const { isEnabled } = useFeatures();
  const [showMobileProfileDrawer, setShowMobileProfileDrawer] = useState(false);

  const handleNavClick = (viewName: string) => {
    setView(viewName);
    setShowMobileProfileDrawer(false);
    if (viewName === "home") {
      onSearch("");
    }
  };

  return (
    <>
      {/* Sticky Desktop & Mobile Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#060608]/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo, Brand & Location Pill */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center focus:outline-none cursor-pointer group"
            >
              <LogoFull size={32} textClassName="text-xl" />
            </button>

            {/* District City Selector Pill */}
            <button
              onClick={() => handleNavClick("home")}
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.2] px-3 py-1.5 text-xs text-zinc-300 font-medium transition cursor-pointer"
            >
              <div className="h-2 w-2 rounded-full bg-[#e23744]" />
              <span className="text-zinc-200">Nagpur & Major Hubs</span>
              <span className="text-[10px] text-zinc-500 font-mono">▼</span>
            </button>

            {/* Quick Browse Actions - Desktop */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-300">
              <button
                onClick={() => handleNavClick("home")}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer text-xs font-semibold ${
                  currentView === "home"
                    ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm"
                    : "hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => handleNavClick("scan")}
                className={`rounded-lg px-3 py-1.5 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  currentView === "scan"
                    ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-sm"
                    : "hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5 text-[#ff2a54]" />
                <span>Gate Scanner</span>
              </button>
            </nav>
          </div>

          {/* Desktop Right Side Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Tickets Link */}
                <button
                  onClick={() => handleNavClick("my-tickets")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    currentView === "my-tickets"
                      ? "bg-white/[0.08] text-white border border-white/[0.12]"
                      : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Ticket className="h-3.5 w-3.5 text-[#ff2a54]" />
                  <span>My Passes</span>
                </button>

                {/* Profile Link */}
                <button
                  onClick={() => handleNavClick("settings")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    currentView === "settings"
                      ? "bg-white/[0.08] text-white border border-white/[0.12]"
                      : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </button>

                {/* Organizer Portal */}
                {user.role === "USER" ? (
                  isEnabled("ORGANIZER_ONBOARDING") ? (
                    <button
                      onClick={() => handleNavClick("onboard-organizer")}
                      className={`rounded-lg border border-white/[0.1] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.06] text-zinc-300 transition cursor-pointer ${
                        currentView === "onboard-organizer" ? "bg-white/[0.08] border-white/20 text-white" : ""
                      }`}
                    >
                      Host Event
                    </button>
                  ) : null
                ) : (
                  <button
                    onClick={() => handleNavClick("organizer-dashboard")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      currentView === "organizer-dashboard"
                        ? "bg-white/[0.08] text-white border border-white/[0.12]"
                        : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Control Center</span>
                  </button>
                )}

                {/* Admin Console Link for ADMIN role */}
                {user.role === "ADMIN" && (
                  <button
                    onClick={() => handleNavClick("organizer-dashboard")}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </button>
                )}

                {/* Venture Vault Command Center ONLY for pacific2306@gmail.com */}
                {user.email?.toLowerCase() === "pacific2306@gmail.com" && (
                  <button
                    onClick={() => handleNavClick("venture")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      currentView === "venture"
                        ? "bg-[#e23744] text-white shadow-md shadow-[#e23744]/20"
                        : "text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Venture Vault</span>
                  </button>
                )}

                {/* Vertical Separator */}
                <span className="h-5 w-px bg-white/[0.08]" />

                {/* Session Account display and Logout */}
                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-zinc-200">{user.fullName}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      handleNavClick("home");
                    }}
                    title="Log Out"
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-[#ff2a54] transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick("login")}
                className="district-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Top Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setShowMobileProfileDrawer(true)}
              className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-white/[0.08] transition cursor-pointer"
            >
              <div className="h-6 w-6 rounded-lg bg-[#e23744]/20 text-[#ff2a54] border border-[#e23744]/30 flex items-center justify-center font-bold text-xs uppercase">
                {user ? user.fullName.charAt(0) : <User className="h-3.5 w-3.5" />}
              </div>
              <Menu className="h-4 w-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Fixed Mobile & Tablet Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#09090c]/90 border-t border-white/[0.08] backdrop-blur-2xl px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]">
        <div className="grid grid-cols-4 items-center text-center">
          {/* 1. Explore Events */}
          <button
            onClick={() => handleNavClick("home")}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition cursor-pointer ${
              currentView === "home" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-sans mt-1 tracking-tight">Explore</span>
            {currentView === "home" && <span className="h-1 w-1 rounded-full bg-[#e23744] mt-0.5" />}
          </button>

          {/* 2. My Tickets */}
          <button
            onClick={() => handleNavClick("my-tickets")}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition cursor-pointer ${
              currentView === "my-tickets" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Ticket className="h-5 w-5" />
            <span className="text-[10px] font-sans mt-1 tracking-tight">Passes</span>
            {currentView === "my-tickets" && <span className="h-1 w-1 rounded-full bg-[#e23744] mt-0.5" />}
          </button>

          {/* 3. Control Center / Organizer */}
          <button
            onClick={() => handleNavClick(user ? (user.role === "USER" ? "onboard-organizer" : "organizer-dashboard") : "login")}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition cursor-pointer ${
              currentView === "organizer-dashboard" || currentView === "onboard-organizer"
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-sans mt-1 tracking-tight">Control</span>
            {(currentView === "organizer-dashboard" || currentView === "onboard-organizer") && (
              <span className="h-1 w-1 rounded-full bg-[#e23744] mt-0.5" />
            )}
          </button>

          {/* 4. Profile & Options */}
          <button
            onClick={() => setShowMobileProfileDrawer(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 transition cursor-pointer ${
              currentView === "settings" || showMobileProfileDrawer
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="relative">
              <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-300">
                {user ? user.fullName.charAt(0) : <User className="h-3 w-3" />}
              </div>
            </div>
            <span className="text-[10px] font-sans mt-1 tracking-tight">Profile</span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile & All Options Slide-up Bottom Drawer */}
      {showMobileProfileDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end md:hidden animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowMobileProfileDrawer(false)}
          />

          <div className="relative z-10 w-full bg-[#0d0d12] border-t border-white/[0.08] rounded-t-3xl shadow-2xl p-5 space-y-5 max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Pull Bar */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto" />

            {/* Account Card Header */}
            {user ? (
              <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#e23744] to-[#ff2a54] flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-white text-sm">{user.fullName}</h3>
                    <p className="text-xs text-zinc-400 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest bg-white/[0.08] border border-white/[0.1] px-2.5 py-1 rounded-full font-mono">
                  {user.role}
                </span>
              </div>
            ) : (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center space-y-3">
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Welcome to Happenins</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Sign in to book passes, track orders, and scan tickets</p>
                </div>
                <button
                  onClick={() => handleNavClick("login")}
                  className="district-btn-primary w-full rounded-xl py-2.5 text-xs uppercase tracking-wider cursor-pointer"
                >
                  Log In / Sign Up
                </button>
              </div>
            )}

            {/* Navigation Options List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-1 font-mono">
                Menu Navigation
              </span>

              <button
                onClick={() => handleNavClick("home")}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.06] text-white">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Explore Events</span>
                    <span className="text-[10px] text-zinc-400">Discover live gigs, concerts, standup & nightlife</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              <button
                onClick={() => handleNavClick("venture")}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#e23744]/15 text-[#ff2a54]">
                    <Sparkles className="h-4 w-4 text-amber-300" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Venture Vault 2026</span>
                    <span className="text-[10px] text-zinc-400">Private 50-Team Delegation Console</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              <button
                onClick={() => handleNavClick("my-tickets")}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#e23744]/15 text-[#ff2a54]">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">My Passes & Bookings</span>
                    <span className="text-[10px] text-zinc-400">Active dynamic QR passes & ticket transfers</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              <button
                onClick={() => handleNavClick("settings")}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/[0.06] text-zinc-300">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Profile & Security</span>
                    <span className="text-[10px] text-zinc-400">Update credentials, profile, and email preferences</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              {user && (user.role === "ORGANIZER" || user.role === "ADMIN") ? (
                <button
                  onClick={() => handleNavClick("organizer-dashboard")}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Organizer Control Center</span>
                      <span className="text-[10px] text-zinc-400">Manage listings, analytics, and tiers</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              ) : user && isEnabled("ORGANIZER_ONBOARDING") ? (
                <button
                  onClick={() => handleNavClick("onboard-organizer")}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/[0.06] text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Host an Event</span>
                      <span className="text-[10px] text-zinc-400">List community events and sell tickets directly</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              ) : null}

              <button
                onClick={() => handleNavClick("scan")}
                className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Security Gate Scanner</span>
                    <span className="text-[10px] text-zinc-400">Scan QR passes with 6-digit volunteer PIN or staff login</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>

              {user && user.role === "ADMIN" && (
                <button
                  onClick={() => handleNavClick("organizer-dashboard")}
                  className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 hover:bg-white/[0.07] transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Admin Console</span>
                      <span className="text-[10px] text-zinc-400">System management, logs, and feature controls</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              )}

              {/* Venture Vault Command Center ONLY for pacific2306@gmail.com */}
              {user && user.email?.toLowerCase() === "pacific2306@gmail.com" && (
                <button
                  onClick={() => handleNavClick("venture")}
                  className="w-full flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 hover:bg-amber-500/20 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Venture Vault Command Center</span>
                      <span className="text-[10px] text-zinc-400">Master summit administration & passes</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </button>
              )}
            </div>

            {/* Log Out Button */}
            {user && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    logout();
                    handleNavClick("home");
                  }}
                  className="w-full rounded-xl bg-rose-500/10 border border-rose-500/20 py-3 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out ({user.fullName})</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowMobileProfileDrawer(false)}
              className="w-full text-center text-xs text-zinc-500 font-bold py-2 cursor-pointer hover:text-zinc-300 transition"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
