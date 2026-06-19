"""
retrieval.py
------------
Executes full-text search against the Dataset table using the processed query
from query_processor.py.

Uses Django's django.contrib.postgres SearchQuery/SearchRank for ORM-native
Postgres full-text search against the 'search_vector' generated column.

Falls back to a case-insensitive title/description contains search when the
NLP pipeline returns an empty string (e.g. query was all stop words).

NOTE: This module requires a configured Django environment. When called from a
Django view (the normal path), Django is already set up. For standalone use,
run via `python manage.py shell` or set DJANGO_SETTINGS_MODULE before importing.
"""

from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import F
from searchEngine.models import Dataset

from .query_processor import process_query


def search_datasets(raw_query: str, limit: int = 20) -> dict:
    """
    Search the Dataset table using PostgreSQL full-text search.

    Strategy:
      1. Run raw_query through process_query() to get a tsquery string.
      2. If the result is non-empty, use SearchQuery + SearchRank against
         the pre-computed search_vector GIN-indexed column.
      3. If process_query returns empty (all stop words / too short), fall
         back to a plain icontains search on title and description.

    Args:
        raw_query: The raw string typed by the user.
        limit:     Max number of results to return (default 20).

    Returns:
        A dict with keys: query, processed_query, count, results.
    """
    processed = process_query(raw_query)

    if processed:
        # Full-text search using the pre-built search_vector column
        search_query = SearchQuery(processed, search_type="raw", config="english")
        qs = (
            Dataset.objects.annotate(rank=SearchRank(F("search_vector"), search_query))
            .filter(search_vector=search_query)
            .order_by("-rank")[:limit]
        )
    else:
        # Fallback: plain substring match on title + description
        qs = (
            Dataset.objects.filter(title__icontains=raw_query)
            | Dataset.objects.filter(description__icontains=raw_query)
        )[:limit]

    results = [_serialize(ds) for ds in qs]

    return {
        "query": raw_query,
        "processed_query": processed or raw_query,
        "count": len(results),
        "results": results,
    }


def _serialize(ds: Dataset) -> dict:
    """Serialize a Dataset model instance to a JSON-safe dict."""
    return {
        "id": ds.id,
        "title": ds.title,
        "description": ds.description,
        "source_url": ds.source_url,
        "tags": ds.tags,
        "resources": ds.resources,
        "source": ds.source,
        "created_at": ds.created_at.isoformat() if ds.created_at else None,
    }
