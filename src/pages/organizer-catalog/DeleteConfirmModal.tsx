import React from "react";
import { EventDTO } from "../../types";
import {
  Loader2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

interface DeleteConfirmModalProps {
  eventToDelete: EventDTO;
  deleteError: string;
  deleteLoading: boolean;
  onCancel: () => void;
  handleConfirmDelete: () => void | Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  eventToDelete,
  deleteError,
  deleteLoading,
  onCancel,
  handleConfirmDelete,
}) => {
  return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="w-full max-w-md rounded-3xl bg-[#0c0c11] border border-rose-500/30 shadow-2xl overflow-hidden p-6 text-left relative"
            >
              <div className="flex items-center gap-3 mb-4 text-rose-400">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white">
                    Delete Event from Platform?
                  </h3>
                  <span className="text-3xs font-mono uppercase tracking-wider text-rose-400">
                    Irreversible Action
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                Are you sure you want to permanently delete <strong className="text-white">"{eventToDelete.title}"</strong>?
              </p>

              <div className="rounded-xl bg-rose-500/5 border border-rose-500/15 p-3 text-3xs text-rose-300 leading-normal mb-6">
                This will remove the event listing from the public catalog, delete its ticket inventory, clear seating configurations, and purge associated bookings and analytics.
              </div>

              {deleteError && (
                <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 font-bold">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  disabled={deleteLoading}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:bg-rose-500 transition cursor-pointer active:scale-95 duration-150 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>{deleteLoading ? "Deleting..." : "Permanently Delete"}</span>
                </button>
              </div>
            </motion.div>
          </div>
  );
};
