'use client';

import { useState } from "react";
import { AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Component ────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isDanger ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
          )}>
            {isDanger ? <Trash2 size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-bold text-base leading-tight">{title}</h3>
            )}
            <p className={cn(
              "text-sm text-muted-foreground leading-relaxed",
              title ? "mt-1" : "font-medium text-foreground"
            )}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-secondary transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-5 py-2 text-sm font-bold rounded-xl transition shadow-sm",
              isDanger
                ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-primary/20"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  message: string;
  resolve?: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, message: "" });

  const askConfirm = (message: string, options?: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, message, ...options, resolve });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, open: false }));
  };

  const confirmModal = (
    <ConfirmModal
      open={state.open}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirmModal, askConfirm };
}
