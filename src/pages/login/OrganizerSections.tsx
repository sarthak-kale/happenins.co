import React from "react";
import { Building2, Phone, FileText, MapPin, Globe, Landmark, CreditCard, Scale, ExternalLink } from "lucide-react";
import type { OrganizerFields } from "./useOrganizerFields";

interface OrganizerSectionsProps {
  isOrganizerMode: boolean;
  organizer: OrganizerFields;
  setShowLegalModal: (open: boolean) => void;
}

export const OrganizerSections: React.FC<OrganizerSectionsProps> = ({ isOrganizerMode, organizer, setShowLegalModal }) => {
  const {
    companyName, setCompanyName, entityType, setEntityType, phone, setPhone,
    businessAddress, setBusinessAddress, taxId, setTaxId, website, setWebsite,
    bankName, setBankName, bankAccountName, setBankAccountName,
    bankAccountNumber, setBankAccountNumber,
    acceptedTerms, setAcceptedTerms, acceptedLiability, setAcceptedLiability,
    acceptedPrivacy, setAcceptedPrivacy, certifiedAuthorized, setCertifiedAuthorized,
  } = organizer;
  return (
    <>
            {/* SECTION 2: Organization & Legal Entity Details (Organizer Mode Only) */}
            {isOrganizerMode && (
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#14141b]/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-zinc-200 uppercase tracking-wider">
                    <Building2 className="h-4 w-4 text-[#e23744]" />
                    Organization & Legal Entity Information
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Required for Event Licensing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Organization / Brand Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Live Productions LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Legal Entity Type
                    </label>
                    <select
                      value={entityType}
                      onChange={(e) => setEntityType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 px-3 text-xs text-white focus:border-[#e23744]/50 focus:outline-none"
                    >
                      <option value="Private Corporation / LLC" className="bg-[#14141b] text-white">Private Corporation / LLC</option>
                      <option value="Sole Proprietorship / Freelancer" className="bg-[#14141b] text-white">Sole Proprietorship / Freelancer</option>
                      <option value="Non-Profit / NGO (Tax Exempt)" className="bg-[#14141b] text-white">Non-Profit / NGO (Tax Exempt)</option>
                      <option value="Educational / Campus Institution" className="bg-[#14141b] text-white">Educational / Campus Institution</option>
                      <option value="Government / Public Agency" className="bg-[#14141b] text-white">Government / Public Agency</option>
                      <option value="Independent Event Producer" className="bg-[#14141b] text-white">Independent Event Producer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Business Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="tel"
                        placeholder="+1 (555) 234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Tax ID / Business Reg No. (EIN / GSTIN)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="EIN-98-3829104 / Tax ID"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Registered Business Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Street, Suite, City, State & Zip"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Official Website / Portfolio
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="url"
                        placeholder="https://apexliveproductions.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: Financial Settlement & Payout Information (Organizer Mode Only) */}
            {isOrganizerMode && (
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#14141b]/60 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-zinc-200 uppercase tracking-wider">
                    <Landmark className="h-4 w-4 text-emerald-400" />
                    Revenue Disbursement & Payout Account
                  </div>
                  <span className="text-[10px] text-zinc-400">Direct Deposit / Wire</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Payout Bank Name
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="e.g. JPMorgan Chase"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Apex Live LLC"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-display font-bold uppercase text-zinc-400 tracking-widest mb-1.5">
                      Account No. / IBAN / UPI
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="••••••••4892"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#14141b] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Mandatory Legal Agreements & Compliance Declarations */}
            {isOrganizerMode && (
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/10">
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-amber-300 uppercase tracking-wider">
                    <Scale className="h-4 w-4 text-amber-400" />
                    Legal Declarations & Hosting Compliance
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLegalModal(true)}
                    className="text-[10px] font-bold text-[#e23744] hover:text-[#ff2a54] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Read Full Organizer Policy</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-black/40 text-[#e23744] focus:ring-[#e23744]"
                    />
                    <span className="leading-snug text-zinc-300 group-hover:text-white transition">
                      <strong className="text-white">Terms of Service & Fee Structure:</strong> I agree to the Happenins Organizer Terms, standard platform service fees (2.5% + $0.99 per pass), anti-scalping rules, and revenue settlement terms.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptedLiability}
                      onChange={(e) => setAcceptedLiability(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-black/40 text-[#e23744] focus:ring-[#e23744]"
                    />
                    <span className="leading-snug text-zinc-300 group-hover:text-white transition">
                      <strong className="text-white">Public Safety & Venue Permit Compliance:</strong> I certify that all events hosted under this account will obtain required municipal safety permits, adhere to emergency crowd limits, and possess valid event liability coverage.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-black/40 text-[#e23744] focus:ring-[#e23744]"
                    />
                    <span className="leading-snug text-zinc-300 group-hover:text-white transition">
                      <strong className="text-white">Data Privacy & Attendee Records:</strong> I agree to handle attendee personal information and check-in logs in strict compliance with GDPR and Data Protection Standards.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={certifiedAuthorized}
                      onChange={(e) => setCertifiedAuthorized(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 bg-black/40 text-[#e23744] focus:ring-[#e23744]"
                    />
                    <span className="leading-snug text-zinc-300 group-hover:text-white transition">
                      <strong className="text-white">Authorized Signatory Declaration:</strong> I certify under penalty of perjury that I am legally authorized to represent this organization and bind it to these contractual obligations.
                    </span>
                  </label>
                </div>
              </div>
            )}
    </>
  );
};
