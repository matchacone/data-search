# Django API Reference

> **For agents:** This file documents the HTTP API, the Django app structure, and conventions for adding new endpoints. Read `architecture.md` first.

---

## Running the server

```bash
cd backend/django
../.venv/bin/python manage.py runserver
# → http://localhost:8000
```

---

## Endpoints

### `GET /`

Health check.

**Response `200`:**
```json
{ "status": "ok", "message": "DataSearch API is running." }
```

---

### `GET /api/search`

Search datasets using spaCy NLP + PostgreSQL full-text search.

**Query parameters:**

| Parameter | Type   | Required | Default | Description                          |
|-----------|--------|----------|---------|--------------------------------------|
| `q`       | string | Yes      | —       | Raw search query                     |
| `limit`   | int    | No       | `20`    | Max results to return (clamped 1–100) |

**Response `200`:**
```json
{
  "query": "climate change",
  "processed_query": "climate & change",
  "count": 8,
  "results": [
    {
      "id": 42,
      "title": "Global Climate Change Indicators",
      "description": "Annual climate indicators across 195 countries...",
      "source_url": "https://catalog.data.gov/dataset/global-climate-change-indicators",
      "tags": ["climate", "environment", "global"],
      "resources": [
        { "name": "climate_data.csv", "format": "CSV", "url": "https://..." }
      ],
      "source": "us_gov",
      "created_at": "2026-06-10T16:42:00+00:00"
    }
  ]
}
```

**Response `400`** — missing `q`:
```json
{ "error": "Missing required query parameter 'q'." }
```

**Response `500`** — unexpected error:
```json
{ "error": "Search failed.", "detail": "<exception message>" }
```

**Example requests:**
```bash
# Normal search
curl "http://localhost:8000/api/search?q=climate+change"

# With limit
curl "http://localhost:8000/api/search?q=healthcare&limit=5"

# All stop words — triggers icontains fallback
curl "http://localhost:8000/api/search?q=the+and+or"
```

---

## Django app structure (`searchEngine/`)

```
searchEngine/
├── models.py      # Dataset model — the only model
├── views.py       # All HTTP views live here
├── urls.py        # URL patterns for this app
├── admin.py       # Admin registration (currently empty)
├── apps.py        # AppConfig
└── migrations/
    ├── 0001_initial.py         # Creates Dataset table
    └── 0002_search_vector.py   # Adds search_vector tsvector column + GIN index
```

### `models.py` — `Dataset`

The only model. Maps to the Supabase `searchEngine_dataset` table.

```python
class Dataset(models.Model):
    title         = models.TextField()
    description   = models.TextField(blank=True)
    source_url    = models.URLField(unique=True, max_length=2000)  # upsert key
    tags          = models.JSONField(default=list)                 # ["tag1", "tag2"]
    resources     = models.JSONField(default=list)                 # [{name, format, url}]
    source        = models.CharField(max_length=50)                # 'kaggle'|'us_gov'|'europa'
    created_at    = models.DateTimeField(auto_now_add=True)
    search_vector = SearchVectorField(null=True, editable=False)   # READ-ONLY — Postgres managed
```

> ⚠️ **Never write to `search_vector`.** It is a STORED GENERATED column managed by Postgres. Set `editable=False` is enforced; Django ORM will reject attempts to write it.

**Upsert pattern (used by crawlers):**
```python
Dataset.objects.update_or_create(
    source_url=item['source_url'],
    defaults={
        'title':       item['title'],
        'description': item['description'],
        'tags':        item['tags'],
        'resources':   item['resources'],
        'source':      'kaggle',  # or 'us_gov', 'europa'
    }
)
```

---

## Settings (`datasearch/settings.py`) — agent notes

Key non-default settings an agent should be aware of:

| Setting | Value | Why |
|---|---|---|
| `INSTALLED_APPS` includes `django.contrib.postgres` | Yes | Required for `SearchVectorField`, `SearchQuery`, `SearchRank` |
| `INSTALLED_APPS` includes `corsheaders` | Yes | Allows Next.js frontend to call the API cross-origin |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Dev convenience — tighten before production |
| `sys.path` injection | `backend/services/` added | So `from search.retrieval import ...` works in views |
| `DATABASE_URL` | from `.env` via `dj-database-url` | Supabase connection string |
| `MIDDLEWARE` | `CorsMiddleware` is **second** | Must be before `SessionMiddleware` per django-cors-headers docs |
| `conn_max_age=0` | Yes | Required for Supabase's transaction pooler (no persistent connections) |

---

## Migrations

### Running

```bash
cd backend/django
../.venv/bin/python manage.py migrate
```

### Creating new migrations

```bash
../.venv/bin/python manage.py makemigrations
```

### Current state

| Migration | What it does |
|---|---|
| `0001_initial` | Creates `searchEngine_dataset` table |
| `0002_search_vector` | Adds `search_vector` STORED GENERATED tsvector column + GIN index via `SeparateDatabaseAndState` |

> **Agent note on `0002`:** It uses `SeparateDatabaseAndState` — database_operations contain raw SQL (the GENERATED column), state_operations contain the ORM-level `AddField` + `AddIndex`. This is intentional. Do not let `makemigrations` replace it with an auto-generated migration; it cannot express STORED GENERATED columns.

---

## Adding a new endpoint

1. **Add the view** in `searchEngine/views.py`:
```python
@require_GET
def my_new_view(request):
    # ... logic ...
    return JsonResponse({...})
```

2. **Register the URL** in `searchEngine/urls.py`:
```python
path("api/my-endpoint", views.my_new_view, name="my_new_view"),
```

3. If the view needs a new service module, create it in `services/` (not inside `django/`), keeping it Django-free where possible.

4. The service will be importable from the view as `from <service_dir>.<module> import <func>` because `settings.py` adds `backend/services/` to `sys.path`.

---

## URL structure

| URL | View | Description |
|---|---|---|
| `/` | `views.home` | Health check |
| `/api/search` | `views.search` | Full-text dataset search |
| `/admin/` | Django admin | Admin panel |

The root URLconf (`datasearch/urls.py`) includes all `searchEngine.urls` at the root path (`""`).
