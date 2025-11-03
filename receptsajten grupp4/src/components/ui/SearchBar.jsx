// src/components/ui/SearchBar.jsx
import React from "react";

/**
 * Reusable search input.
 * - Controlled by parent via `value` and `onChange`.
 * - If `onSubmit` is provided, pressing Enter will call it with the trimmed value.
 */
export default function SearchBar({
  value,
  onChange,
  onSubmit,                 // optional: called on Enter
  placeholder = "Sök..."
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && typeof onSubmit === "function") {
      onSubmit((value || "").trim());
    }
  };

  return (
    <input
      className="search-input"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      aria-label="Sök"
    />
  );
}
