# Migration — adds PostgreSQL full-text search vector to Dataset.
#
# Uses SeparateDatabaseAndState so that:
#   - The DATABASE gets a true STORED GENERATED tsvector column + GIN index
#     (maintained automatically by Postgres on INSERT/UPDATE).
#   - Django's migration STATE is updated with SearchVectorField + GinIndex
#     so that `makemigrations` never sees drift.
#
# To apply: python manage.py migrate

from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("searchEngine", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            # --- DATABASE side: raw SQL for STORED GENERATED column + GIN index ---
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE "searchEngine_dataset"
                        ADD COLUMN IF NOT EXISTS search_vector tsvector
                        GENERATED ALWAYS AS (
                            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
                            setweight(to_tsvector('english', coalesce(description, '')), 'B')
                        ) STORED;
                    """,
                    reverse_sql="""
                        ALTER TABLE "searchEngine_dataset"
                        DROP COLUMN IF EXISTS search_vector;
                    """,
                ),
                migrations.RunSQL(
                    sql="""
                        CREATE INDEX IF NOT EXISTS searchengine_dataset_search_vector_gin
                        ON "searchEngine_dataset"
                        USING GIN (search_vector);
                    """,
                    reverse_sql="""
                        DROP INDEX IF EXISTS searchengine_dataset_search_vector_gin;
                    """,
                ),
            ],
            # --- STATE side: tell Django's ORM about the field + index ---
            state_operations=[
                migrations.AddField(
                    model_name="dataset",
                    name="search_vector",
                    field=SearchVectorField(null=True, editable=False),
                ),
                migrations.AddIndex(
                    model_name="dataset",
                    index=GinIndex(fields=["search_vector"], name="searchengine_dataset_search_vector_gin"),
                ),
            ],
        ),
    ]

