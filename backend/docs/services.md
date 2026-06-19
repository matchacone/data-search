# Services Reference

> **For agents:** This file documents every module in `backend/services/`. Read the relevant section before modifying a service.

The `services/` directory contains pure-Python business logic that is intentionally decoupled from Django. Each subdirectory is one logical service.

---

## `search/` — Search pipeline (active)

The core search pipeline. Called on every user query.

### `query_processor.py`

**Purpose:** Converts a raw user query string into a PostgreSQL `tsquery`-compatible string using spaCy NLP.

**Model loaded:** `en_core_web_sm` — loaded once at module import time (singleton). Do not reload it per-request.

**Key functions:**

```python
process_query(raw: str) -> str
```
- Lowercases and parses the query with spaCy.
- Drops: stop words, punctuation, whitespace, tokens shorter than 2 chars.
- Lemmatizes remaining tokens (`running` → `run`, `datasets` → `dataset`).
- Joins with ` & ` for use as a PostgreSQL `tsquery` (e.g. `SearchQuery(result, search_type="raw")`).
- Returns `""` if nothing meaningful remains (e.g. query was all stop words).

```python
get_search_terms(raw: str) -> list[str]
```
- Same pipeline but returns a list instead of a joined string. Useful for highlighting or debugging.

**Usage:**
```python
from search.query_processor import process_query
process_query("climate change datasets from 2023")
# → "climate & change & dataset"

process_query("the and or")
# → ""  (all stop words)
```

**Extending this:**
- To add synonym expansion: inject synonyms after lemmatization, before joining.
- To add NER (named entity detection): inspect `doc.ents` after `_nlp(raw)`.
- To support other languages: load a different spaCy model and pass `config=` to `SearchQuery`.

---

### `retrieval.py`

**Purpose:** Executes database search using the processed query and returns serialized results.

**Requires:** Django to be configured before import (guaranteed when called from a view).

**Key function:**

```python
search_datasets(raw_query: str, limit: int = 20) -> dict
```

Returns:
```json
{
  "query": "<original input>",
  "processed_query": "<lemmatized tsquery or original if fallback>",
  "count": 12,
  "results": [
    {
      "id": 1,
      "title": "...",
      "description": "...",
      "source_url": "https://...",
      "tags": ["climate", "environment"],
      "resources": [{"name": "data.csv", "format": "CSV", "url": "https://..."}],
      "source": "us_gov",
      "created_at": "2026-06-10T16:42:00+00:00"
    }
  ]
}
```

**Search strategy:**
1. Calls `process_query()` to get a tsquery string.
2. If non-empty → `SearchQuery(processed, search_type="raw")` + `SearchRank` on the `search_vector` GIN-indexed column. Results ordered by rank descending.
3. If empty (all stop words) → `icontains` fallback on `title` and `description`. No ranking.
4. `limit` is clamped to `[1, 100]` by the view before being passed in.

**Extending this:**
- To add source filtering: add a `source: str | None = None` parameter and `.filter(source=source)` before the FTS filter.
- To add pagination: add `offset` parameter and use `[offset:offset+limit]` slice.
- To boost by recency: add a secondary `.order_by("-rank", "-created_at")`.

---

## `crawler/` — Data ingestion (manual)

Crawlers are run manually (not scheduled). They fetch dataset metadata from external sources and write it to the `Dataset` table.

### `crawler/apis/kaggle/kaggle_service.py`

**Purpose:** Paginates through Kaggle's public dataset index using the official `kaggle` Python SDK and writes records directly to the DB.

**Entry point:**
```bash
cd backend
.venv/bin/python services/crawler/apis/kaggle/kaggle_service.py
```

**Authentication:** Reads `KAGGLE_API_TOKEN` from `.env` (or `~/.kaggle/kaggle.json` — standard Kaggle SDK locations).

**Key behaviour:**
- Calls `kaggle.api.dataset_list(page=N)` for up to `max_pages` pages (default: 50 in `__main__`).
- Rate-limit handling: exponential backoff on HTTP 429 (`60s → 120s → 240s`).
- Uses `Dataset.objects.update_or_create(source_url=...)` — safe to re-run; duplicate URLs are updated, not duplicated.
- Resources are stored as `[{"name": "<slug>.zip", "format": "ZIP", "url": "kaggle datasets download -d <ref>"}]` — the URL is the CLI command, not a direct download link.

**Known gaps:**
- `subtitle` is used as `description` — often empty for many datasets.
- No tag normalization beyond `.lower()`.

---

### `crawler/apis/europa/fetch_europe`

**Purpose:** Fetches datasets from the EU Open Data Portal via a SPARQL query, normalizes the flat result rows into grouped records, and saves to `engine_ready_output.json` locally.

> ⚠️ **DB write is not yet wired.** This script saves to a local JSON file, not to Supabase. A future agent needs to add a `save_to_db(records)` function that calls `Dataset.objects.update_or_create`.

**Entry point:**
```bash
cd backend
.venv/bin/python services/crawler/apis/europa/fetch_europe
```

**SPARQL endpoint:** `https://data.europa.eu/sparql`

**Normalization (`standardize_data`):**
- Groups flat SPARQL rows by `?dataset` URI (a single dataset has multiple rows for different keywords/distributions).
- Title/description: takes first non-placeholder value (avoids overwriting with duplicates).
- Tags: stored as a `set` → deduplicated automatically.
- Resources: keyed by download URL to deduplicate.
- Current query: fetches 100 datasets (LIMIT 100, OFFSET 0). Loop through offsets to get more.

**Extending this:**
- To loop through all datasets: wrap `fetch_europe_data()` in a loop incrementing OFFSET by 100.
- To save to DB: after `standardize_data()`, call `Dataset.objects.update_or_create` for each record with `source='europa'`.

---

### `crawler/scrapy/` — Scrapy project (`dataset_engine`)

**Purpose:** Scrapes `catalog.data.gov` (US Government open data) using Scrapy's HTML parsing.

**Scrapy project:** `dataset_engine` located at `services/crawler/scrapy/dataset_engine/`.

**Running:**
```bash
cd backend/services/crawler/scrapy
scrapy crawl US_Gov
```

**Spider: `US_Gov`**
- Start URL: `https://catalog.data.gov/dataset`
- Pagination: extracts `data-after` token from a "show more" button and constructs the next URL.
- Per dataset: follows the detail page link and scrapes title, description, tags, and downloadable file resources (name, format, download URL).
- Rate limits: `CONCURRENT_REQUESTS=4`, `DOWNLOAD_DELAY=1.5s`, AutoThrottle enabled.

**Pipeline (`pipelines.py`):**
- Currently a no-op stub — items are yielded but not saved anywhere.
- To wire up DB writes: import Django + `Dataset` model in `DatasetEnginePipeline.process_item()` and call `update_or_create`. See `kaggle_service.py` for the pattern.

**`DatasetEngineItem` fields:** `title`, `description`, `source_url`, `tags`, `resources`

---

## `parser/`, `scoring/`, `task-queue/` — Stubs

These directories exist as placeholders. Their `.py` files are empty.

| Service | Intended purpose |
|---|---|
| `parser/parse.py` | Post-process / normalize raw crawler output before DB insert |
| `scoring/score.py` | Re-rank or score search results (e.g. popularity, freshness boost) |
| `task-queue/tasks.py` | Async task runner for scheduling crawler jobs (Celery / RQ) |

When implementing these, keep them Django-free unless they need ORM access.
