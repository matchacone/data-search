from django.http import JsonResponse
from django.views.decorators.http import require_GET

from search.retrieval import search_datasets


def home(request):
    return JsonResponse({"status": "ok", "message": "DataSearch API is running."})


@require_GET
def search(request):
    """
    GET /api/search?q=<query>[&limit=<n>]

    Returns a JSON payload:
    {
        "query": "<raw query>",
        "processed_query": "<lemmatized tsquery string>",
        "count": <int>,
        "results": [
            {
                "id": <int>,
                "title": "<str>",
                "description": "<str>",
                "source_url": "<url>",
                "tags": [...],
                "resources": [...],
                "source": "<str>",
                "created_at": "<iso8601>"
            },
            ...
        ]
    }
    """
    raw_query = request.GET.get("q", "").strip()

    if not raw_query:
        return JsonResponse(
            {"error": "Missing required query parameter 'q'."},
            status=400,
        )

    try:
        limit = int(request.GET.get("limit", 20))
        limit = max(1, min(limit, 100))  # clamp to [1, 100]
    except (ValueError, TypeError):
        limit = 20

    try:
        payload = search_datasets(raw_query, limit=limit)
        return JsonResponse(payload, safe=False)
    except Exception as exc:
        return JsonResponse(
            {"error": "Search failed.", "detail": str(exc)},
            status=500,
        )
