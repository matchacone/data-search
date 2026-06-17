"use client";

import React from "react";
import {
  ExternalLink,
  Download,
  Tag,
  FileText,
  Globe,
} from "lucide-react";

export interface Dataset {
  id: string;
  title: string;
  description: string;
  source_url: string;
  download_url?: string;
  file_formats: string[];
  tags: string[];
  organization?: string;
  updated?: string;
}

interface DatasetCardProps {
  dataset: Dataset;
  animationDelay?: number;
}

function formatBadgeClass(format: string): string {
  const map: Record<string, string> = {
    CSV: "badge-csv",
    JSON: "badge-json",
    PDF: "badge-pdf",
    XLSX: "badge-xlsx",
    XLS: "badge-xlsx",
    XML: "badge-xml",
    ZIP: "badge-zip",
    API: "badge-api",
  };
  return map[format.toUpperCase()] ?? "badge-other";
}

function truncateDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function DatasetCard({ dataset, animationDelay = 0 }: DatasetCardProps) {
  const visibleTags = dataset.tags.slice(0, 3);
  const extraTags = dataset.tags.length - visibleTags.length;

  return (
    <article
      className="dataset-card glass"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1.5rem",
        borderRadius: "0.875rem",
        transition: "transform 220ms cubic-bezier(0.23,1,0.32,1), box-shadow 220ms cubic-bezier(0.23,1,0.32,1), border-color 220ms cubic-bezier(0.23,1,0.32,1), background 220ms cubic-bezier(0.23,1,0.32,1)",
        animation: `fadeSlideUp 300ms cubic-bezier(0.23,1,0.32,1) ${animationDelay}ms both`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background: "linear-gradient(90deg, transparent, oklch(0.65 0.18 200 / 0.4), transparent)",
        }}
      />

      {/* Header row: org + formats */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "oklch(0.55 0.01 286)", fontSize: "0.78rem", fontFamily: "var(--font-inter)" }}>
          <Globe size={12} />
          <span style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {dataset.organization ?? truncateDomain(dataset.source_url)}
          </span>
        </div>

        {/* File format badges */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {dataset.file_formats.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className={formatBadgeClass(fmt)}
              style={{
                padding: "0.15rem 0.55rem",
                borderRadius: "9999px",
                fontSize: "0.68rem",
                fontWeight: 600,
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Title */}
      <h2
        style={{
          fontFamily: "var(--font-sora)",
          fontWeight: 600,
          fontSize: "1.05rem",
          lineHeight: 1.35,
          color: "oklch(0.93 0.003 286)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {dataset.title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 400,
          fontSize: "0.875rem",
          lineHeight: 1.6,
          color: "oklch(0.62 0.006 286)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {dataset.description}
      </p>

      {/* Tags */}
      {dataset.tags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <Tag size={12} style={{ color: "oklch(0.45 0.005 286)", flexShrink: 0 }} />
          {visibleTags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "0.15rem 0.55rem",
                borderRadius: "9999px",
                fontSize: "0.72rem",
                fontFamily: "var(--font-inter)",
                background: "oklch(1 0 0 / 0.05)",
                border: "1px solid oklch(1 0 0 / 0.08)",
                color: "oklch(0.62 0.006 286)",
                whiteSpace: "nowrap",
              }}
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span style={{ fontSize: "0.72rem", color: "oklch(0.45 0.005 286)", fontFamily: "var(--font-inter)" }}>
              +{extraTags} more
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="accent-line" />

      {/* Footer: updated + actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        {dataset.updated && (
          <span style={{ fontSize: "0.72rem", color: "oklch(0.45 0.005 286)", fontFamily: "var(--font-inter)" }}>
            Updated {dataset.updated}
          </span>
        )}
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
          {/* Download icon button */}
          {dataset.download_url && (
            <a
              href={dataset.download_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download dataset"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2rem",
                height: "2rem",
                borderRadius: "0.5rem",
                background: "oklch(1 0 0 / 0.05)",
                border: "1px solid oklch(1 0 0 / 0.08)",
                color: "oklch(0.62 0.006 286)",
                transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "oklch(0.65 0.18 200 / 0.12)";
                el.style.color = "oklch(0.65 0.18 200)";
                el.style.borderColor = "oklch(0.65 0.18 200 / 0.3)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "oklch(1 0 0 / 0.05)";
                el.style.color = "oklch(0.62 0.006 286)";
                el.style.borderColor = "oklch(1 0 0 / 0.08)";
              }}
            >
              <Download size={14} />
            </a>
          )}

          {/* Explore CTA */}
          <a
            href={dataset.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              background: "oklch(0.65 0.18 200 / 0.12)",
              border: "1px solid oklch(0.65 0.18 200 / 0.3)",
              color: "oklch(0.65 0.18 200)",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "var(--font-inter)",
              textDecoration: "none",
              transition: "background 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = "oklch(0.65 0.18 200 / 0.22)";
              el.style.borderColor = "oklch(0.65 0.18 200 / 0.5)";
              el.style.boxShadow = "0 0 16px oklch(0.65 0.18 200 / 0.2)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "oklch(0.65 0.18 200 / 0.12)";
              el.style.borderColor = "oklch(0.65 0.18 200 / 0.3)";
              el.style.boxShadow = "none";
            }}
          >
            <FileText size={13} />
            Explore Dataset
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <style>{`
        .dataset-card:hover {
          transform: translateY(-3px) scale(1.005);
          box-shadow: 0 16px 48px oklch(0 0 0 / 0.35), 0 0 0 1px oklch(1 0 0 / 0.12);
          border-color: oklch(1 0 0 / 0.14);
          background: oklch(1 0 0 / 0.07);
        }
      `}</style>
    </article>
  );
}
