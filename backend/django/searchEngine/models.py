from django.db import models
from django.contrib.postgres.search import SearchVectorField

# Create your models here.
from django.db import models
class Dataset(models.Model):
    title       = models.TextField()
    description = models.TextField(blank=True)
    source_url  = models.URLField(unique=True, max_length=2000)
    tags        = models.JSONField(default=list)
    resources   = models.JSONField(default=list)  # [{ name, format, url }]
    source      = models.CharField(max_length=50)  # 'kaggle', 'us_gov', 'europa'
    created_at  = models.DateTimeField(auto_now_add=True)
    # Maintained by Postgres as a STORED generated column (see migration 0002).
    # editable=False / null=True so Django never tries to write to it.
    search_vector = SearchVectorField(null=True, editable=False)

    def __str__(self):
        return self.title