Update logs:

5/13/2026
- Project Initialization
    - initialized Next.js project
    - initialized Django project
    - services folder

5/28/2026
- Scrapy Initialized (Crawler)
- US Gov data set spider working

5/29/2026
- Europa scraped thru API

5/31/2026
- fetching datasets from kaggle thru API

5/29/2026
- Worked on backend
    - Connected Supabase to Django

6/11/2026
- Scraped 1000 datasets from kaggle
- Models made in Supabase

6/18/2026
- Built query processor (spaCy NLP)
    - tokenize, lemmatize, stop word removal → PostgreSQL tsquery string
- Built search retrieval layer
    - SearchQuery + SearchRank against search_vector GIN index
    - icontains fallback for stop-word-only queries
- Added GET /api/search?q=...&limit=N endpoint to Django
- Added search_vector STORED GENERATED tsvector column + GIN index (migration 0002)
- Added django-cors-headers for frontend access
- Wrote backend docs (docs/architecture.md, docs/services.md, docs/api.md)

6/19/2026
- Tested everything end-to-end against live Supabase DB
    - Migration applied successfully
    - /api/search returning real ranked results
    - Edge cases verified (missing q → 400, stop-word fallback, limit clamping)

WIP:
- Crawler
    - Wire Europa crawler output to DB (currently saves to local JSON only)
    - Wire Scrapy pipeline to DB (currently a stub — items not saved)
    - Loop Europa scraper through all datasets (currently LIMIT 100)
    - Look for more data sources to crawl
- Backend
    - Source filtering on /api/search (e.g. ?source=kaggle)
    - Pagination on /api/search (offset param)
    - parser/parse.py — normalize raw crawler output
    - scoring/score.py — re-rank results (freshness, popularity)
    - task-queue/tasks.py — scheduled crawler jobs
- Frontend