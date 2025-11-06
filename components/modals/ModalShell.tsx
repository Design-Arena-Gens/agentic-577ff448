"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ModalShell({ open, onClose, title, children }: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (typeof document === "undefined" || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md rounded-2xl bg-[#101020] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-full border border-[#303045] px-2 py-1 text-sm text-foreground transition hover:border-accent hover:text-accent"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-4 space-y-3 text-sm text-[#d3d3e7]">{children}</div>
      </div>
    </div>,
    document.body
  );
}
