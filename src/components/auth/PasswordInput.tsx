"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

/** A password `<input>` with a working show/hide toggle — drop-in replacement for `type="password"` fields. */
export function PasswordInput({
  id,
  value,
  onChange,
  required,
  minLength,
  autoComplete,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
      >
        <MaterialIcon name={visible ? "visibility_off" : "visibility"} className="text-xl" />
      </button>
    </div>
  );
}
