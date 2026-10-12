import React from "react";
import { Scale, X } from "lucide-react";

interface LegalModalProps {
  setShowLegalModal: (open: boolean) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ setShowLegalModal }) => {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl border border-white/10 bg-[#0c0c11] p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Scale className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-display font-bold text-white">Event Organizer Legal Terms & Compliance Standards</h3>
              </div>
              <button
                onClick={() => setShowLegalModal(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto space-y-4 text-xs text-zinc-300 pr-2 leading-relaxed font-sans">
              <div className="p-3.5 rounded-2xl bg-[#e23744]/10 border border-[#e23744]/20 text-zinc-200">
                <p className="font-semibold mb-1 text-white">Official Event Hosting Framework</p>
                <p className="text-[11px] text-zinc-300">
                  By registering as an Event Organizer on Happenins, you enter into a legally binding platform hosting agreement. All event listings must fulfill verified safety, ticket integrity, and payout standards.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ff2a54]" />
                  1. Revenue Settlement & Commission Fees
                </h4>
                <p className="pl-4 text-zinc-400">
                  Happenins applies a standard platform fee of 2.5% plus $0.99 per paid pass sold. Net ticket revenue payouts are automatically calculated and disbursed to your registered banking account via direct wire or ACH deposit within 48 hours following the verified conclusion of the event.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  2. Mandatory Cancellation & Refund SLA
                </h4>
                <p className="pl-4 text-zinc-400">
                  In the event of an event cancellation, venue change without 72h advance notice, or failure to perform, the organizer agrees to issue full 100% refunds to all ticket holders. Happenins reserves the right to withhold pending payout balances to process guest reimbursements.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  3. Public Safety & Municipal Permits
                </h4>
                <p className="pl-4 text-zinc-400">
                  Organizers guarantee that all physical venues comply with local fire codes, crowd density limits, noise ordinances, and emergency medical access. Organizers assume full legal liability for venue safety and crowd control.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  4. Anti-Scalping & Ticket Fraud Prevention
                </h4>
                <p className="pl-4 text-zinc-400">
                  Speculative ticket listing, dynamic price Gouging above published tier caps, or selling duplicate gate passes is strictly prohibited and subject to immediate account termination and regulatory report.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLegalModal(false)}
                className="district-btn-primary px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
  );
};
