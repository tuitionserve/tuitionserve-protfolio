"use client";

import { useMemo, useRef, useState } from "react";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const inputClass =
  "flex-1 min-w-[140px] border-none outline-none bg-transparent font-body-sm text-body-sm py-1";

/**
 * Typeable, multi-select subject picker: suggests from the SUBJECTS
 * catalog as you type, but also accepts free text for a subject that
 * isn't in the list (a parent's needs don't always match the catalog).
 * Selected values are stored as plain strings — a catalog id for a
 * suggested pick, or the raw typed text otherwise; catalogLabel()
 * already falls back to the raw string for display, so nothing extra
 * is needed to render a custom value correctly.
 */
export function SubjectMultiSelect({
  id,
  value,
  onChange,
  placeholder = "Type a subject...",
}: {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    return SUBJECTS.filter((s) => !value.includes(s.id)).filter((s) =>
      query ? s.label.toLowerCase().includes(query) : true,
    ).slice(0, 8);
  }, [inputValue, value]);

  const trimmedInput = inputValue.trim();
  const exactCatalogMatch = SUBJECTS.find((s) => s.label.toLowerCase() === trimmedInput.toLowerCase());
  const canAddCustom = trimmedInput.length > 0 && !exactCatalogMatch && !value.includes(trimmedInput);

  function addValue(v: string) {
    if (!value.includes(v)) onChange([...value, v]);
    setInputValue("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeValue(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[0] && trimmedInput) {
        addValue(suggestions[0].id);
      } else if (canAddCustom) {
        addValue(trimmedInput);
      } else if (exactCatalogMatch) {
        addValue(exactCatalogMatch.id);
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeValue(value[value.length - 1]!);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 border border-outline-variant rounded-lg p-2 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 bg-primary-container/15 text-on-surface font-label-md text-label-md px-2 py-1 rounded-full"
          >
            {catalogLabel(SUBJECTS, v)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(v);
              }}
              aria-label={`Remove ${catalogLabel(SUBJECTS, v)}`}
              className="text-on-surface-variant hover:text-error"
            >
              <MaterialIcon name="close" className="text-sm" />
            </button>
          </span>
        ))}
        <input
          id={id}
          ref={inputRef}
          className={inputClass}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
        />
      </div>

      {open && (suggestions.length > 0 || canAddCustom) && (
        <div className="absolute z-10 mt-1 w-full bg-surface-container-lowest border border-surface-variant rounded-lg shadow-md max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addValue(s.id)}
              className="w-full text-left px-3 py-2 font-body-sm text-body-sm text-on-surface hover:bg-surface-container transition-colors"
            >
              {s.label}
            </button>
          ))}
          {canAddCustom && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => addValue(trimmedInput)}
              className="w-full text-left px-3 py-2 font-body-sm text-body-sm text-primary-container hover:bg-surface-container transition-colors flex items-center gap-1"
            >
              <MaterialIcon name="add" className="text-base" /> Add &ldquo;{trimmedInput}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
