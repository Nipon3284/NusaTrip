"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (isOpen) {
      // Simpan elemen yang aktif sebelum modal terbuka untuk dipulihkan saat ditutup
      if (!previousActiveElement.current) {
        previousActiveElement.current = document.activeElement as HTMLElement;
      }

      // Fokus awal ke tombol tutup atau elemen fokus pertama di dalam modal
      const timer = setTimeout(() => {
        if (dialogRef.current) {
          const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else if (closeButtonRef.current) {
            closeButtonRef.current.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onCloseRef.current();
          return;
        }

        // Keyboard Focus Trap (WCAG 2.4.3 & 2.4.11)
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null); // Hanya elemen yang terlihat

          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }

          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey) {
            // Shift + Tab: mundur
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab biasa: maju
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        clearTimeout(timer);
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        // Kembalikan fokus ke elemen pemicu saat modal benar-benar ditutup
        if (
          previousActiveElement.current &&
          typeof previousActiveElement.current.focus === "function"
        ) {
          previousActiveElement.current.focus();
          previousActiveElement.current = null;
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
    "2xl": "max-w-5xl",
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Dialog Content with Focus Trap */}
      <div
        ref={dialogRef}
        className={`relative w-full ${maxWidthClasses} rounded-2xl bg-[var(--surface-card)] border border-[var(--border-default)] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-[var(--border-subtle)] shrink-0">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-bold text-[var(--text-primary)] tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p
                id="modal-description"
                className="text-xs text-[var(--text-muted)] mt-1"
              >
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--surface-subtle)] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
