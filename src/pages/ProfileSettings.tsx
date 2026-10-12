import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Lock, 
  Bell, 
  Heart, 
  Trash2, 
  LockKeyhole, 
  Check, 
  QrCode,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getErrorMessage } from "../lib/errors";
import { useFeatures } from "../context/FeaturesContext";

const GRADIENT_AVATARS = [
  { id: "gradient:district-crimson", name: "District Crimson", style: "from-[#e23744] to-[#ff2a54]" },
  { id: "gradient:indigo-to-purple", name: "Indigo Nebula", style: "from-indigo-500 to-purple-600" },
  { id: "gradient:emerald-to-teal", name: "Emerald Dream", style: "from-emerald-400 to-teal-600" },
  { id: "gradient:amber-to-orange", name: "Sunset Horizon", style: "from-amber-400 to-orange-500" },
  { id: "gradient:rose-to-pink", name: "Pink Orchid", style: "from-rose-400 to-pink-500" },
  { id: "gradient:blue-to-indigo", name: "Oceanic Breeze", style: "from-blue-400 to-indigo-600" },
  { id: "gradient:slate-to-zinc", name: "Slate Cosmic", style: "from-slate-500 to-zinc-700" },
];

const AVAILABLE_CATEGORIES = [
  { id: "Concerts", label: "🎵 Concerts", desc: "Live music, outdoor symphonies, rock fests" },
  { id: "Festivals", label: "🎪 Festivals", desc: "Coastal block parties, art festivals, craft show" },
  { id: "Theater & Arts", label: "🎭 Theater & Arts", desc: "Classic musicals, local drama, gallery tours" },
  { id: "Tech Meetups", label: "💻 Tech Meetups", desc: "AI workshops, hackathons, developer roundtables" },
  { id: "Fitness & Health", label: "🧘 Fitness & Health", desc: "Yoga runs, guided meditation, park sports" },
];

export const ProfileSettings: React.FC = () => {
  const { user, updateProfile, changePassword, updateAvatar, deleteAccount } = useAuth();
  const { isEnabled } = useFeatures();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"identity" | "security" | "communications" | "interests" | "danger">("identity");

  // Feature 1: Identity & Custom Avatar
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || "gradient:district-crimson");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Feature 2: Security & Password Update
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Feature 2: 2FA Simulator State
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => localStorage.getItem("happenins_2fa") === "true");
  const [showing2FASetup, setShowing2FASetup] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // Feature 3: Notification Preferences
  const [notifPreferences, setNotifPreferences] = useState(() => {
    const saved = localStorage.getItem("happenins_notif_prefs");
    return saved ? JSON.parse(saved) : {
      receipts: true,
      recommendations: true,
      security: true,
      newsletter: false
    };
  });
  const [prefSaveStatus, setPrefSaveStatus] = useState(false);

  // Feature 4: Interest Selector
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    const saved = localStorage.getItem("happenins_interests");
    return saved ? JSON.parse(saved) : ["Concerts", "Festivals"];
  });
  const [interestsSaveStatus, setInterestsSaveStatus] = useState(false);

  // Feature 5: Permanent Account Deletion (Danger Zone)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Sync state if user context updates
  useEffect(() => {
    if (user?.fullName) {
      setFullName(user.fullName);
    }
    if (user?.avatarUrl) {
      setSelectedAvatar(user.avatarUrl);
    }
  }, [user]);

  // Update Display Name & Avatar
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      // 1. Update Full Name if changed
      if (fullName.trim() !== user?.fullName) {
        await updateProfile(fullName.trim());
      }
      
      // 2. Update Avatar URL (either a custom link or selected gradient)
      const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
      await updateAvatar(finalAvatar);

      setProfileSuccess("Your profile details and custom avatar have been updated successfully!");
      setCustomAvatarUrl("");
    } catch (err: unknown) {
      setProfileError(getErrorMessage(err) || "Failed to update profile. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Change Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await changePassword(oldPassword || undefined, newPassword);
      setPasswordSuccess("Your security password has been changed! A security confirmation was sent to your email.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(getErrorMessage(err) || "Failed to update password. Check your current password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Toggle 2FA Setup
  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      // Turn off
      setIs2FAEnabled(false);
      localStorage.setItem("happenins_2fa", "false");
      setShowing2FASetup(false);
    } else {
      // Open verification setup
      setShowing2FASetup(true);
    }
  };

  // Verify and activate 2FA
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpSuccess(null);

    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setOtpError("Must be a 6-digit numeric verification code.");
      return;
    }

    // Authenticate simulated success
    setOtpSuccess("Two-Factor Authentication is fully activated!");
    setIs2FAEnabled(true);
    localStorage.setItem("happenins_2fa", "true");
    setTimeout(() => {
      setShowing2FASetup(false);
      setOtpCode("");
      setOtpSuccess(null);
    }, 1500);
  };

  // Toggle Notification preferences
  const handleTogglePreference = (key: string) => {
    const updated = {
      ...notifPreferences,
      [key]: !notifPreferences[key]
    };
    setNotifPreferences(updated);
    localStorage.setItem("happenins_notif_prefs", JSON.stringify(updated));
    setPrefSaveStatus(true);
    setTimeout(() => setPrefSaveStatus(false), 2000);
  };

  // Toggle Interest Category click
  const handleToggleInterest = (id: string) => {
    let updated: string[];
    if (selectedInterests.includes(id)) {
      updated = selectedInterests.filter(i => i !== id);
    } else {
      updated = [...selectedInterests, id];
    }
    setSelectedInterests(updated);
    localStorage.setItem("happenins_interests", JSON.stringify(updated));
    setInterestsSaveStatus(true);
    setTimeout(() => setInterestsSaveStatus(false), 2000);
  };

  // GDPR Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE MY ACCOUNT") {
      setDeleteError("Verification phrase incorrect. Please type the exact phrase.");
      return;
    }

    setDeletingAccount(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      // Redirect home is handled automatically since user is set to null in context
    } catch (err: unknown) {
      setDeleteError(getErrorMessage(err) || "Failed to process account deletion.");
      setDeletingAccount(false);
    }
  };

  const getAvatarGradientClass = (avatarStr: string | null) => {
    if (!avatarStr) return "from-[#e23744] to-[#ff2a54]";
    if (avatarStr.startsWith("gradient:")) {
      const gradientObj = GRADIENT_AVATARS.find(g => g.id === avatarStr);
      return gradientObj ? gradientObj.style : "from-[#e23744] to-[#ff2a54]";
    }
    return null;
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

  const isGradient = !user?.avatarUrl || user.avatarUrl.startsWith("gradient:");
  const avatarGradientStyle = getAvatarGradientClass(user?.avatarUrl || "gradient:district-crimson");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 relative z-10 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8 border-b border-white/5 pb-5">
        <h1 className="text-2xl font-display font-black text-white tracking-tight flex items-center gap-2">
          <User className="h-7 w-7 text-[#ff2a54]" />
          <span>Happenins Identity Dashboard</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-2xl font-sans">
          Complete high-fidelity profile customization, advanced two-factor authentication shields, and GDPR privacy settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Settings Tabs Selector Header */}
        <div className="flex border-b border-white/5 overflow-x-auto pb-px gap-1">
          {([
            { id: "identity", label: "Display Profile", icon: User },
            { id: "security", label: "Security & 2FA", icon: LockKeyhole },
            { id: "communications", label: "Notifications", icon: Bell },
            { id: "interests", label: "Interests & Feed", icon: Heart },
            { id: "danger", label: "Danger Zone", icon: Trash2 },
          ] as const).filter((tab) => tab.id !== "danger" || isEnabled("ACCOUNT_DELETION")).map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 py-3 px-4 text-2xs font-display font-extrabold uppercase tracking-widest transition cursor-pointer shrink-0 focus:outline-none ${
                  isSelected
                    ? "border-[#e23744] text-[#ff2a54] bg-[#e23744]/5"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:border-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
              
              {/* TAB 1: Display Profile & Avatar Picker */}
              {activeTab === "identity" && (
                <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight font-display">Display Profile Customization</h3>
                    <p className="text-3xs font-semibold text-[#ff2a54] uppercase tracking-widest mt-0.5">Feature 1: Visual Avatar & Initials Pairing</p>
                  </div>

                  {/* High Contrast Visual Card */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl bg-[#14141b] border border-white/10">
                    {isGradient && avatarGradientStyle ? (
                      <div className={`h-16 w-16 rounded-full bg-gradient-to-tr ${avatarGradientStyle} text-white font-extrabold text-lg flex items-center justify-center shadow-lg border-2 border-white/10`}>
                        {initials}
                      </div>
                    ) : (
                      <img 
                        src={user?.avatarUrl!} 
                        alt={user?.fullName} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                        className="h-16 w-16 rounded-full object-cover border-2 border-[#e23744]/40 shadow-lg"
                      />
                    )}
                    <div className="text-center sm:text-left flex-1">
                      <h4 className="text-sm font-extrabold text-white">{user?.fullName}</h4>
                      <p className="text-xs font-semibold text-slate-400 font-mono mt-0.5">{user?.email}</p>
                      <span className="mt-1.5 inline-block rounded-full bg-[#e23744]/10 border border-[#e23744]/20 px-3 py-0.5 text-3xs font-extrabold text-[#ff2a54] uppercase tracking-widest">
                        {user?.role} ACCOUNT
                      </span>
                    </div>
                  </div>

                  {/* Form for name and avatar updates */}
                  <form onSubmit={handleUpdateProfile} className="space-y-6 text-left">
                    
                    {/* Display Name */}
                    <div>
                      <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1.5">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#14141b] border border-white/10 focus:border-[#e23744] focus:outline-none rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-500"
                          placeholder="Alice Mitchell"
                        />
                      </div>
                      <p className="text-3xs text-slate-500 mt-1 font-medium">Updates all future booking ticket registers, receipts, and event list outputs.</p>
                    </div>

                    {/* Gradient Avatar Picker */}
                    <div>
                      <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-2">
                        Select Curated Profile Theme
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {GRADIENT_AVATARS.map((g) => (
                          <button
                            type="button"
                            key={g.id}
                            onClick={() => {
                              setSelectedAvatar(g.id);
                              setCustomAvatarUrl(""); // clear custom input
                            }}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer active:scale-95 duration-150 ${
                              selectedAvatar === g.id && !customAvatarUrl
                                ? "border-[#e23744] bg-[#e23744]/10"
                                : "border-white/5 bg-[#14141b]/60 hover:bg-[#14141b]"
                            }`}
                          >
                            <div className={`h-7 w-7 rounded-full bg-gradient-to-tr ${g.style} text-white font-black text-xs flex items-center justify-center shadow-sm`}>
                              {initials}
                            </div>
                            <span className="text-3xs font-black text-slate-300 truncate">{g.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Image URL input */}
                    <div>
                      <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1.5">
                        Or Paste an Unsplash Photo URL
                      </label>
                      <div className="relative">
                        <input
                          type="url"
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="w-full bg-[#14141b] border border-white/10 focus:border-[#e23744] focus:outline-none rounded-xl py-2.5 px-3 text-3xs text-white placeholder-slate-500"
                        />
                      </div>
                      <p className="text-3xs text-slate-500 mt-1 font-medium">Only https images from images.unsplash.com are accepted. Takes priority over the selected theme.</p>
                    </div>

                    {/* Feedback */}
                    {profileSuccess && (
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 text-emerald-300 text-xs animate-fade-in">
                        <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold">Identity Saved</p>
                          <p className="text-3xs text-emerald-400 mt-0.5 leading-relaxed font-sans">{profileSuccess}</p>
                        </div>
                      </div>
                    )}
                    {profileError && (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 text-rose-300 text-xs animate-fade-in">
                        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                        <div>
                          <p className="font-bold">Save Failed</p>
                          <p className="text-3xs text-rose-400 mt-0.5 leading-relaxed font-sans">{profileError}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={updatingProfile || (!fullName.trim())}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] py-3.5 text-xs font-black text-white shadow-lg shadow-red-950/40 transition disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                    >
                      {updatingProfile ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                      ) : (
                        <>
                          <span>Save Display Identity</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Password Update & 2FA Setup */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  
                  {/* Password Change Card */}
                  <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 backdrop-blur-xl shadow-2xl">
                    <div className="mb-5">
                      <h3 className="text-sm font-extrabold text-white tracking-tight font-display">Security Credentials Upgrade</h3>
                      <p className="text-3xs font-semibold text-[#ff2a54] uppercase tracking-widest mt-0.5">Feature 2: Secure Password Engine</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
                      <div>
                        <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1.5">Current Password</label>
                        <input
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#14141b] border border-white/10 focus:border-[#e23744] focus:outline-none rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1.5">New Password</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#14141b] border border-white/10 focus:border-[#e23744] focus:outline-none rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1.5">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[#14141b] border border-white/10 focus:border-[#e23744] focus:outline-none rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-500"
                          />
                        </div>
                      </div>

                      {passwordSuccess && (
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex gap-3 text-emerald-300 text-xs animate-fade-in">
                          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-bold">Password Set</p>
                            <p className="text-3xs text-emerald-400 mt-0.5 font-sans leading-relaxed">{passwordSuccess}</p>
                          </div>
                        </div>
                      )}

                      {passwordError && (
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 flex gap-3 text-rose-300 text-xs animate-fade-in">
                          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                          <div>
                            <p className="font-bold">Credential Error</p>
                            <p className="text-3xs text-rose-400 mt-0.5 font-sans leading-relaxed">{passwordError}</p>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={updatingPassword || !newPassword}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] py-3.5 text-xs font-black text-white shadow-lg shadow-red-950/40 transition disabled:opacity-40 cursor-pointer active:scale-98"
                      >
                        {updatingPassword ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Verify & Apply Password"}
                      </button>
                    </form>
                  </div>

                  {/* 2FA Authenticator Simulator */}
                  <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
                          <Shield className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                          <span>Multi-Factor Authentication Shield</span>
                        </h3>
                        <p className="text-3xs font-semibold text-[#ff2a54] uppercase tracking-widest mt-0.5">Feature 2: Simulated 2FA Validation</p>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={`rounded-full px-3.5 py-1 text-3xs font-black uppercase tracking-wider transition border cursor-pointer active:scale-95 duration-150 ${
                          is2FAEnabled
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            : "bg-white/2 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {is2FAEnabled ? "● ACTIVE" : "● DISABLED"}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 text-left leading-relaxed font-sans">
                      Securing login states with randomized verification OTP handshakes. When active, subsequent login sessions request an interactive verification session before auth approval.
                    </p>

                    {showing2FASetup && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-5 p-4 rounded-xl border border-white/10 bg-[#14141b] text-left space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="p-3 bg-white rounded-lg border border-white/5 flex items-center justify-center shrink-0">
                            <QrCode className="h-16 w-16 text-black" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <h4 className="text-xs font-bold text-white font-display">Scan Authenticator Key</h4>
                            <p className="text-3xs text-slate-400 leading-relaxed font-sans">
                              Open Google Authenticator, Authy, or Microsoft Authenticator, and scan the QR code, or enter manual seed coordinate:
                            </p>
                            <code className="block bg-black/60 border border-white/10 p-1 text-[10px] font-mono font-bold text-[#ff2a54] select-all rounded uppercase text-center sm:text-left">
                              HAPP ENIN S2FA SECE REET KEY4 U
                            </code>
                          </div>
                        </div>

                        <form onSubmit={handleVerify2FA} className="space-y-3">
                          <div>
                            <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-1">Enter Authenticator Verification Code</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="e.g. 123456"
                              className="w-full bg-[#060608] border border-white/10 rounded-xl py-2 px-3 text-xs font-mono font-bold text-center tracking-[0.25em] text-white focus:border-[#e23744] focus:outline-none"
                            />
                          </div>

                          {otpError && <p className="text-3xs font-bold text-rose-400">⚠ {otpError}</p>}
                          {otpSuccess && <p className="text-3xs font-bold text-emerald-400">✔ {otpSuccess}</p>}

                          <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e23744] to-[#ff2a54] hover:from-[#c81e30] hover:to-[#e23744] py-3 text-3xs font-black uppercase text-white shadow-lg shadow-red-950/40 active:scale-98 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Verify and Authorize Shield</span>
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Communication & Email preferences */}
              {activeTab === "communications" && (
                <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white tracking-tight font-display">Notification & Alerts Configurations</h3>
                      <p className="text-3xs font-semibold text-[#ff2a54] uppercase tracking-widest mt-0.5">Feature 3: Interactive Alerts Routing</p>
                    </div>
                    {prefSaveStatus && (
                      <span className="text-3xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                        Preferences saved!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 text-left font-sans">
                    Adjust how we contact you for ticket updates, marketing communications, and critical login updates.
                  </p>

                  <div className="divide-y divide-white/5 text-left">
                    {[
                      { key: "receipts", label: "Ticket Receipts & PDF Confirmations", desc: "Instantly sends tickets, receipt invoices, and security check-in codes." },
                      { key: "recommendations", label: "City Happenings Recommendations", desc: "Weekly digests based on your location and customized event tags." },
                      { key: "security", label: "Critical Account Security Alerts", desc: "Recommended. Triggers notification emails for all password and avatar changes." },
                      { key: "newsletter", label: "Happenins Monthly Print Dispatch", desc: "Simulated editorial newsletter showing indie artist catalogs and schedules." },
                    ].map((pref) => {
                      const enabled = notifPreferences[pref.key];
                      return (
                        <div key={pref.key} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-white">{pref.label}</h4>
                            <p className="text-3xs text-slate-400 leading-relaxed mt-0.5 font-sans">{pref.desc}</p>
                          </div>
                          <button
                            onClick={() => handleTogglePreference(pref.key)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              enabled ? "bg-[#e23744]" : "bg-white/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: Category Interest selector */}
              {activeTab === "interests" && (
                <div className="rounded-3xl border border-white/10 bg-[#0c0c11]/95 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white tracking-tight font-display">Happenins Recommendation Engine</h3>
                      <p className="text-3xs font-semibold text-[#ff2a54] uppercase tracking-widest mt-0.5">Feature 4: Personalized Category Selection</p>
                    </div>
                    {interestsSaveStatus && (
                      <span className="text-3xs font-extrabold uppercase tracking-widest text-[#ff2a54] bg-[#e23744]/10 px-2 py-0.5 rounded border border-[#e23744]/20 animate-pulse font-sans">
                        Feed Personalized!
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 text-left font-sans">
                    Check event topics you enjoy. This directly targets visual layouts, search priority metrics, and highlights matches on your feed.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {AVAILABLE_CATEGORIES.map((cat) => {
                      const selected = selectedInterests.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => handleToggleInterest(cat.id)}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer active:scale-95 duration-150 ${
                            selected
                              ? "border-[#e23744] bg-[#e23744]/10 shadow-lg"
                              : "border-white/5 bg-[#14141b]/60 hover:bg-[#14141b] hover:border-white/10"
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                            selected ? "bg-[#e23744] border-[#e23744] text-white" : "border-white/10 bg-black/40"
                          }`}>
                            {selected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-black text-white truncate font-display">{cat.label}</span>
                            <span className="block text-3xs text-slate-400 leading-normal mt-0.5 font-sans">{cat.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: GDPR Permanent account deletion */}
              {activeTab === "danger" && isEnabled("ACCOUNT_DELETION") && (
                <div className="rounded-3xl border border-rose-500/20 bg-rose-950/15 p-6 shadow-xl space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-rose-200 tracking-tight flex items-center gap-1.5 font-display">
                      <Trash2 className="h-5 w-5 text-rose-500" />
                      <span>GDPR Compliance Danger Zone</span>
                    </h3>
                    <p className="text-3xs font-bold text-rose-400 uppercase tracking-widest mt-0.5">Feature 5: Permanent Account Deactivation</p>
                  </div>

                  <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-4 text-xs text-rose-200 text-left leading-relaxed space-y-2 font-sans">
                    <p className="font-bold">This operation is irreversible!</p>
                    <p className="text-[11px] text-rose-300/80 leading-relaxed">
                      Completing this will permanently erase your Happenins registry account, invalidating all purchased tickets, cancelling hosted listings (if an organizer), clearing transaction audit records, and sending a GDRP deactivation receipt.
                    </p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-3xs font-display font-bold uppercase text-slate-400 tracking-widest mb-2">
                        Type <span className="font-mono font-black text-rose-400 select-all bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">DELETE MY ACCOUNT</span> to unlock:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        placeholder="Type DELETE MY ACCOUNT"
                        className="w-full glass-input rounded-xl border-rose-500/20 text-rose-300 bg-black/40 py-2.5 px-3 text-xs font-mono font-bold tracking-wider uppercase focus:border-rose-500 focus:outline-none"
                      />
                    </div>

                    {deleteError && <p className="text-3xs font-bold text-rose-400">⚠ {deleteError}</p>}

                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount || deleteConfirmationText !== "DELETE MY ACCOUNT"}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 py-3.5 text-xs font-black text-white shadow hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                    >
                      {deletingAccount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Erase My Happenins Data Permanently</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  };
