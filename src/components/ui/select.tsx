"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  disabled = false,
  error,
  className = "",
  id,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const listboxId = `${selectId}-listbox`;
  const labelId = `${selectId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keep highlighted index in sync when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < options.length &&
            !options[highlightedIndex].disabled
          ) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        } else {
          setIsOpen(true);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) {
              next++;
            }
            return next < options.length ? next : prev;
          });
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;

      case "Home":
        e.preventDefault();
        if (isOpen) {
          let first = 0;
          while (first < options.length && options[first].disabled) {
            first++;
          }
          if (first < options.length) setHighlightedIndex(first);
        }
        break;

      case "End":
        e.preventDefault();
        if (isOpen) {
          let last = options.length - 1;
          while (last >= 0 && options[last].disabled) {
            last--;
          }
          if (last >= 0) setHighlightedIndex(last);
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          className="text-xs font-semibold text-[var(--text-secondary)] select-none uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      {/* Button Trigger (Replaces native select) */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={label ? `${labelId} ${selectId}` : selectId}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full h-10 px-3.5 flex items-center justify-between text-left text-sm rounded-lg border transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1 ${
          disabled
            ? "bg-[var(--surface-sunken)] text-[var(--text-muted)] border-[var(--border-subtle)] cursor-not-allowed"
            : error
            ? "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--status-danger)] hover:border-[var(--status-danger-hover)]"
            : isOpen
            ? "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]"
            : "bg-[var(--surface-card)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--border-strong)]"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : <span className="text-[var(--text-muted)]">{placeholder}</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--brand-primary)]" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Error Message */}
      {error && (
        <span className="text-xs text-[var(--status-danger)] font-medium">
          {error}
        </span>
      )}

      {/* ARIA Listbox Popover */}
      {isOpen && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined
          }
          className="absolute z-50 w-full mt-1.5 max-h-60 overflow-auto rounded-lg border border-[var(--border-default)] bg-[var(--surface-card)] py-1.5 shadow-lg focus:outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${selectId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => {
                  if (!option.disabled) setHighlightedIndex(index);
                }}
                className={`relative px-3.5 py-2 text-sm flex items-center justify-between cursor-pointer select-none transition-colors ${
                  option.disabled
                    ? "opacity-40 cursor-not-allowed"
                    : isHighlighted
                    ? "bg-[var(--brand-primary-subtle)] text-[var(--text-primary)] font-medium"
                    : isSelected
                    ? "bg-[var(--surface-subtle)] text-[var(--text-primary)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                }`}
              >
                <div className="flex flex-col pr-4">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {option.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
