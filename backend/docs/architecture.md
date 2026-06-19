# Backend — Architecture Overview

> **For agents:** Read this file first. It gives you the lay of the land before touching any code.

## What this backend does

DataSearch is a **dataset search engine**. The backend has two jobs:

1. **Crawl** public dataset portals (Kaggle, data.gov, data.europa.eu) and store metadata in a Supabase PostgreSQL database.
2. **Search** that metadata via a REST API, using spaCy NLP + PostgreSQL full-text search to turn raw user queries into ranked results.

---

## Directory map

```
backend/
├── django/                        # Django project root (the HTTP layer)
│   ├── datasearch/                # Project config
│   │   ├── settings.py            # ← All configuration lives here
│   │   └── urls.py                # Root URL router
│   └── searchEngine/              # The single Django app
│       ├── models.py              # Dataset model (mirrors Supabase table)
│       ├── views.py               # HTTP views / API endpoints
│       ├── urls.py                # App-level URL patterns
│       └── migrations/            # Schema migrations
│           ├── 0001_initial.py    # Creates the Dataset table
│           └── 0002_search_vector.py  # Adds tsvector column + GIN index
│
├── services/                      # Pure-Python business logic (no Django coupling)
│   ├── crawler/
│   │   ├── apis/
│   │   │   ├── kaggle/            # Kaggle API fetcher (kaggle_service.py)
│   │   │   └── europa/            # Europa SPARQL API fetcher (fetch_europe)
│   │   └── scrapy/
│   │       └── dataset_engine/    # Scrapy project for scraping data.gov
│   │           └── spiders/US_Gov.py
│   ├── search/                    # ← Search pipeline (the active service)
│   │   ├── query_processor.py     # spaCy NLP: raw query → tsquery string
│   │   └── retrieval.py           # ORM search: tsquery → ranked Dataset rows
│   ├── parser/parse.py            # 🚧 Stub (not implemented)
│   ├── scoring/score.py           # 🚧 Stub (not implemented)
│   └── task-queue/tasks.py        # 🚧 Stub (not implemented)
│
├── docs/                          # ← You are here
│   ├── architecture.md            # This file
│   ├── services.md                # services/ deep-dive
│   └── api.md                     # HTTP API reference
│
├── requirements.txt               # Pinned Python dependencies
└── .env                           # Local secrets (DATABASE_URL, KAGGLE_API_TOKEN)
```

---

## Data flow

### Search request (live)
```
Client GET /api/search?q=...
  └─► views.search()
        └─► retrieval.search_datasets(raw_query)
              ├─► query_processor.process_query(raw_query)
              │     └─► spaCy: tokenize → lemmatize → filter stop words
              │           → "climate & change & dataset"
              └─► Django ORM: SearchQuery + SearchRank on search_vector (GIN index)
                    → ranked list of Dataset rows → JSON response
```

### Crawl pipeline (manual / offline)
```
Run a crawler script manually
  └─► Fetch metadata from Kaggle API / Europa SPARQL / data.gov (Scrapy)
        └─► Normalize to { title, description, source_url, tags, resources }
              └─► Dataset.objects.update_or_create(source_url=..., defaults=...)
                    └─► Postgres (Supabase) — search_vector auto-updated by generated column trigger
```

---

## Database

- **Provider**: Supabase (hosted PostgreSQL)
- **Connection**: via `DATABASE_URL` in `.env`, parsed by `dj-database-url`
- **Table**: `searchEngine_dataset` (Django auto-names it from `<app>_<model>`)
- **Full-text index**: `search_vector` — a STORED GENERATED tsvector column.
  Postgres recomputes it automatically on every INSERT/UPDATE. Agents must NOT
  write to this column manually.

### Dataset schema

| Column         | Type         | Notes                                        |
|----------------|--------------|----------------------------------------------|
| `id`           | bigint PK    | Auto-increment                               |
| `title`        | text         | Required                                     |
| `description`  | text         | Optional (blank allowed)                     |
| `source_url`   | varchar(2000)| Unique — used as upsert key                  |
| `tags`         | jsonb        | List of lowercase strings                    |
| `resources`    | jsonb        | List of `{name, format, url}` objects        |
| `source`       | varchar(50)  | `'kaggle'` \| `'us_gov'` \| `'europa'`      |
| `created_at`   | timestamptz  | Auto-set on insert                           |
| `search_vector`| tsvector     | STORED GENERATED — title (weight A) + description (weight B) |

---

## Environment variables

| Variable           | Required | Description                                    |
|--------------------|----------|------------------------------------------------|
| `DATABASE_URL`     | Yes      | Full Postgres connection string (Supabase)     |
| `KAGGLE_API_TOKEN` | For crawl | Kaggle API token for `kaggle_service.py`       |

> **Note for agents:** Never commit `.env`. The `.env.example` file documents required variables (currently empty — fill it in when adding new vars).

---

## Running the dev server

```bash
cd backend/django
../.venv/bin/python manage.py runserver
```

Server starts at `http://localhost:8000`.

## Applying migrations

```bash
cd backend/django
../.venv/bin/python manage.py migrate
```

> Requires Supabase to be reachable. Will hang silently on restricted networks (e.g. school WiFi that blocks port 6543).

## Running a crawler

```bash
cd backend

# Kaggle (writes directly to DB)
.venv/bin/python services/crawler/apis/kaggle/kaggle_service.py

# Europa (saves to engine_ready_output.json locally — DB write not yet wired)
.venv/bin/python services/crawler/apis/europa/fetch_europe

# US Gov via Scrapy
cd services/crawler/scrapy
scrapy crawl US_Gov
```

---

## Key design decisions agents should know

1. **`services/` is Django-free by design.** `query_processor.py` has zero Django imports. Only `retrieval.py` imports Django ORM — and it does so at the top of the module, relying on Django already being configured (which `settings.py` ensures). Do not add Django imports to `query_processor.py`.

2. **`sys.path` injection is in `settings.py`**, not scattered in views. `settings.py` adds `backend/services/` to `sys.path` at startup so `from search.retrieval import ...` just works everywhere. Do not replicate this in individual files.

3. **`search_vector` is a STORED GENERATED column.** Postgres handles it. The Django `SearchVectorField` on the model is read-only (`editable=False`). Migration `0002` used `SeparateDatabaseAndState` to avoid ORM drift. Do not add it to `makemigrations` output.

4. **The Scrapy pipeline (`pipelines.py`) is a stub.** The US_Gov spider yields items but nothing saves them to the DB yet. The Kaggle and Europa crawlers write directly to the DB. This inconsistency is a known gap.
