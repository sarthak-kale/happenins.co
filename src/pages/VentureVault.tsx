import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Upload, 
  Send, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight,
  Eye,
  AlertTriangle,
  Image,
  UserCheck,
  KeyRound,
  ShieldAlert,
  DoorOpen,
  Plus,
  X,
  UserPlus,
  Edit2,
  Mail,
  ArrowRightLeft
} from "lucide-react";
import * as XLSX from "xlsx";
import { 
  api, 
  VentureStatusDTO, 
  VentureEventDTO, 
  VentureTeamDTO, 
  VentureMemberDTO,
  VentureStaffScannerDTO
} from "../lib/api";
import { formatTimeIST, formatDateIST } from "../lib/formatters";

interface ParsedRosterMember {
  fullName: string;
  email: string;
  role: "LEADER" | "MEMBER";
}

interface ParsedRosterTeam {
  teamName: string;
  members: ParsedRosterMember[];
}

export const VentureVault: React.FC = () => {
  const [data, setData] = useState<VentureStatusDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRound, setFilterRound] = useState<"all" | "r1" | "r2" | "r3">("all");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Excel Roster Upload State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedRosterTeam[] | null>(null);
  const [uploadingRoster, setUploadingRoster] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
    batchIndex: number;
    totalBatches: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Micro-Batch Dispatcher State (Vercel-safe progress bar)
  const [dispatchModal, setDispatchModal] = useState<{
    open: boolean;
    roundNumber: 1 | 2 | 3;
    isRunning: boolean;
    sentCount: number;
    totalCount: number;
    currentBatch: number;
    totalBatches: number;
    currentTeamNames: string[];
    isCompleted: boolean;
    errors: string[];
  }>({
    open: false,
    roundNumber: 1,
    isRunning: false,
    sentCount: 0,
    totalCount: 0,
    currentBatch: 0,
    totalBatches: 0,
    currentTeamNames: [],
    isCompleted: false,
    errors: [],
  });

  // Purge Modal State
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purging, setPurging] = useState<boolean>(false);
  const [purgeConfirmationText, setPurgeConfirmationText] = useState<string>("");
  const [isLiveEventLocked, setIsLiveEventLocked] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // University Banner, Names & Schedule Modal State
  const [showBannerModal, setShowBannerModal] = useState<boolean>(false);
  const [bannerFormData, setBannerFormData] = useState({
    masterTitle: "",
    masterBannerUrl: "",
    r1Title: "",
    r1BannerUrl: "",
    r1Time: "",
    r2Title: "",
    r2BannerUrl: "",
    r2Time: "",
    r3Title: "",
    r3BannerUrl: "",
    r3Time: "",
  });
  const [savingBanners, setSavingBanners] = useState<boolean>(false);

  // Manual Check-in State
  const [manualCheckingInId, setManualCheckingInId] = useState<string | null>(null);

  // Volunteer Gate PINs State
  const [volunteerPins, setVolunteerPins] = useState<VentureStaffScannerDTO[]>([]);
  const [loadingPins, setLoadingPins] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinFormData, setPinFormData] = useState({
    staffName: "",
    gateName: "Gate 1 - Main Auditorium",
    customPin: "",
    expiresHours: 24,
    notes: "",
  });
  const [creatingPin, setCreatingPin] = useState<boolean>(false);
  const [pinModalError, setPinModalError] = useState<string | null>(null);
  const [pinModalSuccess, setPinModalSuccess] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [deletingPinId, setDeletingPinId] = useState<string | null>(null);

  // Vacant slots filter state
  const [filterVacantOnly, setFilterVacantOnly] = useState<boolean>(false);

  // On-Spot Team Registration State
  const [showOnSpotModal, setShowOnSpotModal] = useState<boolean>(false);
  const [onSpotFormData, setOnSpotFormData] = useState({
    teamId: "",
    teamName: "",
    leaderName: "",
    leaderEmail: "",
    m1Name: "",
    m1Email: "",
    m2Name: "",
    m2Email: "",
    m3Name: "",
    m3Email: "",
    sendEmailNow: true,
    roundNumber: 3 as 1 | 2 | 3,
  });
  const [creatingOnSpot, setCreatingOnSpot] = useState<boolean>(false);
  const [onSpotError, setOnSpotError] = useState<string | null>(null);
  const [onSpotSuccess, setOnSpotSuccess] = useState<{
    team: VentureTeamDTO;
    members: VentureMemberDTO[];
  } | null>(null);

  // Add / Fill Vacant Spot in Team State
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [targetTeam, setTargetTeam] = useState<{ id: string; teamName: string } | null>(null);
  const [addMemberFormData, setAddMemberFormData] = useState({
    fullName: "",
    email: "",
    role: "MEMBER" as "LEADER" | "MEMBER",
    sendEmailNow: true,
    roundNumber: 1 as 1 | 2 | 3,
  });
  const [addingMember, setAddingMember] = useState<boolean>(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);

  // Edit Team Name State
  const [showEditTeamModal, setShowEditTeamModal] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<{ id: string; teamName: string } | null>(null);
  const [editingTeamName, setEditingTeamName] = useState<string>("");
  const [savingTeam, setSavingTeam] = useState<boolean>(false);
  const [editTeamError, setEditTeamError] = useState<string | null>(null);

  // Edit Delegate / Member State
  const [showEditMemberModal, setShowEditMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: "LEADER" | "MEMBER";
    currentTeamId: string;
  } | null>(null);
  const [editingMemberData, setEditingMemberData] = useState({
    fullName: "",
    email: "",
    role: "MEMBER" as "LEADER" | "MEMBER",
    teamId: "",
  });
  const [savingMember, setSavingMember] = useState<boolean>(false);
  const [editMemberError, setEditMemberError] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  // Instant Individual Pass Dispatch State
  const [sendingPassMemberId, setSendingPassMemberId] = useState<string | null>(null);
  const [sentSuccessMemberId, setSentSuccessMemberId] = useState<string | null>(null);

  const loadVolunteerPins = async () => {
    try {
      setLoadingPins(true);
      const res = await api.getVentureVolunteerPins();
      if (res?.pins) {
        setVolunteerPins(res.pins);
      }
    } catch (err: unknown) {
      console.warn("Could not load volunteer PINs:", err);
    } finally {
      setLoadingPins(false);
    }
  };

  const handleCreateVolunteerPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinFormData.staffName.trim()) {
      setPinModalError("Please enter the volunteer's name.");
      return;
    }

    setCreatingPin(true);
    setPinModalError(null);
    setPinModalSuccess(null);

    try {
      const res = await api.createVentureVolunteerPin({
        staffName: pinFormData.staffName.trim(),
        gateName: pinFormData.gateName.trim() || "Main Gate",
        customPin: pinFormData.customPin.trim() || undefined,
        expiresHours: Number(pinFormData.expiresHours) || 24,
        notes: pinFormData.notes.trim() || undefined,
      });

      setPinModalSuccess(`Volunteer PIN ${res.pin.pin} generated successfully for ${res.pin.staffName}!`);
      setPinFormData({
        staffName: "",
        gateName: "Gate 1 - Main Auditorium",
        customPin: "",
        expiresHours: 24,
        notes: "",
      });
      await loadVolunteerPins();
    } catch (err: unknown) {
      setPinModalError(err instanceof Error ? err.message : "Failed to create volunteer PIN.");
    } finally {
      setCreatingPin(false);
    }
  };

  const handleDeleteVolunteerPin = async (pinId: string, staffName: string) => {
    if (!window.confirm(`Revoke 6-digit PIN for volunteer "${staffName}"? This volunteer will be logged out immediately.`)) {
      return;
    }

    try {
      setDeletingPinId(pinId);
      await api.deleteVentureVolunteerPin(pinId);
      setVolunteerPins((prev) => prev.filter((p) => p.id !== pinId));
    } catch (err: unknown) {
      alert("Failed to delete volunteer PIN.");
    } finally {
      setDeletingPinId(null);
    }
  };

  const handleToggleVolunteerPin = async (pinId: string) => {
    try {
      const res = await api.toggleVentureVolunteerPin(pinId);
      setVolunteerPins((prev) => prev.map((p) => (p.id === pinId ? res.pin : p)));
    } catch (err: unknown) {
      alert("Failed to toggle volunteer PIN status.");
    }
  };

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  useEffect(() => {
    loadStatus();
    loadVolunteerPins();

    // Live auto-refresh every 3.5 seconds so volunteer gate scans appear in real-time
    const pollInterval = setInterval(() => {
      loadStatus(true);
      loadVolunteerPins();
    }, 3500);

    return () => clearInterval(pollInterval);
  }, []);

  const loadStatus = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.getVentureStatus();
      setData(res);
    } catch (err: unknown) {
      console.error("Failed to load Venture Vault status:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle Excel / CSV File Parsing via XLSX
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setUploadError("The uploaded spreadsheet contains no data rows.");
          return;
        }

        // Helper to extract field value by searching exact keys, normalized keys, and fuzzy patterns
        const extractValue = (row: Record<string, any>, possibleKeys: string[], patterns?: string[]): string => {
          // 1. Direct or trimmed key match
          for (const [k, v] of Object.entries(row)) {
            if (v === undefined || v === null || String(v).trim() === "") continue;
            const trimmedK = k.trim();
            if (possibleKeys.includes(trimmedK)) {
              return String(v).trim();
            }
          }
          // 2. Normalized alphanumeric match
          const normalizedTargets = possibleKeys.map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
          for (const [k, v] of Object.entries(row)) {
            if (v === undefined || v === null || String(v).trim() === "") continue;
            const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (normalizedTargets.includes(cleanKey)) {
              return String(v).trim();
            }
          }
          // 3. Pattern match (if all tokens are present in cleanKey)
          if (patterns && patterns.length > 0) {
            for (const [k, v] of Object.entries(row)) {
              if (v === undefined || v === null || String(v).trim() === "") continue;
              const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
              const matchesAll = patterns.every((pat) => cleanKey.includes(pat));
              if (matchesAll) {
                return String(v).trim();
              }
            }
          }
          return "";
        };

        const parsedTeams: ParsedRosterTeam[] = [];

        // Check if sheet has wide team headers (Team ID, Team Name, Leader Name/Email, Member 1, Member 2, etc.)
        const isWideFormat = rawJson.some((row) => {
          const keys = Object.keys(row).map((k) => k.toLowerCase().replace(/[^a-z0-9]/g, ""));
          return keys.some(
            (k) =>
              k.includes("leader") ||
              k.includes("member1") ||
              k.includes("member2") ||
              k.includes("teammember") ||
              k.includes("teamid")
          );
        });

        if (!isWideFormat) {
          // Format B: 1 row per member (Team Name, Member Name, Email, Role)
          const teamMap = new Map<string, ParsedRosterMember[]>();
          const seenTeamEmails = new Map<string, Set<string>>();

          rawJson.forEach((row) => {
            const teamName =
              extractValue(row, ["Team Name", "Team", "team_name", "team", "TeamName"]) || "General Team";
            const name =
              extractValue(row, ["Member Name", "Name", "Full Name", "Candidate Name", "Participant Name"]) ||
              "Candidate";
            const email = extractValue(row, ["Member Email", "Email", "email", "Candidate Email", "Email Address"]);
            const roleStr = extractValue(row, ["Role", "role"]).toUpperCase();
            const role = roleStr.includes("LEAD") ? "LEADER" : "MEMBER";

            if (email) {
              const cleanEmail = email.toLowerCase();
              if (!teamMap.has(teamName)) {
                teamMap.set(teamName, []);
                seenTeamEmails.set(teamName, new Set());
              }
              const seen = seenTeamEmails.get(teamName)!;
              if (!seen.has(cleanEmail)) {
                seen.add(cleanEmail);
                teamMap.get(teamName)!.push({ fullName: name, email, role });
              }
            }
          });

          teamMap.forEach((members, teamName) => {
            if (members.length > 0) {
              parsedTeams.push({ teamName, members });
            }
          });
        } else {
          // Format A: Wide row per team (Team ID, Team Name, Leader Name/Email, Member 1, 2, 3...)
          rawJson.forEach((row, idx) => {
            const teamId = extractValue(row, ["Team ID", "Team Id", "TeamID", "ID", "Serial No", "S.No", "Sl No"]);
            const rawTeamName = extractValue(row, ["Team Name", "Team", "TeamName", "team_name"]);
            let teamName = "";
            if (teamId && rawTeamName) {
              teamName = rawTeamName.toLowerCase().includes(`team ${teamId}`) || rawTeamName.toLowerCase().startsWith(`team ${teamId}`)
                ? rawTeamName
                : `Team ${teamId} - ${rawTeamName}`;
            } else if (teamId) {
              teamName = `Team ${teamId}`;
            } else if (rawTeamName) {
              teamName = rawTeamName;
            } else {
              teamName = `Team ${idx + 1}`;
            }

            const leaderName =
              extractValue(
                row,
                [
                  "Leader Name",
                  "Team Leader Name",
                  "Leader",
                  "Team Leader",
                  "Team Lead Name",
                  "Leader's Name",
                  "Lead Name",
                ],
                ["lead", "name"]
              ) || "Leader";

            const leaderEmail = extractValue(
              row,
              [
                "Leader Email",
                "Team Leader Email",
                "Leader Email Address",
                "Team Leader Email Address",
                "Leader's Email",
                "Lead Email",
                "Team Lead Email",
              ],
              ["lead", "email"]
            );

            const members: ParsedRosterMember[] = [];
            const seenEmails = new Set<string>();

            if (leaderEmail) {
              members.push({ fullName: leaderName, email: leaderEmail, role: "LEADER" });
              seenEmails.add(leaderEmail.toLowerCase());
            }

            // Inspect all team members from 1 to 10 (guarantees Member 1, 2, 3, etc. are all captured)
            for (let i = 1; i <= 10; i++) {
              const mName =
                extractValue(
                  row,
                  [
                    `Member ${i} Name`,
                    `Member${i}Name`,
                    `Member ${i}`,
                    `Member${i}`,
                    `Team Member ${i} Name`,
                    `Team Member ${i}`,
                    `Participant ${i} Name`,
                    `Participant ${i}`,
                    `Candidate ${i} Name`,
                    `Member ${i} Full Name`,
                  ],
                  [`member${i}`, "name"]
                ) || `Member ${i}`;

              const mEmail = extractValue(
                row,
                [
                  `Member ${i} Email`,
                  `Member${i}Email`,
                  `Member ${i} Email Address`,
                  `Member ${i} Email ID`,
                  `Team Member ${i} Email`,
                  `Team Member ${i} Email Address`,
                  `Participant ${i} Email`,
                  `Candidate ${i} Email`,
                ],
                [`member${i}`, "email"]
              );

              if (mEmail) {
                const cleanEmail = mEmail.toLowerCase();
                // Avoid duplicating the leader if Member 1 was also entered as leader
                if (!seenEmails.has(cleanEmail)) {
                  seenEmails.add(cleanEmail);
                  // If there was no separate leader column, promote Member 1 to LEADER
                  const role = members.length === 0 ? "LEADER" : "MEMBER";
                  members.push({ fullName: mName, email: mEmail, role });
                }
              }
            }

            if (members.length > 0) {
              parsedTeams.push({ teamName, members });
            }
          });
        }

        if (parsedTeams.length === 0) {
          setUploadError(
            "Could not detect valid email columns. Ensure columns have 'Leader Email' and 'Member 1 Email' headers."
          );
          return;
        }

        setParsedPreview(parsedTeams);
      } catch (err: unknown) {
        setUploadError("Failed to parse spreadsheet file. Please check file format.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmRosterUpload = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    try {
      setUploadingRoster(true);
      setUploadError(null);
      const BATCH_SIZE = 25;
      const total = parsedPreview.length;
      const totalBatches = Math.ceil(total / BATCH_SIZE);
      let totalTeamsCreated = 0;
      let totalMembersCreated = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const slice = parsedPreview.slice(i, i + BATCH_SIZE);
        const isFirst = i === 0;
        const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
        setUploadProgress({
          current: Math.min(i + BATCH_SIZE, total),
          total,
          batchIndex: currentBatch,
          totalBatches,
        });

        const res = await api.uploadVentureRoster(slice, isFirst);
        totalTeamsCreated += res.teamsCreated;
        totalMembersCreated += res.membersCreated;
      }

      setShowUploadModal(false);
      setParsedPreview(null);
      setUploadProgress(null);
      await loadStatus();
      alert(`Success! Uploaded ${totalTeamsCreated} teams and ${totalMembersCreated} participants into database.`);
    } catch (err: unknown) {
      console.error("Upload roster error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload roster into database.";
      setUploadError(msg);
    } finally {
      setUploadingRoster(false);
      setUploadProgress(null);
    }
  };

  // Vercel-Safe Micro-Batch Dispatcher
  const startBatchDispatch = async (roundNumber: 1 | 2 | 3) => {
    if (!data || data.teams.length === 0) return;

    // Collect all candidate member IDs
    const allMembers: { id: string; teamName: string }[] = [];
    data.teams.forEach((t) => {
      t.members.forEach((m) => {
        allMembers.push({ id: m.id, teamName: t.teamName });
      });
    });

    if (allMembers.length === 0) {
      alert("No registered candidates found in the roster.");
      return;
    }

    const BATCH_SIZE = 15;
    const totalBatches = Math.ceil(allMembers.length / BATCH_SIZE);

    setDispatchModal({
      open: true,
      roundNumber,
      isRunning: true,
      sentCount: 0,
      totalCount: allMembers.length,
      currentBatch: 0,
      totalBatches,
      currentTeamNames: [],
      isCompleted: false,
      errors: [],
    });

    let currentSent = 0;
    const errorsList: string[] = [];

    for (let b = 0; b < totalBatches; b++) {
      const slice = allMembers.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const memberIds = slice.map((m) => m.id);
      const currentTeams = Array.from(new Set(slice.map((m) => m.teamName))).slice(0, 3);

      setDispatchModal((prev) => ({
        ...prev,
        currentBatch: b + 1,
        currentTeamNames: currentTeams,
      }));

      try {
        const res = await api.dispatchVentureBatch({
          roundNumber,
          memberIds,
        });
        currentSent += res.sentCount;
        if (res.errors && res.errors.length > 0) {
          res.errors.forEach((e) => errorsList.push(`${e.email}: ${e.error}`));
        }
      } catch (err: unknown) {
        errorsList.push(`Batch ${b + 1} encountered network error.`);
      }

      setDispatchModal((prev) => ({
        ...prev,
        sentCount: currentSent,
        errors: errorsList,
      }));

      // Small 250ms breather between batches
      await new Promise((r) => setTimeout(r, 250));
    }

    setDispatchModal((prev) => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
    }));

    await loadStatus();
  };

  const handleCopyPassLink = (token: string, roundNumber: number) => {
    const origin = window.location.origin;
    const url = `${origin}/venture-pass/${token}?round=${roundNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(`${token}_${roundNumber}`);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      await api.exportVentureLedger();
    } catch (err: unknown) {
      alert("Failed to export attendance ledger. Please verify you are logged in.");
    } finally {
      setExporting(false);
    }
  };

  const openBannerModal = () => {
    if (data?.event) {
      const e = data.event;
      const r1 = e.subEvents.find((s) => s.roundNumber === 1);
      const r2 = e.subEvents.find((s) => s.roundNumber === 2);
      const r3 = e.subEvents.find((s) => s.roundNumber === 3);
      setBannerFormData({
        masterTitle: e.title || "Venture Vault 2026",
        masterBannerUrl: e.masterBannerUrl || "",
        r1Title: r1?.title || "Round 1: Preliminary Pitch & Strategy Defense",
        r1BannerUrl: r1?.bannerUrl || "",
        r1Time: r1?.scheduledTime || "10:00 AM - 01:00 PM IST",
        r2Title: r2?.title || "Round 2: Prototype Showcase & Architectural Review",
        r2BannerUrl: r2?.bannerUrl || "",
        r2Time: r2?.scheduledTime || "02:00 PM - 05:00 PM IST",
        r3Title: r3?.title || "Round 3: Grand Finale Showcase & Awards Ceremony",
        r3BannerUrl: r3?.bannerUrl || "",
        r3Time: r3?.scheduledTime || "06:00 PM - 08:30 PM IST",
      });
    }
    setShowBannerModal(true);
  };

  const handleSaveBanners = async () => {
    try {
      setSavingBanners(true);
      await api.updateVentureEvent({
        title: bannerFormData.masterTitle || "Venture Vault",
        masterBannerUrl: bannerFormData.masterBannerUrl,
        subEvents: [
          {
            roundNumber: 1,
            title: bannerFormData.r1Title || "Round 1",
            bannerUrl: bannerFormData.r1BannerUrl,
            scheduledTime: bannerFormData.r1Time,
          },
          {
            roundNumber: 2,
            title: bannerFormData.r2Title || "Round 2",
            bannerUrl: bannerFormData.r2BannerUrl,
            scheduledTime: bannerFormData.r2Time,
          },
          {
            roundNumber: 3,
            title: bannerFormData.r3Title || "Round 3",
            bannerUrl: bannerFormData.r3BannerUrl,
            scheduledTime: bannerFormData.r3Time,
          },
        ],
      });
      setShowBannerModal(false);
      await loadStatus(true);
      alert("Event details, university banners, and schedules updated successfully!");
    } catch (err: unknown) {
      alert("Failed to update event: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingBanners(false);
    }
  };

  const handleManualCheckIn = async (memberId: string, roundNumber: number, memberName: string) => {
    if (!window.confirm(`Emergency Check-in: Manually admit ${memberName} to Round ${roundNumber}?`)) return;
    try {
      setManualCheckingInId(`${memberId}_${roundNumber}`);
      const res = await api.manualVentureCheckIn({
        memberId,
        roundNumber,
        gateOperator: "Admin Console Manual Override",
      });
      alert(res.message);
      await loadStatus(true);
    } catch (err: unknown) {
      alert("Manual check-in failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setManualCheckingInId(null);
    }
  };

  const handlePurge = async () => {
    try {
      setPurging(true);
      await api.purgeVentureEvent();
      setShowPurgeModal(false);
      await loadStatus();
    } catch (err: unknown) {
      alert("Failed to purge test event.");
    } finally {
      setPurging(false);
    }
  };

  // Suggested Next Team ID based on existing teams
  const getSuggestedTeamId = () => {
    if (!data?.teams || data.teams.length === 0) return "Team 1";
    let maxId = 0;
    for (const t of data.teams) {
      const match = t.teamName.match(/^(?:Team\s*#?\s*|ID\s*#?\s*|#\s*)(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxId) maxId = num;
      }
    }
    return `Team ${maxId > 0 ? maxId + 1 : data.teams.length + 1}`;
  };

  // On-Spot Registration Handlers
  const handleOpenOnSpotModal = () => {
    setOnSpotFormData({
      teamId: getSuggestedTeamId(),
      teamName: "",
      leaderName: "",
      leaderEmail: "",
      m1Name: "",
      m1Email: "",
      m2Name: "",
      m2Email: "",
      m3Name: "",
      m3Email: "",
      sendEmailNow: true,
      roundNumber: 3,
    });
    setOnSpotError(null);
    setOnSpotSuccess(null);
    setShowOnSpotModal(true);
  };

  const handleCreateOnSpotTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTeamName = onSpotFormData.teamName.trim()
      ? `${onSpotFormData.teamId.trim()} - ${onSpotFormData.teamName.trim()}`
      : onSpotFormData.teamId.trim();

    if (!finalTeamName) {
      setOnSpotError("Team ID / Name is required.");
      return;
    }
    if (!onSpotFormData.leaderName.trim() || !onSpotFormData.leaderEmail.trim()) {
      setOnSpotError("Team Leader name and email are required.");
      return;
    }

    const members: Array<{ fullName: string; email: string; role: "LEADER" | "MEMBER" }> = [
      {
        fullName: onSpotFormData.leaderName.trim(),
        email: onSpotFormData.leaderEmail.trim().toLowerCase(),
        role: "LEADER",
      },
    ];

    if (onSpotFormData.m1Email.trim()) {
      members.push({
        fullName: onSpotFormData.m1Name.trim() || "Member 1",
        email: onSpotFormData.m1Email.trim().toLowerCase(),
        role: "MEMBER",
      });
    }
    if (onSpotFormData.m2Email.trim()) {
      members.push({
        fullName: onSpotFormData.m2Name.trim() || "Member 2",
        email: onSpotFormData.m2Email.trim().toLowerCase(),
        role: "MEMBER",
      });
    }
    if (onSpotFormData.m3Email.trim()) {
      members.push({
        fullName: onSpotFormData.m3Name.trim() || "Member 3",
        email: onSpotFormData.m3Email.trim().toLowerCase(),
        role: "MEMBER",
      });
    }

    setCreatingOnSpot(true);
    setOnSpotError(null);
    try {
      const res = await api.createOnSpotVentureTeam({
        teamName: finalTeamName,
        members,
        sendEmailNow: onSpotFormData.sendEmailNow,
        roundNumber: onSpotFormData.roundNumber,
      });

      setOnSpotSuccess({
        team: res.team,
        members: res.members,
      });
      await loadStatus(true);
    } catch (err: unknown) {
      setOnSpotError(err instanceof Error ? err.message : "Failed to register on-spot team.");
    } finally {
      setCreatingOnSpot(false);
    }
  };

  // Add Member to Existing Vacant Team Slot
  const handleOpenAddMemberModal = (team: VentureTeamDTO) => {
    setTargetTeam({ id: team.id, teamName: team.teamName });
    setAddMemberFormData({
      fullName: "",
      email: "",
      role: team.members.length === 0 ? "LEADER" : "MEMBER",
      sendEmailNow: true,
      roundNumber: 1,
    });
    setAddMemberError(null);
    setShowAddMemberModal(true);
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeam) return;
    if (!addMemberFormData.fullName.trim() || !addMemberFormData.email.trim()) {
      setAddMemberError("Candidate full name and email are required.");
      return;
    }

    setAddingMember(true);
    setAddMemberError(null);
    try {
      await api.addVentureMemberToTeam(targetTeam.id, {
        fullName: addMemberFormData.fullName.trim(),
        email: addMemberFormData.email.trim().toLowerCase(),
        role: addMemberFormData.role,
        sendEmailNow: addMemberFormData.sendEmailNow,
        roundNumber: addMemberFormData.roundNumber,
      });

      setShowAddMemberModal(false);
      await loadStatus(true);
      alert(`Candidate ${addMemberFormData.fullName} added successfully to ${targetTeam.teamName}!`);
    } catch (err: unknown) {
      setAddMemberError(err instanceof Error ? err.message : "Failed to add candidate to team.");
    } finally {
      setAddingMember(false);
    }
  };

  // Edit Team Name / Team ID
  const handleOpenEditTeamModal = (team: VentureTeamDTO) => {
    setEditingTeam({ id: team.id, teamName: team.teamName });
    setEditingTeamName(team.teamName);
    setEditTeamError(null);
    setShowEditTeamModal(true);
  };

  const handleSaveTeamName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    if (!editingTeamName.trim()) {
      setEditTeamError("Team name cannot be empty.");
      return;
    }

    setSavingTeam(true);
    setEditTeamError(null);
    try {
      await api.updateVentureTeam(editingTeam.id, { teamName: editingTeamName.trim() });
      setShowEditTeamModal(false);
      await loadStatus(true);
    } catch (err: unknown) {
      setEditTeamError(err instanceof Error ? err.message : "Failed to update team name.");
    } finally {
      setSavingTeam(false);
    }
  };

  // Edit Member / Delegate Details
  const handleOpenEditMemberModal = (member: VentureMemberDTO, currentTeamId: string) => {
    setEditingMember({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      currentTeamId,
    });
    setEditingMemberData({
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      teamId: currentTeamId,
    });
    setEditMemberError(null);
    setShowEditMemberModal(true);
  };

  const handleSaveMemberDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMemberData.fullName.trim() || !editingMemberData.email.trim()) {
      setEditMemberError("Full name and email cannot be empty.");
      return;
    }

    setSavingMember(true);
    setEditMemberError(null);
    try {
      await api.updateVentureMember(editingMember.id, {
        fullName: editingMemberData.fullName.trim(),
        email: editingMemberData.email.trim().toLowerCase(),
        role: editingMemberData.role,
        teamId: editingMemberData.teamId !== editingMember.currentTeamId ? editingMemberData.teamId : undefined,
      });
      setShowEditMemberModal(false);
      await loadStatus(true);
    } catch (err: unknown) {
      setEditMemberError(err instanceof Error ? err.message : "Failed to update member details.");
    } finally {
      setSavingMember(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove delegate "${memberName}"? Their passes will also be removed.`)) {
      return;
    }
    try {
      setDeletingMemberId(memberId);
      await api.removeVentureMember(memberId);
      if (showEditMemberModal) setShowEditMemberModal(false);
      await loadStatus(true);
    } catch (err: unknown) {
      alert("Failed to remove member: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDeletingMemberId(null);
    }
  };

  // Individual Pass Email Dispatch
  const handleSendIndividualPass = async (memberId: string, roundNumber: 1 | 2 | 3 = 3) => {
    try {
      setSendingPassMemberId(memberId);
      await api.sendIndividualVenturePass(memberId, roundNumber);
      setSentSuccessMemberId(memberId);
      setTimeout(() => setSentSuccessMemberId(null), 3000);
      await loadStatus(true);
    } catch (err: unknown) {
      alert("Failed to send pass email: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSendingPassMemberId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff2a54] mb-3" />
        <span className="text-sm font-bold text-zinc-400">Loading Venture Vault Command Center...</span>
      </div>
    );
  }

  const event = data?.event;
  const stats = data?.stats;
  const sub1 = event?.subEvents?.find((s) => s.roundNumber === 1);
  const sub2 = event?.subEvents?.find((s) => s.roundNumber === 2);
  const sub3 = event?.subEvents?.find((s) => s.roundNumber === 3);

  // Filtered members for Attendance Table
  const filteredTeams = (data?.teams || []).filter((team) => {
    if (filterVacantOnly && team.members.length >= 4) {
      return false;
    }
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some(
        (m) =>
          m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (filterRound === "r1") {
      return team.members.some((m) => m.round1.status === "CHECKED_IN");
    }
    if (filterRound === "r2") {
      return team.members.some((m) => m.round2.status === "CHECKED_IN");
    }
    if (filterRound === "r3") {
      return team.members.some((m) => m.round3.status === "CHECKED_IN");
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 relative z-10 animate-fade-in font-sans text-white">
      
      {/* Upper Navigation / Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff2a54] bg-[#e23744]/15 border border-[#e23744]/30 px-2.5 py-0.5 rounded-md">
              Private 70+ Team Delegation System
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Multi-SMTP Protected
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-white mt-1 tracking-tight">
            {event?.title || "Venture Vault 2026"} Console
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Multi-stage delegation control center. Manage 70+ teams, progressive round pass releases, and live zero-OTP gate attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => loadStatus(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#ff2a54]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Download CSV Attendance Ledger"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ff2a54]" />
            ) : (
              <Download className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>{exporting ? "Generating CSV..." : "Export Audit Ledger"}</span>
          </button>

          <button
            onClick={openBannerModal}
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
            title="Edit Master Event Name, Round Titles, University Banners & Timings"
          >
            <Image className="h-3.5 w-3.5 text-purple-400" />
            <span>Edit Event & Banners</span>
          </button>

          <a
            href="/scanner"
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Open Gate Scanner Console"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Gate Scanner</span>
          </a>

          <button
            onClick={() => {
              setPinModalError(null);
              setPinModalSuccess(null);
              setShowPinModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold font-mono text-cyan-300 hover:text-cyan-200 transition flex items-center gap-1.5 cursor-pointer"
            title="Create and Manage Volunteer Gate Scanner PINs"
          >
            <DoorOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>Volunteer PINs ({volunteerPins.length})</span>
          </button>

          <button
            onClick={handleOpenOnSpotModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 cursor-pointer"
            title="Register a New Team On The Spot"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ On-Spot Register</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="district-btn-primary px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Team Roster</span>
          </button>

          {/* Safety Live Lock */}
          <button
            onClick={() => setIsLiveEventLocked(!isLiveEventLocked)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isLiveEventLocked
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                : "bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white"
            }`}
            title="Lock event data against accidental deletion"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{isLiveEventLocked ? "Live Mode: Locked" : "Safety Lock: Off"}</span>
          </button>

          <button
            onClick={() => {
              if (isLiveEventLocked) {
                alert("Event Live Lock is ACTIVE. You must turn off Safety Lock to purge test data.");
                return;
              }
              setPurgeConfirmationText("");
              setShowPurgeModal(true);
            }}
            disabled={isLiveEventLocked}
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-400 hover:text-rose-200 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title={isLiveEventLocked ? "Locked during live event" : "Purge / Reset Test Event"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Volunteer Gate Scanner Access Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#14141b] via-[#101017] to-[#0c0c11] border border-white/10 my-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Appointed Gate Volunteer Scanner Link</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase font-bold">
                Volunteer Access
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Give this URL to appointed security volunteers. They have zero access to this dashboard, candidate rosters, or pass dispatching.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 font-mono text-xs text-zinc-300">
            <span className="text-zinc-500">Scanner Link:</span>
            <span className="text-emerald-400 font-bold select-all">{window.location.origin}/scanner</span>
          </div>
          <a
            href="/scanner"
            target="_blank"
            rel="noreferrer"
            className="district-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 shadow cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Launch Gate Scanner</span>
          </a>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
            Teams Registered
          </span>
          <div className="text-2xl font-black text-white font-display mt-1">
            {stats?.totalTeams || 0} <span className="text-xs text-zinc-500 font-bold">/ 70+ Max</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
            Total Candidates
          </span>
          <div className="text-2xl font-black text-white font-display mt-1">
            {stats?.totalMembers || 0} <span className="text-xs text-zinc-500 font-bold">members</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold truncate max-w-[130px]" title={sub1?.title || "Round 1"}>
              {sub1?.title ? (sub1.title.length > 15 ? sub1.title.slice(0, 13) + "..." : sub1.title) : "Round 1"} Check-ins
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
              Sent: {stats?.round1.sent || 0}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display mt-1">
            {stats?.round1.checkedIn || 0}
            <span className="text-xs text-zinc-500 font-bold">
              {" "}({stats?.totalMembers ? Math.round((stats.round1.checkedIn / stats.totalMembers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold truncate max-w-[130px]" title={sub2?.title || "Round 2"}>
              {sub2?.title ? (sub2.title.length > 15 ? sub2.title.slice(0, 13) + "..." : sub2.title) : "Round 2"} Check-ins
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
              Sent: {stats?.round2.sent || 0}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display mt-1">
            {stats?.round2.checkedIn || 0}
            <span className="text-xs text-zinc-500 font-bold">
              {" "}({stats?.totalMembers ? Math.round((stats.round2.checkedIn / stats.totalMembers) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c0c11] border border-white/10 text-left col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold truncate max-w-[130px]" title={sub3?.title || "Round 3"}>
              {sub3?.title ? (sub3.title.length > 15 ? sub3.title.slice(0, 13) + "..." : sub3.title) : "Round 3"} Check-ins
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
              Sent: {stats?.round3.sent || 0}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display mt-1">
            {stats?.round3.checkedIn || 0}
            <span className="text-xs text-zinc-500 font-bold">
              {" "}({stats?.totalMembers ? Math.round((stats.round3.checkedIn / stats.totalMembers) * 100) : 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Sub-Event Milestone Cards */}
      <div className="my-8 text-left">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-black text-white">Event Milestones & Pass Dispatch</h2>
            <p className="text-xs text-zinc-400">
              Releases passes progressively before each round. Dispatches via dedicated SMTP channels to protect quotas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(event?.subEvents || []).map((sub) => {
            const roundNum = sub.roundNumber as 1 | 2 | 3;
            const roundStats = roundNum === 1 ? stats?.round1 : roundNum === 2 ? stats?.round2 : stats?.round3;

            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-[#0c0c11] border border-white/10 overflow-hidden flex flex-col shadow-2xl relative group"
              >
                {/* Poster Banner */}
                <div className="h-40 w-full relative overflow-hidden bg-[#14141b]">
                  {sub.bannerUrl ? (
                    <img src={sub.bannerUrl} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-xs">
                      No Banner Set
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c11] via-[#0c0c11]/40 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-white border border-white/10">
                    Round {sub.roundNumber} of 3
                  </div>
                </div>

                {/* Sub-Event Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-display font-bold text-white leading-tight">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <span>{sub.scheduledTime || "As Scheduled"}</span>
                    </p>

                    <div className="mt-4 p-3 rounded-xl bg-[#14141b] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Passes Dispatched:</span>
                      <span className="font-bold text-white font-mono">
                        {roundStats?.sent || 0} / {stats?.totalMembers || 0}
                      </span>
                    </div>

                    <div className="mt-2 p-3 rounded-xl bg-[#14141b] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono">Gate Attendance:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {roundStats?.checkedIn || 0} Checked In
                      </span>
                    </div>
                  </div>

                  {/* Dispatch Action */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <button
                      onClick={() => startBatchDispatch(roundNum)}
                      className="district-btn-primary w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Dispatch {sub.title} Passes</span>
                    </button>
                    <p className="text-[10px] text-zinc-500 text-center mt-2 font-mono">
                      Uses SMTP Mail {roundNum} • Batches of 15 emails
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Gate Passes & Volunteer PINs Terminal Management Card */}
      <div className="my-8 rounded-3xl bg-[#0c0c11] border border-cyan-500/20 p-5 md:p-6 shadow-2xl text-left relative overflow-hidden">
        {/* Subtle accent gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                Gate Security & Volunteer Terminals
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-display font-black text-white mt-1">
              Security Gate Passes & Volunteer PINs
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl">
              Create temporary 6-digit volunteer PINs for entrance security and stage desks. Volunteers use the <a href="/scanner" className="text-cyan-400 underline font-mono">/scanner</a> portal to scan passes with zero access to organizer financials or participant rosters.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => {
                setPinModalError(null);
                setPinModalSuccess(null);
                setShowPinModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Create Volunteer PIN</span>
            </button>
            <button
              onClick={loadVolunteerPins}
              disabled={loadingPins}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingPins ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PINs List / Table */}
        <div className="mt-5 relative z-10">
          {loadingPins && volunteerPins.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400 mb-2" />
              <span className="text-xs">Loading volunteer security terminals...</span>
            </div>
          ) : volunteerPins.length === 0 ? (
            <div className="py-10 px-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <DoorOpen className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-zinc-300">No Volunteer PINs Created Yet</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                Generate 6-digit numerical PINs for your event staff, security officers, or student coordinators so they can scan passes at gates.
              </p>
              <button
                onClick={() => {
                  setPinModalError(null);
                  setPinModalSuccess(null);
                  setShowPinModal(true);
                }}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Issue First Volunteer PIN</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {volunteerPins.map((pin) => (
                <div
                  key={pin.id}
                  className={`rounded-2xl border p-4 transition-all relative group ${
                    pin.isActive
                      ? "bg-[#111118] border-white/10 hover:border-cyan-500/40"
                      : "bg-[#0f0f14]/60 border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-cyan-400" />
                          {pin.staffName}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            pin.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border border-white/10"
                          }`}
                        >
                          {pin.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                        <DoorOpen className="h-3 w-3 text-zinc-500" />
                        <span>{pin.gateName}</span>
                      </div>
                    </div>

                    {/* Delete / Revoke Action */}
                    <button
                      onClick={() => handleDeleteVolunteerPin(pin.id, pin.staffName)}
                      disabled={deletingPinId === pin.id}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer disabled:opacity-50"
                      title="Revoke / Delete Volunteer PIN Immediately"
                    >
                      {deletingPinId === pin.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 6-Digit PIN Display Block */}
                  <div className="mt-3.5 p-2.5 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                        6-Digit Volunteer PIN
                      </span>
                      <span className="text-lg font-mono font-black tracking-widest text-cyan-300">
                        {pin.pin}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyPin(pin.pin, pin.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                        copiedPinId === pin.id
                          ? "bg-emerald-500 text-black"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10"
                      }`}
                      title="Copy 6-Digit PIN to share with volunteer"
                    >
                      {copiedPinId === pin.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy PIN</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Metrics Footer */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <strong className="text-white">{pin.scansCount}</strong> check-ins
                      {pin.lastScannedAt && (
                        <span className="text-zinc-500 text-[10px] ml-1">
                          • Last: {formatTimeIST(pin.lastScannedAt)}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => handleToggleVolunteerPin(pin.id)}
                      className="text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                    >
                      {pin.isActive ? "Disable PIN" : "Enable PIN"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Attendance Matrix */}
      <div className="my-8 rounded-3xl bg-[#0c0c11] border border-white/10 p-5 md:p-6 shadow-2xl text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-display font-black text-white">Live Delegation Attendance Ledger</h2>
            <p className="text-xs text-zinc-400">
              Real-time check-in telemetry across all 70+ teams and individual candidates for all 3 rounds.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or candidate..."
                className="pl-9 pr-4 py-1.5 bg-[#14141b] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744] font-mono"
              />
            </div>

            <div className="flex bg-[#14141b] border border-white/5 p-1 rounded-xl gap-1 text-[11px] font-mono">
              <button
                onClick={() => setFilterRound("all")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterRound === "all" ? "bg-[#e23744] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRound("r1")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterRound === "r1" ? "bg-[#e23744] text-white" : "text-zinc-400 hover:text-white"
                }`}
                title={sub1?.title || "Round 1"}
              >
                {sub1?.title ? `R1 (${sub1.title.length > 10 ? sub1.title.slice(0, 8) + '...' : sub1.title})` : "R1 Present"}
              </button>
              <button
                onClick={() => setFilterRound("r2")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterRound === "r2" ? "bg-[#e23744] text-white" : "text-zinc-400 hover:text-white"
                }`}
                title={sub2?.title || "Round 2"}
              >
                {sub2?.title ? `R2 (${sub2.title.length > 10 ? sub2.title.slice(0, 8) + '...' : sub2.title})` : "R2 Present"}
              </button>
              <button
                onClick={() => setFilterRound("r3")}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  filterRound === "r3" ? "bg-[#e23744] text-white" : "text-zinc-400 hover:text-white"
                }`}
                title={sub3?.title || "Round 3"}
              >
                {sub3?.title ? `R3 (${sub3.title.length > 10 ? sub3.title.slice(0, 8) + '...' : sub3.title})` : "R3 Present"}
              </button>
              <button
                onClick={() => setFilterVacantOnly(!filterVacantOnly)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterVacantOnly
                    ? "bg-amber-500 text-black font-extrabold"
                    : "text-amber-400/80 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20"
                }`}
                title="Filter to show only teams with vacant spots (< 4 members)"
              >
                <span>Vacant Teams (&lt;4)</span>
              </button>
            </div>

            <button
              onClick={handleOpenOnSpotModal}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Quick On-Spot Team Registration"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ On-Spot Team</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#14141b]/60 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-center">{sub1?.title || "Round 1"}</th>
                <th className="py-3 px-3 text-center">{sub2?.title || "Round 2"}</th>
                <th className="py-3 px-3 text-center">{sub3?.title || "Round 3"}</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    No teams or candidates match the filter. Upload an Excel roster or register on-spot to populate.
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  if (team.members.length === 0) {
                    return (
                      <tr key={team.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-bold text-white align-top border-r border-white/5 bg-[#14141b]/30">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-mono text-xs">{team.teamName}</span>
                            <button
                              onClick={() => handleOpenEditTeamModal(team)}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                              title="Edit Team Name / ID"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="block text-[10px] text-amber-400 font-normal mt-1">
                            0/4 members (Vacant)
                          </span>
                        </td>
                        <td colSpan={5} className="py-3 px-4 text-zinc-500 text-xs italic">
                          No candidates registered in this team yet.
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenAddMemberModal(team)}
                            className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono cursor-pointer transition"
                          >
                            + Add Attendee
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return team.members.map((m, mIdx) => {
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition">
                        {mIdx === 0 ? (
                          <td
                            rowSpan={Math.max(1, team.members.length)}
                            className="py-3 px-4 font-bold text-white align-top border-r border-white/5 bg-[#14141b]/30"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="font-mono text-xs">{team.teamName}</span>
                              <button
                                onClick={() => handleOpenEditTeamModal(team)}
                                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
                                title="Edit Team Name / ID"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-1.5">
                              <span className="text-[10px] text-zinc-500 font-normal">
                                {team.members.length}/4 members
                              </span>
                              {team.members.length < 4 && (
                                <button
                                  onClick={() => handleOpenAddMemberModal(team)}
                                  className="px-1.5 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-0.5 cursor-pointer transition shrink-0"
                                  title="Add Attendee to fill vacant spot in this team"
                                >
                                  <Plus className="h-2.5 w-2.5" /> Slot Open
                                </button>
                              )}
                            </div>
                          </td>
                        ) : null}

                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-white block">{m.fullName}</span>
                              <span className="text-[11px] text-zinc-500 font-mono">{m.email}</span>
                            </div>
                            <button
                              onClick={() => handleOpenEditMemberModal(m, team.id)}
                              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-white/10 transition cursor-pointer opacity-70 hover:opacity-100 shrink-0"
                              title="Edit Candidate Details or Divert to Another Team"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              m.role === "LEADER"
                                ? "bg-[#e23744]/15 border border-[#e23744]/30 text-[#ff2a54]"
                                : "bg-white/5 text-zinc-400"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>

                        {/* Round 1 Status */}
                        <td className="py-2.5 px-3 text-center font-mono">
                          {m.round1.status === "CHECKED_IN" ? (
                            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              {m.round1.checkedInAt ? formatTimeIST(m.round1.checkedInAt, false, true) : "In"}
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className={m.round1.status === "SENT" ? "text-amber-400 text-[10px]" : "text-zinc-600 text-[10px]"}>
                                {m.round1.status === "SENT" ? "Pass Sent" : "Pending"}
                              </span>
                              <button
                                onClick={() => handleManualCheckIn(m.id, 1, m.fullName)}
                                disabled={manualCheckingInId === `${m.id}_1`}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono cursor-pointer transition disabled:opacity-50"
                                title="Emergency Manual Admit to Round 1"
                              >
                                {manualCheckingInId === `${m.id}_1` ? "..." : "+ Admit"}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Round 2 Status */}
                        <td className="py-2.5 px-3 text-center font-mono">
                          {m.round2.status === "CHECKED_IN" ? (
                            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              {m.round2.checkedInAt ? formatTimeIST(m.round2.checkedInAt, false, true) : "In"}
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className={m.round2.status === "SENT" ? "text-amber-400 text-[10px]" : "text-zinc-600 text-[10px]"}>
                                {m.round2.status === "SENT" ? "Pass Sent" : "Pending"}
                              </span>
                              <button
                                onClick={() => handleManualCheckIn(m.id, 2, m.fullName)}
                                disabled={manualCheckingInId === `${m.id}_2`}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono cursor-pointer transition disabled:opacity-50"
                                title="Emergency Manual Admit to Round 2"
                              >
                                {manualCheckingInId === `${m.id}_2` ? "..." : "+ Admit"}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Round 3 Status */}
                        <td className="py-2.5 px-3 text-center font-mono">
                          {m.round3.status === "CHECKED_IN" ? (
                            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1 text-[11px]">
                              <CheckCircle2 className="h-3 w-3" />
                              {m.round3.checkedInAt ? formatTimeIST(m.round3.checkedInAt, false, true) : "In"}
                            </span>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <span className={m.round3.status === "SENT" ? "text-amber-400 text-[10px]" : "text-zinc-600 text-[10px]"}>
                                {m.round3.status === "SENT" ? "Pass Sent" : "Pending"}
                              </span>
                              <button
                                onClick={() => handleManualCheckIn(m.id, 3, m.fullName)}
                                disabled={manualCheckingInId === `${m.id}_3`}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono cursor-pointer transition disabled:opacity-50"
                                title="Emergency Manual Admit to Round 3"
                              >
                                {manualCheckingInId === `${m.id}_3` ? "..." : "+ Admit"}
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Instant Send Pass Email */}
                            <button
                              onClick={() => handleSendIndividualPass(m.id, 3)}
                              disabled={sendingPassMemberId === m.id}
                              className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 cursor-pointer transition ${
                                sentSuccessMemberId === m.id
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                              title="Send or Resend Pass Email for Round 3"
                            >
                              {sendingPassMemberId === m.id ? (
                                <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                              ) : sentSuccessMemberId === m.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Mail className="h-3 w-3 text-blue-400" />
                              )}
                              <span>{sentSuccessMemberId === m.id ? "Sent!" : "Email Pass"}</span>
                            </button>

                            <button
                              onClick={() => handleCopyPassLink(m.uniqueToken, 3)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-[10px] font-mono flex items-center gap-1 cursor-pointer transition"
                              title="Copy Direct Pass Link for Round 3"
                            >
                              {copiedToken === `${m.uniqueToken}_3` ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>Pass URL</span>
                            </button>

                            <a
                              href={`/venture-pass/${m.uniqueToken}?round=3`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                              title="Preview Mobile Pass (Round 3)"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/10 bg-[#0c0c11] p-6 shadow-2xl flex flex-col overflow-hidden text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-display font-bold text-white">
                  Upload Team Roster Spreadsheet (.xlsx / .csv)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setParsedPreview(null);
                }}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 overflow-y-auto space-y-4 text-xs pr-1">
              {!parsedPreview ? (
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-[#e23744]/50 rounded-2xl p-8 text-center cursor-pointer transition bg-[#14141b]/40 hover:bg-[#14141b]/80"
                  >
                    <Upload className="h-8 w-8 text-[#ff2a54] mx-auto mb-2" />
                    <p className="font-bold text-white text-sm">Click to select or drag & drop Excel / CSV file</p>
                    <p className="text-zinc-500 text-[11px] mt-1 font-mono">
                      Accepts: .xlsx, .xls, .csv with Team Name, Leader Name/Email, and Member Names/Emails.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {uploadError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">
                      Parsed Preview: {parsedPreview.length} Teams detected ({parsedPreview.reduce((acc, t) => acc + t.members.length, 0)} total participants)
                    </span>
                    <button
                      onClick={() => setParsedPreview(null)}
                      className="text-xs text-[#ff2a54] hover:underline cursor-pointer"
                    >
                      Choose Different File
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#14141b] p-3 space-y-3 font-mono text-[11px]">
                    {parsedPreview.map((t, idx) => (
                      <div key={idx} className="pb-2 border-b border-white/5 last:border-b-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-emerald-400 font-bold">{t.teamName}</span>
                          <span className="text-zinc-400 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                            {t.members.length} {t.members.length === 1 ? "person" : "persons"} ({t.members.filter(m => m.role === "LEADER").length} Leader, {t.members.filter(m => m.role !== "LEADER").length} Members)
                          </span>
                        </div>
                        <div className="pl-3 text-zinc-400 space-y-0.5 mt-1">
                          {t.members.map((m, mIdx) => (
                            <div key={mIdx} className="flex justify-between">
                              <span className="text-white">{m.fullName} <span className="text-zinc-500">({m.role})</span></span>
                              <span className="text-zinc-500">{m.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {uploadProgress && (
                    <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                      <div className="flex justify-between font-mono text-emerald-400 font-bold">
                        <span>Ingesting Teams ({uploadProgress.current} / {uploadProgress.total})...</span>
                        <span>Batch {uploadProgress.batchIndex} of {uploadProgress.totalBatches}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{
                            width: `${uploadProgress.total ? Math.round((uploadProgress.current / uploadProgress.total) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono block">
                        ⚡ Vercel-optimized micro-batch ingestion running. Please keep this modal open.
                      </span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={uploadingRoster}
                onClick={() => {
                  setShowUploadModal(false);
                  setParsedPreview(null);
                  setUploadProgress(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              {parsedPreview && (
                <button
                  type="button"
                  disabled={uploadingRoster}
                  onClick={handleConfirmRosterUpload}
                  className="district-btn-primary px-5 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {uploadingRoster ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>
                        {uploadProgress
                          ? `Ingesting (${uploadProgress.current}/${uploadProgress.total})...`
                          : "Ingesting Roster..."}
                      </span>
                    </>
                  ) : (
                    <span>Confirm & Ingest Roster</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vercel-Safe Micro-Batch Dispatcher Modal */}
      {dispatchModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0c11] p-6 sm:p-8 shadow-2xl flex flex-col text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#e23744]/15 border border-[#e23744]/30 text-[#ff2a54]">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-display font-black text-white">
                  Dispatching Round {dispatchModal.roundNumber} Passes
                </h3>
                <p className="text-xs text-zinc-400">
                  Micro-batch delivery via SMTP Stage {dispatchModal.roundNumber}
                </p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="my-4">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-zinc-400">
                  {dispatchModal.isRunning ? "Dispatching in batches of 15..." : "Dispatch Complete!"}
                </span>
                <span className="font-bold text-white">
                  {dispatchModal.sentCount} / {dispatchModal.totalCount} Sent (
                  {dispatchModal.totalCount
                    ? Math.round((dispatchModal.sentCount / dispatchModal.totalCount) * 100)
                    : 0}
                  %)
                </span>
              </div>

              {/* Crimson Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[#14141b] border border-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#e23744] to-[#ff2a54] transition-all duration-300 relative"
                  style={{
                    width: `${dispatchModal.totalCount ? (dispatchModal.sentCount / dispatchModal.totalCount) * 100 : 0}%`,
                  }}
                >
                  {dispatchModal.isRunning && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>
                  Batch {dispatchModal.currentBatch} of {dispatchModal.totalBatches}
                </span>
                {dispatchModal.currentTeamNames.length > 0 && (
                  <span className="text-zinc-400 truncate max-w-[200px]">
                    Current: {dispatchModal.currentTeamNames.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* Error notifications if any */}
            {dispatchModal.errors.length > 0 && (
              <div className="max-h-28 overflow-y-auto p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono space-y-1 my-2">
                {dispatchModal.errors.map((e, idx) => (
                  <div key={idx}>⚠️ {e}</div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                disabled={dispatchModal.isRunning}
                onClick={() => setDispatchModal((prev) => ({ ...prev, open: false }))}
                className="district-btn-primary px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                {dispatchModal.isRunning ? "Sending in Background..." : "Close Window"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Test Event Confirmation Modal with Double-Lock */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#0c0c11] p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-black text-white">Reset & Purge Test Event</h3>
                <p className="text-[11px] text-zinc-400">Double-Lock Protection Active</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed my-2">
              This action will permanently delete all test teams, candidates, passes, and gate scan logs from Venture Vault.
              Before proceeding, please export your audit report via the <strong>Export Audit Ledger</strong> button.
            </p>

            <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs">
              <label className="block text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1.5 font-mono">
                Type <span className="text-white underline">CONFIRM PURGE</span> to unlock:
              </label>
              <input
                type="text"
                value={purgeConfirmationText}
                onChange={(e) => setPurgeConfirmationText(e.target.value)}
                placeholder="CONFIRM PURGE"
                className="w-full bg-[#14141b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 font-mono font-bold"
              />
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purging || purgeConfirmationText.trim() !== "CONFIRM PURGE"}
                onClick={handlePurge}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {purging ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Purging Test Data...</span>
                  </>
                ) : (
                  <span>Yes, Purge Test Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* University Banner, Event Names & Schedule Editor Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-[#0c0c11] p-6 md:p-8 shadow-2xl flex flex-col text-left my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Image className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-white">Event Names, Banners & Schedules</h3>
                  <p className="text-xs text-zinc-400">Customize official event branding, round titles, posters & reporting timings</p>
                </div>
              </div>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 my-6 max-h-[62vh] overflow-y-auto pr-2">
              {/* Master Summit Branding */}
              <div className="p-4 rounded-2xl bg-[#14141b] border border-white/5 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    Master Event Name / Title
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.masterTitle}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, masterTitle: e.target.value })}
                    placeholder="e.g. Venture Vault 2026 or Innovation Summit"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Master Summit Poster / Banner URL
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.masterBannerUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, masterBannerUrl: e.target.value })}
                    placeholder="https://... (image URL)"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  {bannerFormData.masterBannerUrl && (
                    <div className="mt-2 h-24 w-full rounded-xl overflow-hidden bg-black/50 border border-white/5">
                      <img src={bannerFormData.masterBannerUrl} alt="Master preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Round 1 */}
              <div className="p-4 rounded-2xl bg-[#14141b] border border-white/5 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff2a54] bg-[#e23744]/15 px-2 py-0.5 rounded">
                  Round 1 Configuration
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 1 Name / Sub-Event Title:</label>
                  <input
                    type="text"
                    value={bannerFormData.r1Title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r1Title: e.target.value })}
                    placeholder="e.g. Round 1: Preliminary Pitch & Strategy Defense"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 1 Banner URL:</label>
                  <input
                    type="text"
                    value={bannerFormData.r1BannerUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r1BannerUrl: e.target.value })}
                    placeholder="https://... (Round 1 Poster URL)"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 1 Scheduled Time:</label>
                  <input
                    type="text"
                    value={bannerFormData.r1Time}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r1Time: e.target.value })}
                    placeholder="10:00 AM - 01:00 PM"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Round 2 */}
              <div className="p-4 rounded-2xl bg-[#14141b] border border-white/5 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">
                  Round 2 Configuration
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 2 Name / Sub-Event Title:</label>
                  <input
                    type="text"
                    value={bannerFormData.r2Title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r2Title: e.target.value })}
                    placeholder="e.g. Round 2: Prototype Showcase & Architectural Review"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 2 Banner URL:</label>
                  <input
                    type="text"
                    value={bannerFormData.r2BannerUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r2BannerUrl: e.target.value })}
                    placeholder="https://... (Round 2 Poster URL)"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 2 Scheduled Time:</label>
                  <input
                    type="text"
                    value={bannerFormData.r2Time}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r2Time: e.target.value })}
                    placeholder="02:00 PM - 05:00 PM"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Round 3 */}
              <div className="p-4 rounded-2xl bg-[#14141b] border border-white/5 space-y-2.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">
                  Round 3 Configuration
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 3 Name / Sub-Event Title:</label>
                  <input
                    type="text"
                    value={bannerFormData.r3Title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r3Title: e.target.value })}
                    placeholder="e.g. Round 3: Grand Finale Showcase & Awards Ceremony"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 3 Banner URL:</label>
                  <input
                    type="text"
                    value={bannerFormData.r3BannerUrl}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r3BannerUrl: e.target.value })}
                    placeholder="https://... (Round 3 Poster URL)"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">Round 3 Scheduled Time:</label>
                  <input
                    type="text"
                    value={bannerFormData.r3Time}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, r3Time: e.target.value })}
                    placeholder="06:00 PM - 08:30 PM"
                    className="w-full bg-[#0c0c11] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingBanners}
                onClick={handleSaveBanners}
                className="district-btn-primary px-6 py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                {savingBanners ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving Banners...</span>
                  </>
                ) : (
                  <span>Save Official Banners</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Volunteer PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e0e14] border border-cyan-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <DoorOpen className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-display font-black text-white">Generate Volunteer Scanner PIN</h3>
                <p className="text-xs text-zinc-400">Issue a secure 6-digit access OTP for gate coordinators.</p>
              </div>
            </div>

            {pinModalError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{pinModalError}</span>
              </div>
            )}

            {pinModalSuccess && (
              <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{pinModalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateVolunteerPin} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Volunteer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={pinFormData.staffName}
                  onChange={(e) => setPinFormData({ ...pinFormData, staffName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Assigned Gate / Entrance Station
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    "Gate 1 - Main Auditorium",
                    "Gate 2 - East Entrance",
                    "North Gate - VIP Desk",
                    "Registration Desk 1",
                  ].map((gate) => (
                    <button
                      key={gate}
                      type="button"
                      onClick={() => setPinFormData({ ...pinFormData, gateName: gate })}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition cursor-pointer truncate ${
                        pinFormData.gateName === gate
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                          : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {gate}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={pinFormData.gateName}
                  onChange={(e) => setPinFormData({ ...pinFormData, gateName: e.target.value })}
                  placeholder="Or enter custom gate name..."
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Custom 6-Digit PIN (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pinFormData.customPin}
                    onChange={(e) => setPinFormData({ ...pinFormData, customPin: e.target.value.replace(/\D/g, "") })}
                    placeholder="Auto-generated if empty"
                    className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">Leave empty to auto-generate</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Shift Expiration
                  </label>
                  <select
                    value={pinFormData.expiresHours}
                    onChange={(e) => setPinFormData({ ...pinFormData, expiresHours: Number(e.target.value) })}
                    className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value={12}>12 Hours (Single Shift)</option>
                    <option value={24}>24 Hours (Full Day)</option>
                    <option value={48}>48 Hours (Weekend)</option>
                    <option value={0}>No Expiration (Until Revoked)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={creatingPin}
                  className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {creatingPin ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating PIN...</span>
                    </>
                  ) : (
                    <span>Create & Activate PIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-Spot Full Team Registration Modal */}
      {showOnSpotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-[#0c0c11] p-6 shadow-2xl flex flex-col text-left my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    On-Spot Team Registration
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Register a new delegation team at the venue desk. Generates passes and QR codes immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnSpotModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {onSpotError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{onSpotError}</span>
              </div>
            )}

            {onSpotSuccess ? (
              <div className="my-4 space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                  <div className="font-bold text-sm text-emerald-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Team Registered Successfully!
                  </div>
                  <div>Team: <span className="font-mono font-bold text-white">{onSpotSuccess.team.teamName}</span></div>
                  <div>{onSpotSuccess.members.length} delegates registered with active mobile passes.</div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                    Immediate Desk Pass Links:
                  </span>
                  {onSpotSuccess.members.map((m) => {
                    const passUrl = `${window.location.origin}/venture-pass/${m.uniqueToken}?round=1`;
                    return (
                      <div key={m.id} className="p-2.5 rounded-xl bg-[#14141b] border border-white/5 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-white block">{m.fullName} ({m.role})</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{m.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(passUrl);
                              alert(`Pass link copied for ${m.fullName}!`);
                            }}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition"
                          >
                            <Copy className="h-3 w-3" /> Copy URL
                          </button>
                          <a
                            href={`/venture-pass/${m.uniqueToken}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition"
                          >
                            <ExternalLink className="h-3 w-3" /> View Pass
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      setShowOnSpotModal(false);
                      setOnSpotSuccess(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateOnSpotTeam} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                      Team ID / Serial *
                    </label>
                    <input
                      type="text"
                      value={onSpotFormData.teamId}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, teamId: e.target.value })}
                      placeholder="e.g. Team 51"
                      required
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                      Team Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={onSpotFormData.teamName}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, teamName: e.target.value })}
                      placeholder="e.g. Innovators"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Team Leader */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff2a54] bg-[#e23744]/15 px-2 py-0.5 rounded">
                      Team Leader *
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={onSpotFormData.leaderName}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, leaderName: e.target.value })}
                      placeholder="Leader Full Name *"
                      required
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-semibold"
                    />
                    <input
                      type="email"
                      value={onSpotFormData.leaderEmail}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, leaderEmail: e.target.value })}
                      placeholder="Leader Email Address *"
                      required
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Member 1 */}
                <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Member 1 (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={onSpotFormData.m1Name}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m1Name: e.target.value })}
                      placeholder="Member 1 Name"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="email"
                      value={onSpotFormData.m1Email}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m1Email: e.target.value })}
                      placeholder="Member 1 Email"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Member 2 */}
                <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Member 2 (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={onSpotFormData.m2Name}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m2Name: e.target.value })}
                      placeholder="Member 2 Name"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="email"
                      value={onSpotFormData.m2Email}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m2Email: e.target.value })}
                      placeholder="Member 2 Email"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Member 3 */}
                <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Member 3 (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={onSpotFormData.m3Name}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m3Name: e.target.value })}
                      placeholder="Member 3 Name"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="email"
                      value={onSpotFormData.m3Email}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, m3Email: e.target.value })}
                      placeholder="Member 3 Email"
                      className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={onSpotFormData.sendEmailNow}
                      onChange={(e) => setOnSpotFormData({ ...onSpotFormData, sendEmailNow: e.target.checked })}
                      className="rounded accent-emerald-500 cursor-pointer h-4 w-4"
                    />
                    <span>Send Round 3 Pass Email Immediately upon registration</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowOnSpotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingOnSpot}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {creatingOnSpot && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{creatingOnSpot ? "Registering..." : "Register On-Spot Team"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add / Fill Vacant Spot in Team Modal */}
      {showAddMemberModal && targetTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/30 bg-[#0c0c11] p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Add Attendee to Team
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Target: <span className="text-emerald-400 font-bold">{targetTeam.teamName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addMemberError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{addMemberError}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={addMemberFormData.fullName}
                  onChange={(e) => setAddMemberFormData({ ...addMemberFormData, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={addMemberFormData.email}
                  onChange={(e) => setAddMemberFormData({ ...addMemberFormData, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  required
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Role
                </label>
                <select
                  value={addMemberFormData.role}
                  onChange={(e) => setAddMemberFormData({ ...addMemberFormData, role: e.target.value as "LEADER" | "MEMBER" })}
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="LEADER">LEADER</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={addMemberFormData.sendEmailNow}
                    onChange={(e) => setAddMemberFormData({ ...addMemberFormData, sendEmailNow: e.target.checked })}
                    className="rounded accent-emerald-500 cursor-pointer h-4 w-4"
                  />
                  <span>Send Pass Email Immediately (Round 1)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingMember}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {addingMember && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{addingMember ? "Adding..." : "Add to Team"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Name / Team ID Modal */}
      {showEditTeamModal && editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c11] p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Edit Team Name / ID
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Fix team typos or update serial number.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditTeamModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editTeamError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{editTeamError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeamName} className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Team Name / Label *
                </label>
                <input
                  type="text"
                  value={editingTeamName}
                  onChange={(e) => setEditingTeamName(e.target.value)}
                  placeholder="e.g. Team 12 - Alpha"
                  required
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744] font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditTeamModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTeam}
                  className="px-6 py-2.5 rounded-xl district-btn-primary text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingTeam && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{savingTeam ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Delegate / Move Team Modal */}
      {showEditMemberModal && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0c11] p-6 shadow-2xl flex flex-col text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Edit Delegate Info
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Correct typos or divert attendee to another team.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditMemberModal(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editMemberError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{editMemberError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMemberDetails} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editingMemberData.fullName}
                  onChange={(e) => setEditingMemberData({ ...editingMemberData, fullName: e.target.value })}
                  placeholder="Full Name"
                  required
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744] font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={editingMemberData.email}
                  onChange={(e) => setEditingMemberData({ ...editingMemberData, email: e.target.value })}
                  placeholder="Email Address"
                  required
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e23744] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                  Role
                </label>
                <select
                  value={editingMemberData.role}
                  onChange={(e) => setEditingMemberData({ ...editingMemberData, role: e.target.value as "LEADER" | "MEMBER" })}
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e23744] cursor-pointer"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="LEADER">LEADER</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block mb-1 flex items-center justify-between">
                  <span>Assigned Team (Divert)</span>
                  <span className="text-zinc-500 lowercase font-normal">switch team</span>
                </label>
                <select
                  value={editingMemberData.teamId}
                  onChange={(e) => setEditingMemberData({ ...editingMemberData, teamId: e.target.value })}
                  className="w-full bg-[#14141b] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#e23744] cursor-pointer font-mono"
                >
                  {(data?.teams || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.teamName} ({t.members.length}/4 members)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-between gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleRemoveMember(editingMember.id, editingMember.fullName)}
                  disabled={deletingMemberId === editingMember.id}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  title="Remove this member from team"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditMemberModal(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="px-5 py-2 rounded-xl district-btn-primary text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {savingMember && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{savingMember ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
