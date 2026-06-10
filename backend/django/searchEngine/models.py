from django.db import models

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
    def __str__(self):
        return self.title