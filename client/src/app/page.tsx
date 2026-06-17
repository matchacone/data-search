"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import InteractiveDotGrid from "../components/ui/InteractiveDotGrid";
import Logo from "../components/ui/Logo";
import SearchBar from "../components/ui/SearchBar";
import DatasetCard, { Dataset } from "../components/ui/DatasetCard";
import {
  Database,
  TrendingUp,
  Globe2,
  FlaskConical,
  Landmark,
  HeartPulse,
  CloudSun,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_DATASETS: Dataset[] = [
  {
    id: "1",
    title: "Global Surface Temperature Anomalies (1880–2024)",
    description:
      "NASA GISS monthly global surface temperature anomalies relative to the 1951–1980 average. Includes land-ocean temperature index and zonal means for 8 latitude bands. Ideal for climate research, trend analysis, and environmental modeling.",
    source_url: "https://data.giss.nasa.gov/gistemp/",
    download_url: "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv",
    file_formats: ["CSV", "JSON"],
    tags: ["climate", "temperature", "NASA", "global warming", "time series"],
    organization: "NASA GISS",
    updated: "Jun 2024",
  },
  {
    id: "2",
    title: "US Census Bureau — American Community Survey 5-Year Estimates",
    description:
      "Demographic, social, economic, and housing characteristics for communities across the United States. Data collected over 5 years and published at multiple geographic levels: state, county, census tract, and block group.",
    source_url: "https://www.census.gov/programs-surveys/acs",
    download_url: "https://api.census.gov/data/2022/acs/acs5",
    file_formats: ["CSV", "JSON", "API"],
    tags: ["census", "demographics", "population", "housing", "income"],
    organization: "US Census Bureau",
    updated: "Dec 2023",
  },
  {
    id: "3",
    title: "COVID-19 Open Research Dataset (CORD-19)",
    description:
      "A resource of over 500,000 scholarly articles about COVID-19 and related coronaviruses for use by the global research community. Machine-readable JSON and rich metadata to enable NLP and ML research.",
    source_url: "https://allenai.org/data/cord-19",
    download_url: "https://ai2-semanticscholar-cord-19.s3-us-west-2.amazonaws.com/latest/document_parses.tar.gz",
    file_formats: ["JSON", "PDF", "ZIP"],
    tags: ["COVID-19", "NLP", "biomedical", "research papers", "SARS-CoV-2"],
    organization: "Allen Institute for AI",
    updated: "Apr 2022",
  },
  {
    id: "4",
    title: "World Bank — Global Development Indicators",
    description:
      "Over 1,400 time series indicators for 217 economies and more than 40 country groups, covering development data from 1960 to the present. Includes GDP, poverty rates, education, health, and infrastructure metrics.",
    source_url: "https://databank.worldbank.org/source/world-development-indicators",
    download_url: "https://api.worldbank.org/v2/en/indicator/NY.GDP.MKTP.CD?downloadformat=csv",
    file_formats: ["CSV", "XLSX", "JSON", "XML"],
    tags: ["GDP", "poverty", "world bank", "economics", "development"],
    organization: "World Bank",
    updated: "May 2024",
  },
  {
    id: "5",
    title: "OpenFDA — Drug Adverse Event Reports",
    description:
      "Reports submitted to the FDA's Adverse Event Reporting System (FAERS). Includes patient demographics, drug information, and reported outcomes. Useful for pharmacovigilance, drug safety research, and signal detection.",
    source_url: "https://open.fda.gov/data/downloads/",
    download_url: "https://download.open.fda.gov/drug/event/",
    file_formats: ["JSON", "ZIP"],
    tags: ["FDA", "drug safety", "pharmacovigilance", "adverse events", "healthcare"],
    organization: "US FDA",
    updated: "Q1 2024",
  },
  {
    id: "6",
    title: "NOAA Global Precipitation Climatology Centre",
    description:
      "Daily global precipitation data derived from rain gauge observations at meteorological stations worldwide. Full records from 1891 to present. Used extensively in hydrology, flood risk assessment, and climate modelling.",
    source_url: "https://www.ncei.noaa.gov/products/global-precipitation-climatology-centre",
    download_url: "https://www.ncei.noaa.gov/data/global-precipitation-climatology-centres/",
    file_formats: ["CSV", "PDF"],
    tags: ["precipitation", "rainfall", "NOAA", "hydrology", "climate"],
    organization: "NOAA NCEI",
    updated: "Mar 2024",
  },
];

const FORMAT_FILTERS = ["All", "CSV", "JSON", "PDF", "API", "XLSX"] as const;
type FormatFilter = (typeof FORMAT_FILTERS)[number];

const QUICK_SEARCHES = [
  { label: "Climate", icon: <CloudSun size={13} /> },
  { label: "COVID-19", icon: <HeartPulse size={13} /> },
  { label: "Census", icon: <Landmark size={13} /> },
  { label: "Finance", icon: <TrendingUp size={13} /> },
  { label: "Research", icon: <FlaskConical size={13} /> },
];

// ─── Skeleton Card ──────────────────────────────────────────────────────────
function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="glass"
      style={{
        padding: "1.5rem",
        borderRadius: "0.875rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        animation: `fadeSlideUp 300ms cubic-bezier(0.23,1,0.32,1) ${delay}ms both`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ width: "100px", height: "12px" }} />
        <div style={{ display: "flex", gap: "0.35rem" }}>
          <div className="skeleton" style={{ width: "36px", height: "18px", borderRadius: "9999px" }} />
          <div className="skeleton" style={{ width: "44px", height: "18px", borderRadius: "9999px" }} />
        </div>
      </div>
      <div className="skeleton" style={{ width: "85%", height: "18px" }} />
      <div className="skeleton" style={{ width: "60%", height: "14px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div className="skeleton" style={{ width: "100%", height: "12px" }} />
        <div className="skeleton" style={{ width: "90%", height: "12px" }} />
        <div className="skeleton" style={{ width: "70%", height: "12px" }} />
      </div>
      <div style={{ display: "flex", gap: "0.35rem" }}>
        {[60, 72, 50].map((w, i) => (
          <div key={i} className="skeleton" style={{ width: `${w}px`, height: "20px", borderRadius: "9999px" }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Dataset[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFormat, setActiveFormat] = useState<FormatFilter>("All");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      setQuery(q);
      setSubmittedQuery(q);
      setHasSearched(true);
      setIsLoading(true);
      setResults([]);
      setActiveFormat("All");

      // Simulate fetch delay
      setTimeout(() => {
        const q_lower = q.toLowerCase();
        const filtered = MOCK_DATASETS.filter(
          (d) =>
            d.title.toLowerCase().includes(q_lower) ||
            d.description.toLowerCase().includes(q_lower) ||
            d.tags.some((t) => t.toLowerCase().includes(q_lower)) ||
            d.file_formats.some((f) => f.toLowerCase().includes(q_lower))
        );
        setResults(filtered.length > 0 ? filtered : MOCK_DATASETS);
        setIsLoading(false);
      }, 900);
    },
    []
  );

  // Scroll to results when they appear
  useEffect(() => {
    if (results.length > 0 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [results.length]);

  const filteredResults =
    activeFormat === "All"
      ? results
      : results.filter((d) =>
          d.file_formats.some((f) => f.toUpperCase() === activeFormat)
        );

  return (
    <>
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: hasSearched ? "40vh" : "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem",
          transition: "min-height 500ms cubic-bezier(0.23,1,0.32,1)",
          overflow: "hidden",
        }}
      >
        <InteractiveDotGrid />

        {/* Content above the grid */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: hasSearched ? "1rem" : "1.75rem",
            width: "100%",
            maxWidth: "720px",
            transition: "gap 400ms cubic-bezier(0.23,1,0.32,1)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              animation: "fadeSlideUp 400ms cubic-bezier(0.23,1,0.32,1) 0ms both",
              transform: hasSearched ? "scale(0.85)" : "scale(1)",
              transition: "transform 400ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            <Logo size={hasSearched ? 28 : 40} showWordmark={true} />
          </div>

          {/* Headline — hidden after search */}
          {!hasSearched && (
            <>
              <div style={{ textAlign: "center", animation: "fadeSlideUp 400ms cubic-bezier(0.23,1,0.32,1) 80ms both" }}>
                <h1
                  style={{
                    fontFamily: "var(--font-sora)",
                    fontWeight: 800,
                    fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    color: "oklch(0.95 0.003 286)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Find datasets{" "}
                  <span
                    style={{
                      color: "oklch(0.65 0.18 200)",
                      position: "relative",
                    }}
                  >
                    in seconds
                  </span>
                </h1>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 400,
                    fontSize: "1.05rem",
                    color: "oklch(0.58 0.006 286)",
                    lineHeight: 1.6,
                    maxWidth: "480px",
                    margin: "0 auto",
                  }}
                >
                  Search millions of open datasets across science, government, and research — all in one place.
                </p>
              </div>
            </>
          )}

          {/* Search Bar */}
          <div
            style={{
              width: "100%",
              animation: "fadeSlideUp 400ms cubic-bezier(0.23,1,0.32,1) 160ms both",
            }}
          >
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
              compact={hasSearched}
            />
          </div>

          {/* Quick-search chips — only in hero */}
          {!hasSearched && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                justifyContent: "center",
                animation: "fadeSlideUp 400ms cubic-bezier(0.23,1,0.32,1) 240ms both",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "oklch(0.45 0.005 286)",
                  fontFamily: "var(--font-inter)",
                  marginRight: "0.25rem",
                }}
              >
                Try:
              </span>
              {QUICK_SEARCHES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSearch(s.label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.9rem",
                    borderRadius: "9999px",
                    background: "oklch(1 0 0 / 0.05)",
                    border: "1px solid oklch(1 0 0 / 0.08)",
                    color: "oklch(0.65 0.006 286)",
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-inter)",
                    cursor: "pointer",
                    transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "oklch(0.65 0.18 200 / 0.1)";
                    el.style.borderColor = "oklch(0.65 0.18 200 / 0.3)";
                    el.style.color = "oklch(0.65 0.18 200)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "oklch(1 0 0 / 0.05)";
                    el.style.borderColor = "oklch(1 0 0 / 0.08)";
                    el.style.color = "oklch(0.65 0.006 286)";
                  }}
                >
                  {s.icon}
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Stats strip — hero only */}
          {!hasSearched && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                animation: "fadeSlideUp 400ms cubic-bezier(0.23,1,0.32,1) 320ms both",
              }}
            >
              {[
                { icon: <Database size={14} />, text: "2M+ datasets" },
                { icon: <Globe2 size={14} />, text: "50+ sources" },
                { icon: <BarChart3 size={14} />, text: "Updated daily" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.78rem",
                    color: "oklch(0.45 0.005 286)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  <span style={{ color: "oklch(0.65 0.18 200)" }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Results Section ────────────────────────────────────────────────── */}
      {hasSearched && (
        <section
          ref={resultsRef}
          style={{
            padding: "0 1.5rem 6rem",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Results header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              animation: "fadeIn 250ms ease both",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                  color: "oklch(0.55 0.005 286)",
                }}
              >
                {isLoading ? (
                  "Searching…"
                ) : (
                  <>
                    <span style={{ color: "oklch(0.65 0.18 200)", fontWeight: 600 }}>
                      {filteredResults.length}
                    </span>{" "}
                    result{filteredResults.length !== 1 ? "s" : ""} for{" "}
                    <span style={{ color: "oklch(0.93 0.003 286)", fontStyle: "italic" }}>
                      &ldquo;{submittedQuery}&rdquo;
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Format filter chips */}
            {!isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                <SlidersHorizontal size={13} style={{ color: "oklch(0.45 0.005 286)" }} />
                {FORMAT_FILTERS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setActiveFormat(fmt)}
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-inter)",
                      fontWeight: activeFormat === fmt ? 600 : 400,
                      cursor: "pointer",
                      border: activeFormat === fmt
                        ? "1px solid oklch(0.65 0.18 200 / 0.5)"
                        : "1px solid oklch(1 0 0 / 0.08)",
                      background: activeFormat === fmt
                        ? "oklch(0.65 0.18 200 / 0.12)"
                        : "oklch(1 0 0 / 0.04)",
                      color: activeFormat === fmt
                        ? "oklch(0.65 0.18 200)"
                        : "oklch(0.55 0.005 286)",
                      transition: "all 150ms ease",
                    }}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cyan divider */}
          <div className="accent-line" style={{ marginBottom: "2rem" }} />

          {/* Grid */}
          {isLoading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {[0, 80, 160, 240, 80, 160].map((delay, i) => (
                <SkeletonCard key={i} delay={delay} />
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {filteredResults.map((dataset, i) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  animationDelay={i * 60}
                />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div
              style={{
                textAlign: "center",
                padding: "5rem 1rem",
                animation: "fadeIn 300ms ease both",
              }}
            >
              <Database
                size={48}
                style={{ color: "oklch(0.35 0.005 286)", margin: "0 auto 1.25rem" }}
              />
              <p
                style={{
                  fontFamily: "var(--font-sora)",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  color: "oklch(0.65 0.005 286)",
                  marginBottom: "0.5rem",
                }}
              >
                No results for &ldquo;{submittedQuery}&rdquo; with format {activeFormat}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.875rem",
                  color: "oklch(0.45 0.005 286)",
                }}
              >
                Try adjusting your filters or searching a different term.
              </p>
              <button
                onClick={() => setActiveFormat("All")}
                style={{
                  marginTop: "1.25rem",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "9999px",
                  background: "oklch(0.65 0.18 200 / 0.12)",
                  border: "1px solid oklch(0.65 0.18 200 / 0.3)",
                  color: "oklch(0.65 0.18 200)",
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}