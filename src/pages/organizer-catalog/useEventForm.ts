import { useState, useRef } from "react";
import { api } from "../../lib/api";
import { EventDTO, InstitutionDTO, EventPolicyType } from "../../types";
import { DEFAULT_TIER } from "./constants";

export type TierDraft = { id?: string; name: string; price: number; capacity: number; description?: string };

export function useEventForm() {
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Concerts");
  const [locationType, setLocationType] = useState<"VENUE" | "ONLINE">("VENUE");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("Metropolis");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const [hasSeatingPlan, setHasSeatingPlan] = useState(false);
  const [seatingRows, setSeatingRows] = useState(10);
  const [seatingCols, setSeatingCols] = useState(10);

  const [tierName, setTierName] = useState("General Admission");
  const [tierPrice, setTierPrice] = useState("45.00");
  const [tierCapacity, setTierCapacity] = useState("100");
  const [tierDescription, setTierDescription] = useState("");
  const [tiers, setTiers] = useState<Array<{ id?: string; name: string; price: number; capacity: number; description?: string }>>([
    { name: "General Admission", price: 4500, capacity: 100, description: "Standard General Entry" }
  ]);

  // Institution Access Policy States
  const [policyType, setPolicyType] = useState<EventPolicyType>("PUBLIC");
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [requireVerifiedEmail, setRequireVerifiedEmail] = useState(true);
  const [allowFreeTickets, setAllowFreeTickets] = useState(false);
  const [customRestrictionMessage, setCustomRestrictionMessage] = useState("");

  // Registry Institutions List
  const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);

  // Poster Upload & Preset Visuals
  const [posterSourceTab, setPosterSourceTab] = useState<"upload" | "preset" | "url">("upload");
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterUploadError, setPosterUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessPosterFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setPosterUploadError("Please select a valid image file (.png, .jpg, .jpeg, .webp).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPosterUploadError("Image size exceeds 10MB limit.");
      return;
    }

    setPosterUploadError("");
    setPosterUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setPosterUploading(false);
        return;
      }

      // Optimize image using canvas
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setBannerUrl(compressedDataUrl);
        } else {
          setBannerUrl(result);
        }
        setPosterUploading(false);
      };
      img.onerror = () => {
        setBannerUrl(result);
        setPosterUploading(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      setPosterUploadError("Failed to read image file.");
      setPosterUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const [createLoading, setCreateLoading] = useState(false);

  const resetForm = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setCategory("Concerts");
    setLocationType("VENUE");
    setVenue("");
    setCity("Metropolis");
    setStartsAt("");
    setEndsAt("");
    setBannerUrl("");
    setPosterUploadError("");
    setHasSeatingPlan(false);
    setSeatingRows(10);
    setSeatingCols(10);
    setTiers([
      { name: "General Admission", price: 4500, capacity: 100, description: "Standard General Entry" }
    ]);
    setPolicyType("PUBLIC");
    setAllowedDomains([]);
    setCustomDomainInput("");
    setRequireVerifiedEmail(true);
    setAllowFreeTickets(false);
    setCustomRestrictionMessage("");
  };

  const fillFromEvent = (ev: EventDTO) => {
    setEditingEventId(ev.id);
    setTitle(ev.title || "");
    setDescription(ev.description || "");
    setCategory(ev.category || "Concerts");
    setLocationType(ev.locationType || "VENUE");
    setVenue(ev.venue || "");
    setCity(ev.city || "Metropolis");

    const formatForInput = (isoStr: string) => {
      if (!isoStr) return "";
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => (n < 10 ? "0" + n : String(n));
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartsAt(formatForInput(ev.startsAt));
    setEndsAt(formatForInput(ev.endsAt));
    setBannerUrl(ev.bannerUrl || "");
    setHasSeatingPlan(ev.hasSeatingPlan || false);
    setSeatingRows(ev.seatingRows || 10);
    setSeatingCols(ev.seatingCols || 10);
    setTiers(
      ev.ticketTiers && ev.ticketTiers.length > 0
        ? ev.ticketTiers.map((t) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            capacity: t.capacity,
            description: t.description || undefined,
          }))
        : [{ name: "General Admission", price: 4500, capacity: 100 }]
    );

    if (ev.accessPolicy) {
      setPolicyType(ev.accessPolicy.policyType || "PUBLIC");
      setAllowedDomains(ev.accessPolicy.allowedDomains || []);
      setRequireVerifiedEmail(ev.accessPolicy.requireVerifiedEmail ?? true);
      setAllowFreeTickets(ev.accessPolicy.allowFreeTickets ?? false);
      setCustomRestrictionMessage(ev.accessPolicy.customRestrictionMessage || "");
    } else {
      setPolicyType("PUBLIC");
      setAllowedDomains([]);
      setRequireVerifiedEmail(true);
      setAllowFreeTickets(false);
      setCustomRestrictionMessage("");
    }
  };

  const loadInstitutions = async () => {
    try {
      const insts = await api.getInstitutions();
      setInstitutions(insts);
    } catch (err) {
      console.warn("Failed to load institutions list", err);
    }
  };

  const handleAddTier = (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(tierPrice) * 100);
    const capacityInt = parseInt(tierCapacity, 10);

    if (tierName.trim() && !isNaN(priceCents) && !isNaN(capacityInt)) {
      setTiers([...tiers, { name: tierName, price: priceCents, capacity: capacityInt, description: tierDescription.trim() || undefined }]);
      setTierName("Standard Admission");
      setTierPrice("30.00");
      setTierCapacity("120");
      setTierDescription("");
    }
  };

  const handleRemoveTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const handleAddDomain = (domToAdd?: string) => {
    const raw = domToAdd || customDomainInput;
    const clean = raw.trim().toLowerCase().replace(/^@/, "");
    if (clean && !allowedDomains.includes(clean)) {
      setAllowedDomains([...allowedDomains, clean]);
      setCustomDomainInput("");
    }
  };

  const handleRemoveDomain = (domToRemove: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domToRemove));
  };

  const toggleInstitutionChip = (primaryDomain: string) => {
    const clean = primaryDomain.trim().toLowerCase();
    if (allowedDomains.includes(clean)) {
      handleRemoveDomain(clean);
    } else {
      handleAddDomain(clean);
    }
  };

  return {
    editingEventId, setEditingEventId,
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
    tiers, setTiers,
    policyType, setPolicyType,
    allowedDomains, setAllowedDomains,
    customDomainInput, setCustomDomainInput,
    requireVerifiedEmail, setRequireVerifiedEmail,
    allowFreeTickets, setAllowFreeTickets,
    customRestrictionMessage, setCustomRestrictionMessage,
    institutions, setInstitutions,
    posterSourceTab, setPosterSourceTab,
    isDraggingPoster, setIsDraggingPoster,
    posterUploading, posterUploadError,
    fileInputRef,
    createLoading, setCreateLoading,
    handleProcessPosterFile,
    resetForm,
    fillFromEvent,
    loadInstitutions,
    handleAddTier,
    handleRemoveTier,
    handleAddDomain,
    handleRemoveDomain,
    toggleInstitutionChip,
  };
}

export type EventFormState = ReturnType<typeof useEventForm>;
