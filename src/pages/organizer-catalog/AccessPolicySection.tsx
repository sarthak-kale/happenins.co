import React from "react";
import { EventPolicyType, InstitutionDTO } from "../../types";
import {
  X,
  Building,
  CheckCircle
} from "lucide-react";

interface AccessPolicySectionProps {
  policyType: EventPolicyType;
  setPolicyType: (v: EventPolicyType) => void;
  institutions: InstitutionDTO[];
  allowedDomains: string[];
  toggleInstitutionChip: (primaryDomain: string) => void;
  customDomainInput: string;
  setCustomDomainInput: (v: string) => void;
  handleAddDomain: (domToAdd?: string) => void;
  handleRemoveDomain: (dom: string) => void;
  allowFreeTickets: boolean;
  setAllowFreeTickets: (v: boolean) => void;
  requireVerifiedEmail: boolean;
  setRequireVerifiedEmail: (v: boolean) => void;
  customRestrictionMessage: string;
  setCustomRestrictionMessage: (v: string) => void;
}

export const AccessPolicySection: React.FC<AccessPolicySectionProps> = ({
  policyType,
  setPolicyType,
  institutions,
  allowedDomains,
  toggleInstitutionChip,
  customDomainInput,
  setCustomDomainInput,
  handleAddDomain,
  handleRemoveDomain,
  allowFreeTickets,
  setAllowFreeTickets,
  requireVerifiedEmail,
  setRequireVerifiedEmail,
  customRestrictionMessage,
  setCustomRestrictionMessage,
}) => {
  return (
                <div className="bg-[#0c0c11] rounded-2xl p-5 border border-white/[0.08] space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#e23744]" />
                    <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                      Who Can Attend? (Access & Institution Controls)
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    Restrict ticket booking to specific universities, colleges, corporate domains, or keep it open for everyone.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setPolicyType("PUBLIC")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        policyType === "PUBLIC"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-white"
                          : "border-white/10 bg-[#14141b] text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Open to All</span>
                        {policyType === "PUBLIC" && <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 block leading-normal">
                        Anyone with any email address can discover and book tickets.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPolicyType("INSTITUTION_ONLY")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        policyType === "INSTITUTION_ONLY"
                          ? "border-[#e23744]/50 bg-[#e23744]/10 text-white"
                          : "border-white/10 bg-[#14141b] text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Institution Restricted</span>
                        {policyType === "INSTITUTION_ONLY" && <CheckCircle className="h-3.5 w-3.5 text-[#e23744]" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 block leading-normal">
                        Restricted to verified students/staff of designated institutions.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPolicyType("INVITE_ONLY")}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        policyType === "INVITE_ONLY"
                          ? "border-amber-500/50 bg-amber-500/10 text-white"
                          : "border-white/10 bg-[#14141b] text-zinc-400 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black">Invite / Domain Only</span>
                        {policyType === "INVITE_ONLY" && <CheckCircle className="h-3.5 w-3.5 text-amber-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 block leading-normal">
                        Strict email domain list required for ticket checkout.
                      </span>
                    </button>
                  </div>

                  {/* Domain Configuration UI when policy is restricted */}
                  {policyType !== "PUBLIC" && (
                    <div className="space-y-4 pt-3 border-t border-white/5">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                          Quick Select Registered Institutions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {institutions.length > 0 ? (
                            institutions.map((inst) => {
                              const isSelected = allowedDomains.includes(inst.primaryDomain.toLowerCase());
                              return (
                                <button
                                  type="button"
                                  key={inst.id}
                                  onClick={() => toggleInstitutionChip(inst.primaryDomain)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                                    isSelected
                                      ? "bg-[#e23744] border-[#e23744] text-white shadow-md shadow-[#e23744]/25"
                                      : "bg-[#14141b] border-white/10 text-zinc-300 hover:border-[#e23744]/40"
                                  }`}
                                >
                                  <span>{inst.name}</span>
                                  <span className="text-[10px] opacity-75 font-mono">(@{inst.primaryDomain})</span>
                                  {isSelected && <X className="h-3 w-3 ml-1" />}
                                </button>
                              );
                            })
                          ) : (
                            <span className="text-xs text-zinc-500 font-mono">Loading institutions registry...</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                          Add Custom Email Domain
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. rbunagpur.in, iitb.ac.in, stanford.edu"
                            value={customDomainInput}
                            onChange={(e) => setCustomDomainInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddDomain();
                              }
                            }}
                            className="flex-1 rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-3.5 py-2.5 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDomain()}
                            className="rounded-xl bg-[#e23744] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#d12e3b] transition cursor-pointer"
                          >
                            Add Domain
                          </button>
                        </div>
                      </div>

                      {/* Allowed Domains Tags */}
                      {allowedDomains.length > 0 && (
                        <div>
                          <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 font-mono">
                            Allowed Email Domains ({allowedDomains.length}):
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {allowedDomains.map((dom) => (
                              <span
                                key={dom}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold"
                              >
                                @{dom}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDomain(dom)}
                                  className="text-emerald-400 hover:text-rose-400 transition"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowFreeTickets}
                            onChange={(e) => setAllowFreeTickets(e.target.checked)}
                            className="rounded border-white/10 bg-[#14141b] text-[#e23744] focus:ring-[#e23744] h-4 w-4"
                          />
                          <span>Allow ₹0 Free Tickets for Institution Members</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requireVerifiedEmail}
                            onChange={(e) => setRequireVerifiedEmail(e.target.checked)}
                            className="rounded border-white/10 bg-[#14141b] text-[#e23744] focus:ring-[#e23744] h-4 w-4"
                          />
                          <span>Require Email Verification</span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">
                          Custom Ineligibility Notice (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. This event is exclusive to Ramdeobaba University students & faculty. Please sign in with your official @rbunagpur.in email."
                          value={customRestrictionMessage}
                          onChange={(e) => setCustomRestrictionMessage(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#14141b] text-xs text-white px-3.5 py-2.5 placeholder:text-zinc-600 focus:border-[#e23744]/50 focus:ring-1 focus:ring-[#e23744]/30 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
  );
};
