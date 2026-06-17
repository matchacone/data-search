"use client";

import React, { useRef, KeyboardEvent } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Search datasets, topics, or file types…",
  compact = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className="search-bar-wrapper"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: compact ? "100%" : "640px",
      }}
    >
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: compact ? "0.625rem 1.125rem" : "0.875rem 1.5rem",
          borderRadius: "9999px",
          transition: `box-shadow 220ms cubic-bezier(0.23,1,0.32,1), border-color 220ms cubic-bezier(0.23,1,0.32,1)`,
          cursor: "text",
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Icon */}
        <span style={{ color: "oklch(0.65 0.18 200)", flexShrink: 0, display: "flex" }}>
          {isLoading ? (
            <Loader2 size={compact ? 16 : 20} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Search size={compact ? 16 : 20} />
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "oklch(0.93 0.003 286)",
            fontFamily: "var(--font-inter)",
            fontSize: compact ? "0.9rem" : "1rem",
            lineHeight: 1.5,
          }}
          aria-label="Search datasets"
        />

        {/* Keyboard hint */}
        {!compact && !value && (
          <kbd
            style={{
              flexShrink: 0,
              padding: "0.15rem 0.45rem",
              background: "oklch(1 0 0 / 0.06)",
              border: "1px solid oklch(1 0 0 / 0.1)",
              borderRadius: "0.35rem",
              color: "oklch(0.55 0.005 286)",
              fontFamily: "var(--font-inter)",
              fontSize: "0.72rem",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Enter ↵
          </kbd>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .search-bar-wrapper .glass:focus-within {
          border-color: oklch(0.65 0.18 200 / 0.6) !important;
          box-shadow: 0 0 0 3px oklch(0.65 0.18 200 / 0.12), 0 8px 32px oklch(0 0 0 / 0.3);
        }
        .search-bar-wrapper .glass:hover {
          border-color: oklch(1 0 0 / 0.14);
          box-shadow: 0 4px 24px oklch(0 0 0 / 0.2);
        }
      `}</style>
    </div>
  );
}
